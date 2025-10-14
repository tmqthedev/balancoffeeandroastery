const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { getCollection, handleDatabaseError } = require('../middleware/mongoHelpers');

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

    // Create and save contact using MongoDB native driver
    const contactsCollection = getCollection(req, 'contacts');
    const contactData = {
      name,
      email,
      phone,
      subject,
      message,
      status: 'new',
      source: 'website',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer: req.headers['referer'] || req.headers['referrer'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const insertResult = await contactsCollection.insertOne(contactData);
    const contact = { ...contactData, _id: insertResult.insertedId };

    // Gửi email thông báo cho quản lý bộ phận
    const { notifyManagers } = require('../services/contactNotificationService');
    notifyManagers(contact).then(result => {
      if (!result.success) {
        console.warn('Không gửi được email thông báo liên hệ:', result.error);
      }
    });

    res.status(201).json({
      message: 'Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất!',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    return handleDatabaseError(error, res, 'submit contact form');
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

    const subscriptionsCollection = getCollection(req, 'subscriptions');

    // Check if email already exists
    const existingSubscription = await subscriptionsCollection.findOne({ email });

    if (existingSubscription) {
      return res.status(400).json({ error: 'Email is already subscribed to our newsletter' });
    }

    // Insert subscription
    await subscriptionsCollection.insertOne({
      email,
      isActive: true,
      createdAt: new Date()
    });

    res.status(201).json({
      message: 'Successfully subscribed to newsletter!'
    });

  } catch (error) {
    console.error('❌ Newsletter subscription error:', error);
    return handleDatabaseError(error, res, 'subscribe to newsletter');
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

    const subscriptionsCollection = getCollection(req, 'subscriptions');

    // Update subscription status
    const result = await subscriptionsCollection.updateOne(
      { email },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Email not found in our subscription list' });
    }

    res.json({
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('❌ Newsletter unsubscribe error:', error);
    return handleDatabaseError(error, res, 'unsubscribe from newsletter');
  }
});

module.exports = router;
