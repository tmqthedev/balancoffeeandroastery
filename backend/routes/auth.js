const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

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
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare user data
    const userData = {
      _id: userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || undefined,
      role: 'customer',
      status: 'active',
      emailVerified: false,
      phoneVerified: false
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
        firstName: firstName,
        lastName: lastName,
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      }
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

// Facebook OAuth routes (only if configured)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
  router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => {
      try {
        if (!req.user) {
          console.error('Facebook callback - No user returned');
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          return res.redirect(`${frontendUrl}/auth/callback?error=no_user`);
        }

        const token = jwt.sign(
          { userId: req.user.id, email: req.user.email, role: req.user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        console.log('Facebook callback successful for user:', req.user.email);
        
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('Facebook callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?error=callback_failed`);
      }
    }
  );

  // Facebook token verification endpoint for SDK login
  router.post('/facebook/token', async (req, res) => {
    try {
      const { accessToken, userID } = req.body;

      if (!accessToken || !userID) {
        return res.status(400).json({ error: 'Access token and user ID are required' });
      }

      // Verify the access token with Facebook
      const response = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`);
      const facebookUser = await response.json();

      if (facebookUser.error) {
        return res.status(401).json({ error: 'Invalid Facebook access token' });
      }

      if (facebookUser.id !== userID) {
        return res.status(401).json({ error: 'User ID mismatch' });
      }

      // Check if user exists in database
      let users = await db.query(
        'SELECT * FROM Users WHERE facebookId = @facebookId AND isActive = 1',
        { facebookId: facebookUser.id }
      );

      let user;

      if (users.length > 0) {
        // Existing user
        user = users[0];
      } else {
        // Check if user exists with same email
        if (facebookUser.email) {
          const emailUsers = await db.query(
            'SELECT * FROM Users WHERE email = @email AND isActive = 1',
            { email: facebookUser.email }
          );

          if (emailUsers.length > 0) {
            // Link Facebook to existing account
            await db.execute(
              'UPDATE Users SET facebookId = @facebookId, profileImage = @profileImage WHERE email = @email',
              {
                facebookId: facebookUser.id,
                profileImage: facebookUser.picture?.data?.url || null,
                email: facebookUser.email
              }
            );

            const updatedUsers = await db.query(
              'SELECT * FROM Users WHERE email = @email AND isActive = 1',
              { email: facebookUser.email }
            );
            user = updatedUsers[0];
          } else {
            // Create new user
            const nameParts = facebookUser.name?.split(' ') || ['Facebook', 'User'];
            const firstName = nameParts[0] || 'Facebook';
            const lastName = nameParts.slice(1).join(' ') || 'User';

            const result = await db.execute(
              `INSERT INTO Users (email, firstName, lastName, facebookId, profileImage, emailVerified, role, isActive)
               OUTPUT INSERTED.* 
               VALUES (@email, @firstName, @lastName, @facebookId, @profileImage, 1, 'customer', 1)`,
              {
                email: facebookUser.email,
                firstName,
                lastName,
                facebookId: facebookUser.id,
                profileImage: facebookUser.picture?.data?.url || null
              }
            );

            user = result.recordset[0];
          }
        } else {
          return res.status(400).json({ error: 'No email provided by Facebook' });
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Remove password from user object
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;

      res.json({
        message: 'Facebook login successful',
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Facebook token verification error:', error);
      res.status(500).json({ error: 'Facebook authentication failed' });
    }
  });

  // Facebook authentication for official login button (POST)
  router.post('/facebook/callback', async (req, res) => {
    try {
      const { accessToken, userProfile } = req.body;

      if (!accessToken || !userProfile) {
        return res.status(400).json({ error: 'Access token and user profile are required' });
      }

      // Verify the access token with Facebook (optional extra security)
      const verifyResponse = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`);
      const verifiedUser = await verifyResponse.json();

      if (verifiedUser.error || verifiedUser.id !== userProfile.id) {
        return res.status(401).json({ error: 'Invalid Facebook access token or user mismatch' });
      }

      // Use the userProfile data directly (already fetched by frontend)
      const facebookUser = userProfile;

      // Check if user exists in database
      let users = await db.query(
        'SELECT * FROM Users WHERE facebookId = @facebookId AND isActive = 1',
        { facebookId: facebookUser.id }
      );

      let user;

      if (users.length > 0) {
        // Existing user
        user = users[0];
      } else {
        // Check if user exists with same email
        if (facebookUser.email) {
          const emailUsers = await db.query(
            'SELECT * FROM Users WHERE email = @email AND isActive = 1',
            { email: facebookUser.email }
          );

          if (emailUsers.length > 0) {
            // Link Facebook to existing account
            await db.execute(
              'UPDATE Users SET facebookId = @facebookId, profileImage = @profileImage WHERE email = @email',
              {
                facebookId: facebookUser.id,
                profileImage: facebookUser.picture?.data?.url || null,
                email: facebookUser.email
              }
            );

            user = emailUsers[0];
          } else {
            // Create new user
            const [firstName, ...lastNameParts] = (facebookUser.name || '').split(' ');
            const lastName = lastNameParts.join(' ');

            const result = await db.execute(
              `INSERT INTO Users (email, firstName, lastName, facebookId, profileImage, emailVerified, role, isActive)
               OUTPUT INSERTED.*
               VALUES (@email, @firstName, @lastName, @facebookId, @profileImage, 1, 'customer', 1)`,
              {
                email: facebookUser.email,
                firstName: firstName || 'Facebook',
                lastName: lastName || 'User',
                facebookId: facebookUser.id,
                profileImage: facebookUser.picture?.data?.url || null
              }
            );

            user = result.recordset[0];
          }
        } else {
          return res.status(400).json({ error: 'No email provided by Facebook' });
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Remove password from user object
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;

      res.json({
        message: 'Facebook login successful',
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Facebook login error:', error);
      res.status(500).json({ error: 'Facebook authentication failed' });
    }
  });
} else {
  // Provide alternative routes when Facebook OAuth is not configured
  router.get('/facebook', (req, res) => {
    res.status(501).json({ 
      error: 'Facebook OAuth not configured',
      message: 'Please configure FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables'
    });
  });

  router.get('/facebook/callback', (req, res) => {
    res.status(501).json({ 
      error: 'Facebook OAuth not configured',
      message: 'Please configure FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables'
    });
  });

  router.post('/facebook/token', (req, res) => {
    res.status(501).json({ 
      error: 'Facebook OAuth not configured',
      message: 'Please configure FACEBOOK_APP_ID and FACEBOOK_APP_SECRET environment variables'
    });
  });
}

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

module.exports = router;
