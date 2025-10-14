const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

// Helper function to get database instance
let dbInstance = null;
const getDatabase = () => {
  if (!dbInstance && global.db) {
    dbInstance = global.db;
  }
  return dbInstance;
};

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true // This allows us to access req.db
}, async (req, email, password, done) => {
  try {
    console.log('🔍 Passport Local Strategy - Email:', email);
    
    // Get database instance from request or global
    const db = req.db || getDatabase();
    if (!db) {
      console.error('❌ No database connection available in passport strategy');
      return done(new Error('Database connection not available'));
    }

    const usersCollection = db.collection('users');
    
    // Find user regardless of status to check email verification
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

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
    
    // Get database instance from global or try to reconnect
    const db = getDatabase();
    if (!db) {
      console.error('❌ No database connection available in passport deserializeUser');
      return done(new Error('Database connection not available'));
    }

    const usersCollection = db.collection('users');
    
    // Handle both ObjectId and string _id formats
    let query;
    if (ObjectId.isValid(id) && id.length === 24) {
      query = { _id: new ObjectId(id), status: 'active' };
    } else {
      query = { _id: id, status: 'active' };
    }

    const user = await usersCollection.findOne(query);

    if (!user) {
      console.log('❌ User not found during deserialization:', id);
      return done(null, false);
    }

    const userObject = {
      _id: user._id,
      id: user._id.toString(), // for backwards compatibility
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified
    };
    
    console.log('✅ User deserialized successfully:', user.email);
    done(null, userObject);
  } catch (error) {
    console.error('❌ Deserialization error:', error);
    done(error);
  }
});

module.exports = passport;
