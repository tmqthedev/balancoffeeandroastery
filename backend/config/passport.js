const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const db = require('./database');

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    console.log('🔍 Passport Local Strategy - Email:', email);
    const users = await db.query(
      'SELECT * FROM Users WHERE email = @email AND isActive = 1',
      { email }
    );

    console.log('🔍 Passport Local Strategy - Users found:', users.length);
    if (users.length === 0) {
      console.log('❌ No user found with email:', email);
      return done(null, false, { message: 'Invalid email or password' });
    }

    const user = users[0];
    console.log('🔍 Passport Local Strategy - User:', { 
      id: user.id, 
      email: user.email, 
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
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

    // Create a copy and remove password from the copy
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return done(null, userWithoutPassword);
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
      let users = await db.query(
        'SELECT * FROM Users WHERE facebookId = @facebookId',
        { facebookId: profile.id }
      );

      if (users.length > 0) {
        console.log('✅ Facebook user found, logging in...');
        const user = users[0];
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        return done(null, userWithoutPassword);
      }

      // Check if user exists with the same email
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      
      if (email) {
        users = await db.query(
          'SELECT * FROM Users WHERE email = @email',
          { email }
        );

        if (users.length > 0) {
          console.log('✅ Existing user found, linking Facebook account...');
          // Update existing user with Facebook ID
          await db.execute(
            'UPDATE Users SET facebookId = @facebookId, profileImage = @profileImage WHERE email = @email',
            {
              facebookId: profile.id,
              profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
              email
            }
          );

          const updatedUsers = await db.query(
            'SELECT * FROM Users WHERE email = @email',
            { email }
          );

          const user = updatedUsers[0];
          const userWithoutPassword = { ...user };
          delete userWithoutPassword.password;
          return done(null, userWithoutPassword);
        }
      }

      // Create new user
      if (!email) {
        console.log('❌ No email provided by Facebook');
        return done(null, false, { message: 'No email provided by Facebook' });
      }

      console.log('✅ Creating new Facebook user...');
      const result = await db.execute(
        `INSERT INTO Users (email, firstName, lastName, facebookId, profileImage, emailVerified, role, isActive)
         OUTPUT INSERTED.* 
         VALUES (@email, @firstName, @lastName, @facebookId, @profileImage, 1, 'customer', 1)`,
        {
          email,
          firstName: profile.name.givenName || 'Facebook',
          lastName: profile.name.familyName || 'User',
          facebookId: profile.id,
          profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null
        }
      );

      const newUser = result.recordset[0];
      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;
      console.log('✅ New Facebook user created:', newUser.email);
      return done(null, userWithoutPassword);
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
  console.log('🔍 Serializing user:', user.id);
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    console.log('🔍 Deserializing user:', id);
    const users = await db.query(
      'SELECT * FROM Users WHERE id = @id AND isActive = 1',
      { id }
    );

    if (users.length === 0) {
      console.log('❌ User not found during deserialization:', id);
      return done(null, false);
    }

    const user = users[0];
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    console.log('✅ User deserialized successfully:', user.email);
    done(null, userWithoutPassword);
  } catch (error) {
    console.error('❌ Deserialization error:', error);
    done(error);
  }
});

module.exports = passport;
