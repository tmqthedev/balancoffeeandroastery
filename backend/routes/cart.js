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

    // Populate product details for each cart item
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await Product.findById(item.productId);
          return {
            productId: item.productId,
            product_id: item.productId, // Frontend compatibility
            name: product ? product.name : 'Sản phẩm không tồn tại',
            price: item.price || (product ? product.price : 0),
            quantity: item.quantity,
            image_url: product ? product.image_url : '',
            description: product ? product.description : '',
            variant: item.variant,
            addedAt: item.addedAt
          };
        } catch (error) {
          console.error('Error populating product:', error);
          return {
            productId: item.productId,
            product_id: item.productId,
            name: 'Sản phẩm không tồn tại',
            price: item.price || 0,
            quantity: item.quantity,
            image_url: '',
            description: '',
            variant: item.variant,
            addedAt: item.addedAt
          };
        }
      })
    );

    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: populatedItems,
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

// Add item to cart (protected route)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1, variant = {} } = req.body;

    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID is required' 
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity must be greater than 0' 
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    // Get or create user cart
    let cart = await Cart.findOne({ customerId: req.user.userId });
    if (!cart) {
      cart = new Cart({
        customerId: req.user.userId,
        items: [],
        itemCount: 0,
        subtotal: 0
      });
    }

    // Add item to cart using the model method
    cart.addItem(productId, quantity, product.price, variant);
    await cart.save();

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: {
        _id: cart._id,
        items: cart.items,
        itemCount: cart.itemCount,
        subtotal: cart.subtotal
      }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to add item to cart' 
    });
  }
});

// Update item quantity in cart (protected route)
router.put('/items/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, variant = {} } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity cannot be negative' 
      });
    }

    const cart = await Cart.findOne({ customerId: req.user.userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cart not found' 
      });
    }

    if (quantity === 0) {
      cart.removeItem(productId, variant);
    } else {
      cart.updateItemQuantity(productId, quantity, variant);
    }

    await cart.save();

    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart: {
        _id: cart._id,
        items: cart.items,
        itemCount: cart.itemCount,
        subtotal: cart.subtotal
      }
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update cart' 
    });
  }
});

// Remove item from cart (protected route)
router.delete('/items/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { variant = {} } = req.body;

    const cart = await Cart.findOne({ customerId: req.user.userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cart not found' 
      });
    }

    cart.removeItem(productId, variant);
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: {
        _id: cart._id,
        items: cart.items,
        itemCount: cart.itemCount,
        subtotal: cart.subtotal
      }
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to remove item from cart' 
    });
  }
});

// Clear entire cart (protected route)
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerId: req.user.userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cart not found' 
      });
    }

    cart.clear();
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        _id: cart._id,
        items: cart.items,
        itemCount: cart.itemCount,
        subtotal: cart.subtotal
      }
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to clear cart' 
    });
  }
});

module.exports = router;
