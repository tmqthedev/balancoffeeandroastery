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

    console.log('🛒 Cart API: Add to cart request:', { productId, quantity, variant, userId: req.user.userId });

    if (!productId) {
      console.log('❌ Cart API: Missing productId');
      return res.status(400).json({ 
        success: false, 
        error: 'Product ID is required' 
      });
    }

    if (quantity <= 0) {
      console.log('❌ Cart API: Invalid quantity:', quantity);
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity must be greater than 0' 
      });
    }

    // Check if product exists
    console.log('🔍 Cart API: Looking up product with ID:', productId);
    const product = await Product.findById(productId);
    console.log('📦 Cart API: Product lookup result:', product ? { 
      id: product._id, 
      name: product.name, 
      price: product.price,
      pricingType: product.pricingType 
    } : 'NOT FOUND');
    
    if (!product) {
      console.log('❌ Cart API: Product not found for ID:', productId);
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }

    // Calculate the correct price based on product type
    let productPrice;
    if (product.pricingType === 'weight-based') {
      // Find price based on variant weight
      const selectedWeight = variant.weight; // e.g., "250g"
      if (!selectedWeight) {
        console.log('❌ Cart API: Weight variant is required for weight-based product');
        return res.status(400).json({ 
          success: false, 
          error: 'Weight selection is required for this product' 
        });
      }
      
      // Convert weight string to number (remove 'g' or 'kg')
      const weightValue = selectedWeight.includes('kg') 
        ? parseFloat(selectedWeight.replace('kg', '')) * 1000
        : parseInt(selectedWeight.replace('g', ''));
      
      console.log('⚖️ Cart API: Looking for weight option:', { selectedWeight, weightValue });
      
      // Find the matching weight option
      const weightOption = product.weightPricing.find(option => 
        option.weight === weightValue && option.isAvailable
      );
      
      if (!weightOption) {
        console.log('❌ Cart API: Weight option not found or unavailable:', selectedWeight);
        return res.status(400).json({ 
          success: false, 
          error: 'Selected weight option is not available' 
        });
      }
      
      productPrice = weightOption.price;
      console.log('💰 Cart API: Weight-based price found:', productPrice);
    } else {
      // Fixed pricing
      productPrice = product.price;
      console.log('💰 Cart API: Fixed price used:', productPrice);
    }

    if (typeof productPrice !== 'number' || productPrice < 0) {
      console.log('❌ Cart API: Invalid product price:', productPrice);
      return res.status(500).json({ 
        success: false, 
        error: 'Product price is not valid' 
      });
    }

    // Get or create user cart
    console.log('🔍 Cart API: Looking up cart for user:', req.user.userId);
    let cart = await Cart.findOne({ customerId: req.user.userId });
    console.log('🛒 Cart API: Existing cart:', cart ? { id: cart._id, itemCount: cart.itemCount } : 'NO CART');
    
    if (!cart) {
      console.log('🆕 Cart API: Creating new cart for user:', req.user.userId);
      cart = new Cart({
        customerId: req.user.userId,
        items: [],
        itemCount: 0,
        subtotal: 0
      });
      console.log('🆕 Cart API: Created new cart');
    }

    // Add item to cart using the model method
    console.log('➕ Cart API: Adding item to cart...');
    console.log('📋 Cart API: Using calculated price:', productPrice);
    console.log('📋 Cart API: Variant data:', variant);
    
    try {
      cart.addItem(productId, quantity, productPrice, variant);
      console.log('✅ Cart API: Item added, saving cart...');
    } catch (addError) {
      console.error('❌ Cart API: addItem failed:', addError);
      throw addError;
    }
    
    try {
      await cart.save();
      console.log('💾 Cart API: Cart saved successfully');
    } catch (saveError) {
      console.error('❌ Cart API: cart.save() failed:', saveError);
      console.error('❌ Cart API: Cart data before save:', JSON.stringify(cart.toObject(), null, 2));
      throw saveError;
    }

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
    console.error('❌ Cart API: Add to cart error:', error);
    console.error('❌ Cart API: Error name:', error.name);
    console.error('❌ Cart API: Error message:', error.message);
    console.error('❌ Cart API: Error stack:', error.stack);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      console.error('❌ Cart API: Validation errors:', error.errors);
      return res.status(400).json({ 
        success: false,
        error: 'Validation failed',
        details: Object.keys(error.errors).map(key => error.errors[key].message)
      });
    }
    
    if (error.name === 'CastError') {
      console.error('❌ Cart API: Cast error - invalid ID format');
      return res.status(400).json({ 
        success: false,
        error: 'Invalid ID format',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to add item to cart',
      details: error.message
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
