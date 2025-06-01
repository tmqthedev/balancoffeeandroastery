const express = require('express');
const app = express();

// Test individual route patterns from auth.js to find the problematic one
const authRouter = express.Router();

console.log('Testing route patterns...');

try {
  authRouter.post('/register', (req, res) => res.json({}));
  console.log('✅ /register route OK');
} catch (err) {
  console.error('❌ /register route error:', err.message);
}

try {
  authRouter.post('/login', (req, res) => res.json({}));
  console.log('✅ /login route OK');
} catch (err) {
  console.error('❌ /login route error:', err.message);
}

try {
  authRouter.get('/facebook', (req, res) => res.json({}));
  console.log('✅ /facebook route OK');
} catch (err) {
  console.error('❌ /facebook route error:', err.message);
}

try {
  authRouter.get('/facebook/callback', (req, res) => res.json({}));
  console.log('✅ /facebook/callback route OK');
} catch (err) {
  console.error('❌ /facebook/callback route error:', err.message);
}

try {
  authRouter.get('/me', (req, res) => res.json({}));
  console.log('✅ /me route OK');
} catch (err) {
  console.error('❌ /me route error:', err.message);
}

try {
  authRouter.put('/profile', (req, res) => res.json({}));
  console.log('✅ /profile route OK');
} catch (err) {
  console.error('❌ /profile route error:', err.message);
}

try {
  authRouter.put('/password', (req, res) => res.json({}));
  console.log('✅ /password route OK');
} catch (err) {
  console.error('❌ /password route error:', err.message);
}

try {
  authRouter.post('/logout', (req, res) => res.json({}));
  console.log('✅ /logout route OK');
} catch (err) {
  console.error('❌ /logout route error:', err.message);
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
