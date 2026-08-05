const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const { authenticateToken } = require('../middleware/auth');
const { getAuthCookies, setAuthCookies, clearAuthCookies } = require('../config/authCookies');
const cognitoService = require('../services/cognitoService');
const { getCollection, handleDatabaseError } = require('../middleware/mongoHelpers');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false;
  }

  return true;
}

function decodeJwtPayload(token) {
  if (!token) {
    return {};
  }

  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch (error) {
    return {};
  }
}

function publicUser(user) {
  if (!user) {
    return null;
  }

  const {
    password,
    emailVerificationToken,
    emailVerificationExpires,
    resetPasswordToken,
    resetPasswordExpires,
    ...safeUser
  } = user;

  return {
    ...safeUser,
    id: user._id?.toString?.() || user.id
  };
}

function getDisplayName({ fullName, firstName, lastName, email }) {
  return fullName || [lastName, firstName].filter(Boolean).join(' ').trim() || email;
}

async function upsertMongoProfile(req, data) {
  const usersCollection = getCollection(req, 'users');
  const email = data.email.toLowerCase();
  const now = new Date();

  const existingUser = await usersCollection.findOne({
    $or: [
      { cognitoSub: data.cognitoSub },
      { email }
    ].filter((condition) => Object.values(condition)[0])
  });

  const firstName = data.firstName || existingUser?.firstName || '';
  const lastName = data.lastName || existingUser?.lastName || '';
  const fullName = data.fullName || existingUser?.fullName || getDisplayName({ firstName, lastName, email });

  const update = {
    email,
    cognitoSub: data.cognitoSub || existingUser?.cognitoSub,
    firstName,
    lastName,
    fullName,
    phone: data.phone || existingUser?.phone,
    role: existingUser?.role || 'customer',
    status: data.status || existingUser?.status || 'inactive',
    emailVerified: !!data.emailVerified,
    phoneVerified: existingUser?.phoneVerified || false,
    addresses: existingUser?.addresses || [],
    updatedAt: now
  };

  Object.keys(update).forEach((key) => {
    if (update[key] === undefined) {
      delete update[key];
    }
  });

  if (existingUser) {
    await usersCollection.updateOne(
      { _id: existingUser._id },
      {
        $set: update,
        $unset: {
          password: '',
          emailVerificationToken: '',
          emailVerificationExpires: '',
          resetPasswordToken: '',
          resetPasswordExpires: ''
        }
      }
    );

    return usersCollection.findOne({ _id: existingUser._id });
  }

  const newUser = {
    ...update,
    createdAt: now
  };

  const result = await usersCollection.insertOne(newUser);
  return usersCollection.findOne({ _id: result.insertedId });
}

function sendCognitoError(res, error) {
  return res.status(error.statusCode || 400).json({
    success: false,
    error: error.message || 'Authentication request failed',
    code: error.name
  });
}

router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('fullName').optional().trim(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const {
      email,
      password,
      firstName,
      lastName,
      fullName,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      province,
      postalCode
    } = req.body;

    const signUpResult = await cognitoService.registerUser({
      email,
      password,
      firstName,
      lastName,
      fullName
    });

    const user = await upsertMongoProfile(req, {
      email,
      cognitoSub: signUpResult.userSub,
      firstName,
      lastName,
      fullName,
      phone,
      status: signUpResult.userConfirmed ? 'active' : 'inactive',
      emailVerified: !!signUpResult.userConfirmed
    });

    const usersCollection = getCollection(req, 'users');
    const optionalUpdate = {};
    if (dateOfBirth) optionalUpdate.dateOfBirth = new Date(dateOfBirth);
    if (gender) optionalUpdate.gender = gender;
    if (address || city || province) {
      optionalUpdate.addresses = [{
        type: 'both',
        firstName: firstName || '',
        lastName: lastName || '',
        fullName: fullName || getDisplayName({ firstName, lastName, email }),
        address1: address || '',
        city: city || '',
        province: province || '',
        postalCode: postalCode || '',
        country: 'VN',
        phone: phone || undefined,
        isDefault: true
      }];
    }

    if (Object.keys(optionalUpdate).length > 0) {
      await usersCollection.updateOne({ _id: user._id }, { $set: optionalUpdate });
    }

    res.status(201).json({
      success: true,
      message: 'Account created. Please check your email for the confirmation code.',
      requiresConfirmation: !signUpResult.userConfirmed,
      email: email.toLowerCase(),
      user: publicUser({ ...user, ...optionalUpdate })
    });
  } catch (error) {
    return sendCognitoError(res, error);
  }
});

