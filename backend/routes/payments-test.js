const express = require('express');
const router = express.Router();

console.log('📦 Test payments router loaded');

router.get('/test', (req, res) => {
    console.log('🎯 Test route hit in test router!');
    res.json({ success: true, message: 'Test router working!' });
});

console.log('✅ Test payments router routes registered');

module.exports = router;
