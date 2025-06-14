// Simple debug router to test what's happening
const express = require('express');
const router = express.Router();
const db = require('../config/database');

console.log('🚨 SUPER SIMPLE debug router loading...');

// ONLY specific route - no parameterized route
router.get('/test-only', (req, res) => {
    console.log('🎯 SUPER SIMPLE: test-only route hit!');
    res.json({ success: true, message: 'SUPER SIMPLE test-only works!' });
});

console.log('✅ SUPER SIMPLE debug router loaded');
module.exports = router;
