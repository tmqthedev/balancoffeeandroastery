const express = require('express');
const router = express.Router();

console.log('🚀 CRM Test Router loaded');

// Simple test route to verify CRM routing works
router.get('/test', (req, res) => {
  console.log('📡 CRM /test route hit');
  res.json({
    success: true,
    message: 'CRM routes are working!',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ CRM Test Routes registered');

module.exports = router;
