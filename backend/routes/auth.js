const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');
const { getCollection, toObjectId, handleDatabaseError } = require('../middleware/mongoHelpers');

// Validation middleware
const { validateRequest, userValidationRules, loginValidationRules } = require('../middleware/validation');

// Register
router.post('/register', validateRequest(userValidationRules), async (req, res) => {
  try {
    console.log('👤 Registering user');
    
    // Ensure database is available
    if (!req.db) {
      console.error('❌ Register: Database not available');
      return res.status(500).json({
        success: false,
        message: 'Server error: Database connection not available'
      });
    }
    
    // Get JWT_SECRET with fallback (log warning if using default)
    const jwtSecret = process.env.JWT_SECRET || 'balan-coffee-secret-2024';
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ Register: JWT_SECRET not configured, using default (not recommended for production)');
    }
    
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

    // Get users collection
    const usersCollection = getCollection(req, 'users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      // If user exists but email is not verified, allow re-registration
      if (!existingUser.emailVerified) {
        // Delete the old unverified user and create a new one
        await usersCollection.deleteOne({ email: email.toLowerCase() });
        console.log('🔄 Deleted unverified user account for re-registration:', email);
      } else {
        // User exists and is verified
        console.log('❌ User already exists and verified:', email);
        return res.status(400).json({ 
          error: 'Tài khoản với email này đã tồn tại và đã được xác thực. Vui lòng đăng nhập hoặc sử dụng email khác.' 
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const verificationToken = jwt.sign(
      { email },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Prepare user data
    const userData = {
      email: email.toLowerCase(),
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
      emailVerificationExpires: new Date(Date.now() + 24 * 3600000), // 24 hours
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add optional fields if provided
    if (dateOfBirth) userData.dateOfBirth = new Date(dateOfBirth);
    if (gender) userData.gender = gender;

    // Add addresses array if provided
    if (address || city || province) {
      userData.addresses = [{
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
      }];
    } else {
      userData.addresses = [];
    }

    // Create user
    const result = await usersCollection.insertOne(userData);
    
    if (!result.insertedId) {
      console.log('❌ Failed to create user in database');
      return res.status(500).json({ error: 'Failed to create user account' });
    }

    console.log('✅ User created successfully with ID:', result.insertedId);

    // Create verification link
    const verificationLink = `${process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`}/verify-email?token=${verificationToken}`;
    
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
    console.error('❌ Register error:', error);
    return handleDatabaseError(error, res, 'User registration');
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Ensure database is available before passport authentication
  if (!req.db) {
    console.error('❌ Auth: Database not available for login');
    return res.status(500).json({ error: 'Server error: Database connection not available' });
  }

  console.log('✅ Auth: Database available for login, proceeding with authentication');

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      console.error('❌ Auth: Login error:', err);
      return res.status(500).json({ error: 'Login failed', message: err.message || 'Internal server error' });
    }

    if (!user) {
      console.log('❌ Auth: Authentication failed:', info?.message);
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
    const jwtSecret = process.env.JWT_SECRET || 'balan-coffee-secret-2024';
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ Login: JWT_SECRET not configured, using default (not recommended for production)');
    }

    const token = jwt.sign(
      { userId: user._id || user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('✅ Auth: Login successful for user:', user.email);

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
    console.log('👤 Getting current user');
    
    // Get users collection
    const usersCollection = getCollection(req, 'users');

    // Get user without password - handle both ObjectId and string _id formats
    console.log('🔍 Auth: User ID from token:', req.user.userId);
    console.log('🔍 Auth: User ID type:', typeof req.user.userId);
    
    // Try both ObjectId and string ID formats for user lookup
    let user = null;
    try {
        // First try as ObjectId if it matches the format
        if (typeof req.user.userId === 'string' && req.user.userId.match(/^[0-9a-fA-F]{24}$/)) {
            const objectId = toObjectId(req.user.userId);
            user = await usersCollection.findOne(
                { _id: objectId },
                { projection: { password: 0 } }
            );
            console.log('🔍 Auth /me: Tried ObjectId lookup:', !!user);
        }
    } catch (error) {
        console.log('⚠️ Auth /me: ObjectId lookup failed, trying string lookup');
    }
    
    // If ObjectId lookup failed or user ID is not ObjectId format, try string lookup
    if (!user) {
        user = await usersCollection.findOne(
            { _id: req.user.userId },
            { projection: { password: 0 } }
        );
        console.log('🔍 Auth /me: Tried string ID lookup:', !!user);
    }

    if (!user) {
      console.log('❌ User not found:', req.user.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Add id field for frontend compatibility
    const userWithId = { ...user, id: user._id.toString() };

    console.log('✅ User retrieved successfully:', user.email);
    res.json({ user: userWithId });

  } catch (error) {
    console.error('❌ Get user error:', error);
    return handleDatabaseError(error, res, 'Get current user');
  }
});

// Update user profile (protected route)
router.put('/profile', authenticateToken, [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('phone').optional().isMobilePhone('vi-VN').withMessage('Invalid phone number'),
], async (req, res) => {
  try {
    console.log('👤 Updating user profile');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone, address, city, postalCode } = req.body;

    // Get users collection
    const usersCollection = getCollection(req, 'users');

    // Update user profile
    const updateData = {
      firstName,
      lastName,
      fullName: `${lastName} ${firstName}`,
      phone: phone || undefined,
      address: address || undefined,
      city: city || undefined,
      postalCode: postalCode || undefined,
      updatedAt: new Date()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Handle both ObjectId and string _id formats
    let query;
    if (ObjectId.isValid(req.user.userId) && req.user.userId.length === 24) {
      query = { _id: new ObjectId(req.user.userId) };
    } else {
      query = { _id: req.user.userId };
    }

    const result = await usersCollection.updateOne(
      query,
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      console.log('❌ User not found for profile update:', req.user.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Get updated user data
    const updatedUser = await usersCollection.findOne(
      query, // Use the same query as above
      { 
        projection: { 
          password: 0,
          emailVerificationToken: 0,
          resetPasswordToken: 0
        } 
      }
    );

    // Add id field for frontend compatibility
    const userWithId = { ...updatedUser, id: updatedUser._id.toString() };

    console.log('✅ Profile updated successfully for user:', updatedUser.email);
    res.json({
      message: 'Profile updated successfully',
      user: userWithId
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    return handleDatabaseError(error, res, 'Update user profile');
  }
});

// Change password (protected route)
router.put('/password', authenticateToken, [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  try {
    console.log('👤 Changing password');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get users collection
    const usersCollection = getCollection(req, 'users');

    // Get current user with password - handle both ObjectId and string _id formats
    let query;
    if (ObjectId.isValid(req.user.userId) && req.user.userId.length === 24) {
      query = { _id: new ObjectId(req.user.userId) };
    } else {
      query = { _id: req.user.userId };
    }
    
    const user = await usersCollection.findOne(
      query,
      { projection: { password: 1 } }
    );

    if (!user) {
      console.log('❌ User not found for password change:', req.user.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.password) {
      console.log('❌ No password set for user:', req.user.userId);
      return res.status(400).json({ error: 'Cannot change password for social login accounts' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('❌ Current password incorrect for user:', req.user.userId);
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const result = await usersCollection.updateOne(
      query, // Use the same query as above
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.log('❌ Failed to update password for user:', req.user.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Password updated successfully for user:', req.user.userId);
    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('❌ Change password error:', error);
    return handleDatabaseError(error, res, 'Change password');
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Debug endpoint to check JWT token (temporary)
router.get('/debug-token', async (req, res) => {
    try {
        console.log('👤 Debug token');
        
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
        
        // Get users collection
        const usersCollection = getCollection(req, 'users');
        
        // Check user in database - handle both ObjectId and string _id formats
        let query;
        if (ObjectId.isValid(decoded.userId) && decoded.userId.length === 24) {
          query = { _id: new ObjectId(decoded.userId) };
        } else {
          query = { _id: decoded.userId };
        }
        
        const user = await usersCollection.findOne(
            query,
            { 
                projection: { 
                    email: 1, 
                    firstName: 1, 
                    lastName: 1, 
                    role: 1, 
                    status: 1,
                    emailVerified: 1
                } 
            }
        );
        
        console.log('User query result:', user);
        
        res.json({
            success: true,
            decoded: decoded,
            user: user ? { ...user, id: user._id.toString() } : null,
            userFound: !!user
        });
        
    } catch (error) {
        console.error('❌ Debug token error:', error);
        return handleDatabaseError(error, res, 'Debug token');
    }
});

// Forgot Password
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Email không hợp lệ')
], async (req, res) => {
    try {
        console.log('🔐 Forgot password request received');
        console.log('   Method:', req.method);
        console.log('   URL:', req.originalUrl);
        console.log('   Body:', { email: req.body.email }); // Don't log sensitive data
        
        // Ensure database is available
        if (!req.db) {
            console.error('❌ Forgot password: Database not available');
            return res.status(500).json({
                success: false,
                message: 'Server error: Database connection not available'
            });
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: errors.array()
            });
        }

        const { email } = req.body;
        console.log('🔐 Forgot password request for email:', email);

        // Get users collection
        const usersCollection = getCollection(req, 'users');

        // Check if user exists
        const user = await usersCollection.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            // Don't reveal if email exists or not for security
            console.log('⚠️ Forgot password: User not found, but returning success for security');
            return res.json({
                success: true,
                message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.'
            });
        }

        // Get JWT_SECRET with fallback
        const jwtSecret = process.env.JWT_SECRET || 'balan-coffee-secret-2024';
        if (!process.env.JWT_SECRET) {
          console.warn('⚠️ Forgot password: JWT_SECRET not configured, using default (not recommended for production)');
        }

        // Generate reset token (you can use crypto.randomBytes or jwt)
        const resetToken = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            jwtSecret,
            { expiresIn: '1h' }
        );

        // Store reset token and expiry in user document
        await usersCollection.updateOne(
            { _id: user._id },
            { 
                $set: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
                    updatedAt: new Date()
                }
            }
        );

        console.log('✅ Reset token generated for user:', user.email);

        // Create reset link
        const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
        
        console.log('🔗 Reset link generated (not logged in production)');
        
        // Send email with reset link
        try {
            const emailResult = await emailService.sendForgotPasswordEmail(
                user.email, 
                resetLink, 
                user.fullName || user.firstName || 'Quý khách'
            );
            
            if (emailResult.success) {
                console.log('✅ Forgot password email sent successfully to:', user.email);
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
        console.error('❌ Forgot password error:', error);
        return handleDatabaseError(error, res, 'Forgot password');
    }
});

// Verify Reset Token
router.post('/verify-reset-token', [
    body('token').notEmpty().withMessage('Token là bắt buộc')
], async (req, res) => {
    try {
        console.log('🔐 Verify reset token request received');
        
        // Ensure database is available
        if (!req.db) {
            console.error('❌ Verify reset token: Database not available');
            return res.status(500).json({
                success: false,
                message: 'Server error: Database connection not available'
            });
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }

        const { token } = req.body;
        
        // Get JWT_SECRET with fallback
        const jwtSecret = process.env.JWT_SECRET || 'balan-coffee-secret-2024';
        if (!process.env.JWT_SECRET) {
          console.warn('⚠️ Verify reset token: JWT_SECRET not configured, using default');
        }

        // Get users collection
        const usersCollection = getCollection(req, 'users');

        // Verify token
        const decoded = jwt.verify(token, jwtSecret);
        console.log('🔍 Verify Token: Decoded userId:', decoded.userId, 'Type:', typeof decoded.userId);
        
        // Check if user exists and token is still valid
        // Try both ObjectId and string ID formats for user lookup
        let user = null;
        try {
            // First try as ObjectId if it matches the format
            if (typeof decoded.userId === 'string' && decoded.userId.match(/^[0-9a-fA-F]{24}$/)) {
                const objectId = toObjectId(decoded.userId);
                user = await usersCollection.findOne({ _id: objectId });
                console.log('🔍 Verify Token: Tried ObjectId lookup:', !!user);
            }
        } catch (error) {
            console.log('⚠️ Verify Token: ObjectId lookup failed, trying string lookup');
        }
        
        // If ObjectId lookup failed or user ID is not ObjectId format, try string lookup
        if (!user) {
            user = await usersCollection.findOne({ _id: decoded.userId });
            console.log('🔍 Verify Token: Tried string ID lookup:', !!user);
        }
        
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
        console.error('❌ Verify reset token error:', error);
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
        console.log('🔐 Reset password request received');
        
        // Ensure database is available
        if (!req.db) {
            console.error('❌ Reset password: Database not available');
            return res.status(500).json({
                success: false,
                message: 'Server error: Database connection not available'
            });
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: errors.array()
            });
        }

        const { token, newPassword } = req.body;
        
        // Get JWT_SECRET with fallback
        const jwtSecret = process.env.JWT_SECRET || 'balan-coffee-secret-2024';
        if (!process.env.JWT_SECRET) {
          console.warn('⚠️ Reset password: JWT_SECRET not configured, using default');
        }

        // Get users collection
        const usersCollection = getCollection(req, 'users');

        // Verify token
        const decoded = jwt.verify(token, jwtSecret);
        console.log('🔍 Reset Password: Decoded userId:', decoded.userId, 'Type:', typeof decoded.userId);
        
        // Check if user exists and token is still valid
        // Try both ObjectId and string ID formats for user lookup
        let user = null;
        try {
            // First try as ObjectId if it matches the format
            if (typeof decoded.userId === 'string' && decoded.userId.match(/^[0-9a-fA-F]{24}$/)) {
                const objectId = toObjectId(decoded.userId);
                user = await usersCollection.findOne({ _id: objectId });
                console.log('🔍 Reset Password: Tried ObjectId lookup:', !!user);
            }
        } catch (error) {
            console.log('⚠️ Reset Password: ObjectId lookup failed, trying string lookup');
        }
        
        // If ObjectId lookup failed or user ID is not ObjectId format, try string lookup
        if (!user) {
            user = await usersCollection.findOne({ _id: decoded.userId });
            console.log('🔍 Reset Password: Tried string ID lookup:', !!user);
        }
        
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
        await usersCollection.updateOne(
            { _id: user._id },
            { 
                $set: {
                    password: hashedPassword,
                    updatedAt: new Date()
                },
                $unset: {
                    resetPasswordToken: "",
                    resetPasswordExpires: ""
                }
            }
        );

        console.log('✅ Password reset successful for user:', user.email);

        res.json({
            success: true,
            message: 'Mật khẩu đã được đặt lại thành công'
        });

    } catch (error) {
        console.error('❌ Reset password error:', error);
        return handleDatabaseError(error, res, 'Reset password');
    }
});

// Verify Email
router.post('/verify-email', [
    body('token').notEmpty().withMessage('Token là bắt buộc')
], async (req, res) => {
    try {
        console.log('🔐 Verify email request received');
        
        // Ensure database is available
        if (!req.db) {
            console.error('❌ Verify email: Database not available');
            return res.status(500).json({
                success: false,
                message: 'Server error: Database connection not available'
            });
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }

        const { token } = req.body;
        
        // Get JWT_SECRET with fallback
        const jwtSecret = process.env.JWT_SECRET || 'balan-coffee-secret-2024';
        if (!process.env.JWT_SECRET) {
          console.warn('⚠️ Verify email: JWT_SECRET not configured, using default');
        }

        // Get users collection
        const usersCollection = getCollection(req, 'users');

        // Verify token
        const decoded = jwt.verify(token, jwtSecret);
        
        // Check if user exists and token is still valid
        const user = await usersCollection.findOne({ email: decoded.email });
        
        if (!user) {
            console.log('❌ Verification failed: User not found for email:', decoded.email);
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
        await usersCollection.updateOne(
            { _id: user._id },
            { 
                $set: {
                    emailVerified: true,
                    status: 'active',
                    updatedAt: new Date()
                },
                $unset: {
                    emailVerificationToken: "",
                    emailVerificationExpires: ""
                }
            }
        );

        console.log('✅ Email verification successful for user:', user.email);

        // Use the same jwtSecret for login token (already validated above)
        // Generate JWT token for login
        const loginToken = jwt.sign(
            { userId: user._id.toString(), email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            message: 'Email đã được xác thực thành công! Chào mừng bạn đến với Balan Coffee.',
            token: loginToken,
            user: {
                _id: user._id,
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                emailVerified: true
            }
        });

    } catch (error) {
        console.error('❌ Email verification error:', error);
        return handleDatabaseError(error, res, 'Email verification');
    }
});

// Resend Email Verification
router.post('/resend-verification', [
    body('email').isEmail().withMessage('Email không hợp lệ')
], async (req, res) => {
    try {
        console.log('🔐 Resend verification email request received');
        
        // Ensure database is available
        if (!req.db) {
            console.error('❌ Resend verification: Database not available');
            return res.status(500).json({
                success: false,
                message: 'Server error: Database connection not available'
            });
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ'
            });
        }

        const { email } = req.body;
        
        // Get JWT_SECRET with fallback
        const jwtSecret = process.env.JWT_SECRET || 'balan-coffee-secret-2024';
        if (!process.env.JWT_SECRET) {
          console.warn('⚠️ Resend verification: JWT_SECRET not configured, using default');
        }

        // Get users collection
        const usersCollection = getCollection(req, 'users');

        // Find user
        const user = await usersCollection.findOne({ email: email.toLowerCase() });
        
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
            { email: user.email },
            jwtSecret,
            { expiresIn: '24h' }
        );

        // Update user with new token
        await usersCollection.updateOne(
            { _id: user._id },
            { 
                $set: {
                    emailVerificationToken: verificationToken,
                    emailVerificationExpires: new Date(Date.now() + 24 * 3600000), // 24 hours
                    updatedAt: new Date()
                }
            }
        );

        // Create verification link
        const verificationLink = `${process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`}/verify-email?token=${verificationToken}`;
        
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
        console.error('❌ Resend verification error:', error);
        return handleDatabaseError(error, res, 'Resend verification');
    }
});

module.exports = router;
