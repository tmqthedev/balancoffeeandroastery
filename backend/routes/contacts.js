const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Create contact form submission
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  body('phone').optional().isMobilePhone('vi-VN').withMessage('Invalid phone number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, subject, message } = req.body;

    // Insert contact form submission
    const result = await db.execute(`
      INSERT INTO Contacts (name, email, phone, subject, message, status, createdAt)
      OUTPUT INSERTED.*
      VALUES (@name, @email, @phone, @subject, @message, 'new', GETDATE())
    `, {
      name,
      email,
      phone: phone || null,
      subject,
      message
    });

    const contact = result.recordset[0];

    // Here you could send an email notification to admin
    // TODO: Implement email notification

    res.status(201).json({
      message: 'Contact form submitted successfully. We will get back to you soon!',
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Newsletter subscription
router.post('/newsletter', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if email already exists
    const existingSubscriptions = await db.query(
      'SELECT id FROM Subscriptions WHERE email = @email',
      { email }
    );

    if (existingSubscriptions.length > 0) {
      return res.status(400).json({ error: 'Email is already subscribed to our newsletter' });
    }

    // Insert subscription
    await db.execute(`
      INSERT INTO Subscriptions (email, isActive, createdAt)
      VALUES (@email, 1, GETDATE())
    `, { email });

    res.status(201).json({
      message: 'Successfully subscribed to newsletter!'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe to newsletter' });
  }
});

// Unsubscribe from newsletter
router.post('/newsletter/unsubscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Update subscription status
    const result = await db.execute(`
      UPDATE Subscriptions 
      SET isActive = 0 
      WHERE email = @email
    `, { email });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Email not found in our subscription list' });
    }

    res.json({
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from newsletter' });
  }
});

module.exports = router;
