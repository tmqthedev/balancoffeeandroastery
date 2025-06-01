const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');

console.log('Loading passport config...');
try {
  require('./config/passport');
  console.log('✅ Passport config loaded');
} catch (err) {
  console.error('❌ Passport config error:', err.message);
  console.error('Stack trace:', err.stack);
}

const app = express();
const authRouter = express.Router();

console.log('Testing routes with middleware...');

try {
  // Test route with validation middleware
  authRouter.post('/register', [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  ], (req, res) => res.json({}));
  console.log('✅ /register with validation OK');
} catch (err) {
  console.error('❌ /register with validation error:', err.message);
}

try {
  // Test route with passport
  authRouter.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
  console.log('✅ /facebook with passport OK');
} catch (err) {
  console.error('❌ /facebook with passport error:', err.message);
  console.error('Stack trace:', err.stack);
}

try {
  authRouter.get('/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => res.json({})
  );
  console.log('✅ /facebook/callback with passport OK');
} catch (err) {
  console.error('❌ /facebook/callback with passport error:', err.message);
  console.error('Stack trace:', err.stack);
}

console.log('Adding router to app...');
try {
  app.use('/api/auth', authRouter);
  console.log('✅ Router added to app successfully');
} catch (err) {
  console.error('❌ Error adding router to app:', err.message);
  console.error('Stack trace:', err.stack);
}

console.log('Test completed');