router.post('/confirm-sign-up', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('code').notEmpty().withMessage('Confirmation code is required')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const email = req.body.email.toLowerCase();
    await cognitoService.confirmSignUp({ email, code: req.body.code });

    const usersCollection = getCollection(req, 'users');
    await usersCollection.updateOne(
      { email },
      {
        $set: {
          emailVerified: true,
          status: 'active',
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Email confirmed successfully. You can now log in.'
    });
  } catch (error) {
    return sendCognitoError(res, error);
  }
});

router.post('/resend-confirmation', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const result = await cognitoService.resendConfirmationCode({ email: req.body.email });

    res.json({
      success: true,
      message: 'Confirmation code sent.',
      codeDeliveryDetails: result.codeDeliveryDetails
    });
  } catch (error) {
    return sendCognitoError(res, error);
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
  body('rememberMe').optional().isBoolean()
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const email = req.body.email.toLowerCase();
    const tokens = await cognitoService.loginUser({
      email,
      password: req.body.password
    });

    const idPayload = decodeJwtPayload(tokens.IdToken);
    const user = await upsertMongoProfile(req, {
      email,
      cognitoSub: idPayload.sub,
      fullName: idPayload.name,
      status: 'active',
      emailVerified: !!idPayload.email_verified
    });

    setAuthCookies(res, tokens, email, !!req.body.rememberMe);

    res.json({
      success: true,
      message: 'Login successful',
      user: publicUser(user)
    });
  } catch (error) {
    return sendCognitoError(res, error);
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const cookies = getAuthCookies(req);

    if (!cookies.refreshToken || !cookies.email) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const tokens = await cognitoService.refreshTokens({
      refreshToken: cookies.refreshToken,
      email: cookies.email
    });

    setAuthCookies(res, {
      ...tokens,
      RefreshToken: tokens.RefreshToken || cookies.refreshToken
    }, cookies.email, cookies.rememberMe);

    res.json({
      success: true,
      message: 'Session refreshed'
    });
  } catch (error) {
    clearAuthCookies(res);
    return sendCognitoError(res, error);
  }
});

router.post('/logout', async (req, res) => {
  const cookies = getAuthCookies(req);

  try {
    if (cookies.accessToken || cookies.refreshToken) {
      await cognitoService.logoutUser({
        accessToken: cookies.accessToken,
        refreshToken: cookies.refreshToken,
        email: cookies.email
      });
    }
  } catch (error) {
    console.warn('Cognito logout failed, clearing local cookies anyway:', error.message);
  }

  clearAuthCookies(res);
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const usersCollection = getCollection(req, 'users');
    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.user.userId) },
      {
        projection: {
          password: 0,
          emailVerificationToken: 0,
          resetPasswordToken: 0
        }
      }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    return handleDatabaseError(error, res, 'Get current user');
  }
});

router.put('/profile', authenticateToken, [
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('fullName').optional().trim(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const usersCollection = getCollection(req, 'users');
    const { firstName, lastName, fullName, phone, address, city, postalCode } = req.body;

    const updateData = {
      firstName,
      lastName,
      fullName: fullName || [lastName, firstName].filter(Boolean).join(' ').trim(),
      phone,
      address,
      city,
      postalCode,
      updatedAt: new Date()
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    await usersCollection.updateOne(
      { _id: new ObjectId(req.user.userId) },
      { $set: updateData }
    );

    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.userId) });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: publicUser(user)
    });
  } catch (error) {
    return handleDatabaseError(error, res, 'Update user profile');
  }
});

router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const result = await cognitoService.forgotPassword({ email: req.body.email });

    res.json({
      success: true,
      message: 'If the email exists, a password reset code has been sent.',
      codeDeliveryDetails: result.codeDeliveryDetails
    });
  } catch (error) {
    return sendCognitoError(res, error);
  }
});

router.post('/confirm-forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('code').notEmpty().withMessage('Reset code is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    await cognitoService.confirmForgotPassword({
      email: req.body.email,
      code: req.body.code,
      newPassword: req.body.newPassword
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    return sendCognitoError(res, error);
  }
});

router.put('/password', authenticateToken, [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req, res) => {
  try {
    if (!handleValidation(req, res)) {
      return;
    }

    const cookies = getAuthCookies(req);
    await cognitoService.changePassword({
      accessToken: cookies.accessToken,
      previousPassword: req.body.currentPassword,
      proposedPassword: req.body.newPassword
    });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    return sendCognitoError(res, error);
  }
});

module.exports = router;
