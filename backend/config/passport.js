const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    console.log('🔍 Passport Local Strategy - Email:', email);
    // Find user regardless of status to check email verification
    const user = await User.findOne({ email });

    console.log('🔍 Passport Local Strategy - User found:', !!user);
    if (!user) {
      console.log('❌ No user found with email:', email);
      return done(null, false, { message: 'Invalid email or password' });
    }

    console.log('🔍 Passport Local Strategy - User:', { 
      id: user._id, 
      email: user.email, 
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      emailVerified: user.emailVerified,
      status: user.status
    });

    if (!user.password) {
      console.log('❌ No password found for user');
      return done(null, false, { message: 'Please use social login or reset your password' });
    }

    console.log('🔍 Passport Local Strategy - Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔍 Passport Local Strategy - Password match:', isMatch);

    if (!isMatch) {
      console.log('❌ Password does not match');
      return done(null, false, { message: 'Invalid email or password' });
    }

    console.log('✅ Authentication successful for user:', user.email);

    // Return user object with all necessary fields
    const userObject = {
      _id: user._id,
      id: user._id, // for backwards compatibility
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified
    };
    
    return done(null, userObject);
  } catch (error) {
    console.error('❌ Passport Local Strategy error:', error);
    return done(error);
  }
}));

// Facebook Strategy (only if environment variables are provided)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'emails', 'name', 'picture.type(large)']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔍 Facebook Strategy - Profile:', profile.id);
      
      // Check if user already exists with Facebook ID
      let user = await User.findOne({ 'providers.facebook.id': profile.id });

      if (user) {
        console.log('✅ Facebook user found, logging in...');
        const userObject = {
          _id: user._id,
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status
        };
        return done(null, userObject);
      }

      // Check if user exists with the same email
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      
      if (email) {
        user = await User.findOne({ email });

        if (user) {
          console.log('✅ Existing user found, linking Facebook account...');
          // Update existing user with Facebook ID
          user.providers.facebook = {
            id: profile.id,
            accessToken
          };
          user.avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : user.avatar;
          await user.save();

          const userObject = {
            _id: user._id,
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status
          };
          return done(null, userObject);
        }
      }

      // Create new user
      if (!email) {
        console.log('❌ No email provided by Facebook');
        return done(null, false, { message: 'No email provided by Facebook' });
      }

      console.log('✅ Creating new Facebook user...');
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser = new User({
        _id: userId,
        email,
        firstName: profile.name.givenName || 'Facebook',
        lastName: profile.name.familyName || 'User',
        providers: {
          facebook: {
            id: profile.id,
            accessToken
          }
        },
        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        emailVerified: true,
        role: 'customer',
        status: 'active'
      });

      await newUser.save();

      const userObject = {
        _id: newUser._id,
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        status: newUser.status
      };
      
      console.log('✅ New Facebook user created:', newUser.email);
      return done(null, userObject);
    } catch (error) {
      console.error('❌ Facebook strategy error:', error);
      return done(error);
    }
  }));
} else {
  console.log('Facebook OAuth not configured - skipping Facebook strategy');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  console.log('🔍 Serializing user:', user._id || user.id);
  done(null, user._id || user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    console.log('🔍 Deserializing user:', id);
    const user = await User.findOne({ _id: id, status: 'active' });

    if (!user) {
      console.log('❌ User not found during deserialization:', id);
      return done(null, false);
    }

    const userObject = {
      _id: user._id,
      id: user._id, // for backwards compatibility
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status
    };
    
    console.log('✅ User deserialized successfully:', user.email);
    done(null, userObject);
  } catch (error) {
    console.error('❌ Deserialization error:', error);
    done(error);
  }
});

module.exports = passport;
