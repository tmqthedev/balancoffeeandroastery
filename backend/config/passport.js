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
    const users = await db.query(
      'SELECT * FROM Users WHERE email = @email AND isActive = 1',
      { email }
    );

    if (users.length === 0) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    const user = users[0];

    if (!user.password) {
      return done(null, false, { message: 'Please use social login or reset your password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    // Remove password from user object
    delete user.password;
    return done(null, user);
  } catch (error) {
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
    // Check if user already exists with Facebook ID
    let users = await db.query(
      'SELECT * FROM Users WHERE facebookId = @facebookId',
      { facebookId: profile.id }
    );

    if (users.length > 0) {
      const user = users[0];
      delete user.password;
      return done(null, user);
    }

    // Check if user exists with the same email
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    
    if (email) {
      users = await db.query(
        'SELECT * FROM Users WHERE email = @email',
        { email }
      );

      if (users.length > 0) {
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
        delete user.password;
        return done(null, user);
      }
    }

    // Create new user
    if (!email) {
      return done(null, false, { message: 'No email provided by Facebook' });
    }

    const result = await db.execute(
      `INSERT INTO Users (email, firstName, lastName, facebookId, profileImage, emailVerified, role)
       OUTPUT INSERTED.* 
       VALUES (@email, @firstName, @lastName, @facebookId, @profileImage, 1, 'customer')`,
      {
        email,
        firstName: profile.name.givenName || 'Facebook',
        lastName: profile.name.familyName || 'User',
        facebookId: profile.id,
        profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null
      }
    );

    const newUser = result.recordset[0];
    delete newUser.password;
    return done(null, newUser);
  } catch (error) {
    console.error('Facebook strategy error:', error);
    return done(error);
  }
  }));
} else {
  console.log('Facebook OAuth not configured - skipping Facebook strategy');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const users = await db.query(
      'SELECT * FROM Users WHERE id = @id AND isActive = 1',
      { id }
    );

    if (users.length === 0) {
      return done(null, false);
    }

    const user = users[0];
    delete user.password;
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
