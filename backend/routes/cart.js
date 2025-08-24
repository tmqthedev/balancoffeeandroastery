const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

// Get user cart (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ customerId: req.user.userId });

    if (!cart) {
      // Create empty cart if none exists
      cart = new Cart({
        customerId: req.user.userId,
        items: [],
        itemCount: 0,
        subtotal: 0
      });
      await cart.save();
    }

    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items || [],
        itemCount: cart.itemCount || 0,
        subtotal: cart.subtotal || 0,
        lastActivity: cart.lastActivity
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch cart' 
    });
  }
});

module.exports = router;
