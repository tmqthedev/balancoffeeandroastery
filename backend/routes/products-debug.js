// Simple debug router to test route ordering
const express = require('express');
const router = express.Router();

console.log('🐛 Debug Products router loading...');

// Test route 1 - should be hit first
router.get('/debug-test', (req, res) => {
    console.log('🎯 DEBUG: debug-test route hit!');
    res.json({ success: true, route: 'debug-test', timestamp: new Date().toISOString() });
});

// Test route 2 - should be hit first
router.get('/another-test', (req, res) => {
    console.log('🎯 DEBUG: another-test route hit!');
    res.json({ success: true, route: 'another-test', timestamp: new Date().toISOString() });
});

// Parameterized route - should be hit last
router.get('/:id', (req, res) => {
    console.log('🎯 DEBUG: :id route hit with id:', req.params.id);
    res.json({ success: true, route: 'param-id', id: req.params.id, timestamp: new Date().toISOString() });
});

module.exports = router;
