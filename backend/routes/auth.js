const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');

// Validation middleware
const { validateRequest, userValidationRules, loginValidationRules } = require('../middleware/validation');

// Register
router.post('/register', validateRequest(userValidationRules), async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      fullName,
      phone,
      // Optional fields
      dateOfBirth,
      gender,
      address,
      city,
      province,
      postalCode
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If user exists but email is not verified, allow re-registration
      if (!existingUser.emailVerified) {
        // Delete the old unverified user and create a new one
        await User.deleteOne({ email });
        console.log('🔄 Deleted unverified user account for re-registration:', email);
      } else {
        // User exists and is verified
        return res.status(400).json({ 
          error: 'Tài khoản với email này đã tồn tại và đã được xác thực. Vui lòng đăng nhập hoặc sử dụng email khác.' 
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate email verification token
    const verificationToken = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'balan-coffee-secret',
      { expiresIn: '24h' }
    );

    // Prepare user data
    const userData = {
      _id: userId,
      email,
      password: hashedPassword,
      firstName: firstName || (fullName ? fullName.split(' ').pop() : ''),
      lastName: lastName || (fullName ? fullName.split(' ').slice(0, -1).join(' ') : ''),
      fullName: fullName || (firstName && lastName ? `${lastName} ${firstName}` : ''),
      phone: phone || undefined,
      role: 'customer',
      status: 'inactive', // User starts as inactive until email verification
      emailVerified: false,
      phoneVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 3600000) // 24 hours
    };

    // Add optional fields if provided
    if (dateOfBirth) userData.dateOfBirth = new Date(dateOfBirth);
    if (gender) userData.gender = gender;

    // Create user
    const newUser = new User(userData);

    // Add address if provided
    if (address || city || province) {
      const defaultAddress = {
        type: 'both',
        firstName: firstName || (fullName ? fullName.split(' ').pop() : ''),
        lastName: lastName || (fullName ? fullName.split(' ').slice(0, -1).join(' ') : ''),
        fullName: fullName || (firstName && lastName ? `${lastName} ${firstName}` : ''),
        address1: address || '',
        city: city || '',
        province: province || '',
        postalCode: postalCode || '',
        country: 'VN',
        phone: phone || undefined,
        isDefault: true
      };
      newUser.addresses.push(defaultAddress);
    }

    await newUser.save();

    // Create verification link
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    // Send email verification
    try {
      const emailResult = await emailService.sendEmailVerificationEmail(
        email, 
        verificationLink, 
        fullName || firstName || 'Quý khách'
      );
      
      if (emailResult.success) {
        console.log('✅ Email verification sent successfully to:', email);
      } else {
        console.error('❌ Failed to send verification email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Email service error:', emailError);
    }

    res.status(201).json({
      message: 'Tài khoản đã được tạo thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      requiresVerification: true,
      email: email,
      // For development purposes, include the verification link
      ...(process.env.NODE_ENV === 'development' && {
        verificationLink: verificationLink
      })
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Login failed' });
    }

    if (!user) {
      return res.status(401).json({ error: info.message || 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: 'Email chưa được xác thực',
        message: 'Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        error: 'Tài khoản chưa được kích hoạt',
        message: 'Tài khoản của bạn chưa được kích hoạt. Vui lòng liên hệ hỗ trợ.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id || user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user
    });

  })(req, res, next);
});



// Get current user (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Update user profile (protected route)
router.put('/profile', authenticateToken, [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('phone').optional().isMobilePhone('vi-VN').withMessage('Invalid phone number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone, address, city, postalCode } = req.body;

    await db.execute(
      `UPDATE Users 
       SET firstName = @firstName, lastName = @lastName, phone = @phone, 
           address = @address, city = @city, postalCode = @postalCode, 
           updatedAt = GETDATE()
       WHERE id = @userId`,
      {
        firstName,
        lastName,
        phone: phone || null,
        address: address || null,
        city: city || null,
        postalCode: postalCode || null,
        userId: req.user.userId
      }
    );

    // Get updated user data
    const users = await db.query(
      'SELECT id, email, firstName, lastName, phone, address, city, postalCode, role, profileImage, createdAt FROM Users WHERE id = @userId',
      { userId: req.user.userId }
    );

    res.json({
      message: 'Profile updated successfully',
      user: users[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password (protected route)
router.put('/password', authenticateToken, [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const users = await db.query(
      'SELECT password FROM Users WHERE id = @userId',
      { userId: req.user.userId }
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    if (!user.password) {
      return res.status(400).json({ error: 'Cannot change password for social login accounts' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.execute(
      'UPDATE Users SET password = @password, updatedAt = GETDATE() WHERE id = @userId',
      {
        password: hashedPassword,
        userId: req.user.userId
      }
    );

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Debug endpoint to check JWT token (temporary)
router.get('/debug-token', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided',
                authHeader: authHeader
            });
        }

        console.log('Token received:', token);
        console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        
        // Check user in database
        const userResult = await db.execute(
            'SELECT id, email, firstName, lastName, role, isActive FROM Users WHERE id = @userId',
            { userId: decoded.userId }
        );
        
        console.log('User query result:', userResult.recordset);
        
        res.json({
            success: true,
            decoded: decoded,
            user: userResult.recordset[0] || null,
            userCount: userResult.recordset.length
        });
        
    } catch (error) {
        console.error('Debug token error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            name: error.name
        });
    }
});

// Forgot Password
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Email không hợp lệ')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: errors.array()
            });
        }

        const { email } = req.body;
        console.log('🔐 Forgot password request for email:', email);

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.json({
                success: true,
                message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.'
            });
        }

        // Generate reset token (you can use crypto.randomBytes or jwt)
        const resetToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'balan-coffee-secret',
            { expiresIn: '1h' }
        );

        // Store reset token and expiry in user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        console.log('✅ Reset token generated for user:', user.email);

        // Create reset link
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        
        // Send email with reset link
        try {
            const emailResult = await emailService.sendForgotPasswordEmail(
                user.email, 
                resetLink, 
                user.fullName || user.firstName || 'Quý khách'
            );
            
            if (emailResult.success) {
                console.log('✅ Forgot password email sent successfully');
            } else {
                console.error('❌ Failed to send forgot password email:', emailResult.error);
            }
        } catch (emailError) {
            console.error('❌ Email service error:', emailError);
        }
        
        res.json({
            success: true,
            message: 'Email khôi phục mật khẩu đã được gửi đến địa chỉ email của bạn.',
            // For development purposes, include the reset link
            ...(process.env.NODE_ENV === 'development' && {
                resetLink: resetLink
            })
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xử lý yêu cầu'
        });
    }
});

