const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
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
