const { CognitoJwtVerifier } = require('aws-jwt-verify');
const { getRuntimeConfig } = require('../config/runtimeConfig');
const { getAuthCookies } = require('../config/authCookies');
const { getCollection, handleDatabaseError } = require('./mongoHelpers');

let verifierPromise = null;

async function getVerifier() {
  if (!verifierPromise) {
    verifierPromise = getRuntimeConfig().then((config) => CognitoJwtVerifier.create({
      userPoolId: config.cognitoUserPoolId,
      tokenUse: 'access',
      clientId: config.cognitoClientId
    }));
  }

  return verifierPromise;
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice('Bearer '.length).trim();
}

function getAccessToken(req) {
  const cookies = getAuthCookies(req);
  return cookies.accessToken || getBearerToken(req);
}

async function mapCognitoUser(req, payload) {
  const usersCollection = getCollection(req, 'users');
  const cookies = getAuthCookies(req);
  const groups = Array.isArray(payload['cognito:groups']) ? payload['cognito:groups'] : [];
  const isAdmin = groups.includes('admin');
  const role = isAdmin ? 'admin' : 'customer';
  const email = payload.email || cookies.email;

  let user = await usersCollection.findOne({ cognitoSub: payload.sub });

  if (!user && email) {
    user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (user) {
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            cognitoSub: payload.sub,
            emailVerified: true,
            status: user.status || 'active',
            updatedAt: new Date()
          },
          $unset: {
            password: '',
            emailVerificationToken: '',
            emailVerificationExpires: '',
            resetPasswordToken: '',
            resetPasswordExpires: ''
          }
        }
      );

      user = {
        ...user,
        cognitoSub: payload.sub,
        emailVerified: true,
        status: user.status || 'active'
      };
    }
  }

  if (!user) {
    return null;
  }

  if (user.status && user.status !== 'active') {
    return null;
  }

  return {
    userId: user._id.toString(),
    cognitoSub: payload.sub,
    email: user.email || email,
    firstName: user.firstName,
    lastName: user.lastName,
    role,
    isAdmin,
    groups,
    tokenPayload: payload
  };
}

async function authenticateToken(req, res, next) {
  try {
    const token = getAccessToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const verifier = await getVerifier();
    const payload = await verifier.verify(token);
    const mappedUser = await mapCognitoUser(req, payload);

    if (!mappedUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    req.user = mappedUser;
    next();
  } catch (error) {
    if (error.name?.includes('Jwt') || error.message?.includes('JWT')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token'
      });
    }

    return handleDatabaseError(error, res, 'Authentication');
  }
}

async function optionalAuth(req, res, next) {
  try {
    const token = getAccessToken(req);

    if (!token) {
      req.user = null;
      return next();
    }

    const verifier = await getVerifier();
    const payload = await verifier.verify(token);
    const mappedUser = await mapCognitoUser(req, payload);

    if (!mappedUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    req.user = mappedUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token'
    });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `${role} access required`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole
};