// Verify Reset Token
router.post('/verify-reset-token', [
    body('token').notEmpty().withMessage('Token là bắt buộc')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }

        const { token } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'balan-coffee-secret');
        
        // Check if user exists and token is still valid
        const user = await User.findById(decoded.userId);
        
        if (!user || user.resetPasswordToken !== token || user.resetPasswordExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }

        res.json({
            success: true,
            message: 'Token hợp lệ'
        });

    } catch (error) {
        console.error('Verify token error:', error);
        res.status(400).json({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn'
        });
    }
});

// Reset Password
router.post('/reset-password', [
    body('token').notEmpty().withMessage('Token là bắt buộc'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: errors.array()
            });
        }

        const { token, newPassword } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'balan-coffee-secret');
        
        // Check if user exists and token is still valid
        const user = await User.findById(decoded.userId);
        
        if (!user || user.resetPasswordToken !== token || user.resetPasswordExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.log('✅ Password reset successful for user:', user.email);

        res.json({
            success: true,
            message: 'Mật khẩu đã được đặt lại thành công'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi đặt lại mật khẩu'
        });
    }
});

// Verify Email
router.post('/verify-email', [
    body('token').notEmpty().withMessage('Token là bắt buộc')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }

        const { token } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'balan-coffee-secret');
        
        // Check if user exists and token is still valid
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            console.log('❌ Verification failed: User not found for ID:', decoded.userId);
            return res.status(400).json({
                success: false,
                message: 'Token xác thực không hợp lệ hoặc đã hết hạn'
            });
        }

        if (user.emailVerified) {
            console.log('⚠️ Verification attempt for already verified user:', user.email);
            return res.status(400).json({
                success: false,
                message: 'Email đã được xác thực trước đó'
            });
        }

        if (user.emailVerificationToken !== token || user.emailVerificationExpires < new Date()) {
            console.log('❌ Verification failed: Invalid or expired token for user:', user.email);
            return res.status(400).json({
                success: false,
                message: 'Token xác thực không hợp lệ hoặc đã hết hạn'
            });
        }

        // Update user status
        user.emailVerified = true;
        user.status = 'active';
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        console.log('✅ Email verification successful for user:', user.email);

        // Generate JWT token for login
        const loginToken = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            message: 'Email đã được xác thực thành công! Chào mừng bạn đến với Balan Coffee.',
            token: loginToken,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                emailVerified: user.emailVerified
            }
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xác thực email'
        });
    }
});

// Resend Email Verification
router.post('/resend-verification', [
    body('email').isEmail().withMessage('Email không hợp lệ')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            // Don't reveal if email exists
            return res.json({
                success: true,
                message: 'Nếu email tồn tại và chưa được xác thực, bạn sẽ nhận được email xác thực mới.'
            });
        }

        // Check if already verified
        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email này đã được xác thực.'
            });
        }

        // Generate new verification token
        const verificationToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'balan-coffee-secret',
            { expiresIn: '24h' }
        );

        // Update user with new token
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 3600000); // 24 hours
        await user.save();

        // Create verification link
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
        
        // Send email verification
        try {
            const emailResult = await emailService.sendEmailVerificationEmail(
                user.email, 
                verificationLink, 
                user.fullName || user.firstName || 'Quý khách'
            );
            
            if (emailResult.success) {
                console.log('✅ Resend verification email sent successfully to:', user.email);
            } else {
                console.error('❌ Failed to resend verification email:', emailResult.error);
            }
        } catch (emailError) {
            console.error('❌ Email service error:', emailError);
        }

        res.json({
            success: true,
            message: 'Email xác thực mới đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
            // For development purposes
            ...(process.env.NODE_ENV === 'development' && {
                verificationLink: verificationLink
            })
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi gửi lại email xác thực'
        });
    }
});

module.exports = router;
