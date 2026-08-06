const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { authenticateToken } = require('../middleware/auth');
const { getCollection, toObjectId, handleDatabaseError } = require('../middleware/mongoHelpers');
const postgresCart = require('../repositories/postgresCartRepository');

function sendCartServiceError(error, res) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message
    });
  }
  throw error;
}

// Get user cart (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🛒 Cart API: Getting cart for user:', req.user.userId);
    console.log('🛒 Cart API: User ID type:', typeof req.user.userId);
    
    if (req.databaseProvider === 'postgres') {
      const cart = await postgresCart.getCart(req.user.userId);
      return res.json({
        success: true,
        cart: {
          _id: cart._id,
          items: cart.items,
          itemCount: cart.itemCount || 0,
          subtotal: cart.subtotal || 0,
          lastActivity: cart.lastActivity
        }
      });
    }

    const cartCollection = getCollection(req, 'cart');
    const productCollection = getCollection(req, 'products');
    
    let userId;
    try {
      userId = toObjectId(req.user.userId);
      console.log('✅ Cart API: Successfully converted user ID to ObjectId');
    } catch (conversionError) {
      console.error('❌ Cart API: Failed to convert user ID to ObjectId:', conversionError.message);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid user ID format' 
      });
    }
    
    let cart = await cartCollection.findOne({ customerId: userId });

    if (!cart) {
      // Create empty cart if none exists
      console.log('🆕 Cart API: Creating new cart for user');
      const newCart = {
        customerId: userId,
        items: [],
        itemCount: 0,
        subtotal: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const insertResult = await cartCollection.insertOne(newCart);
      cart = { ...newCart, _id: insertResult.insertedId };
      console.log('✅ Cart API: New cart created with ID:', cart._id);
    }

    // Populate product details for each cart item
    const populatedItems = await Promise.all(
      (cart.items || []).map(async (item) => {
        try {
          let productId;
          try {
            productId = toObjectId(item.productId);
          } catch (idError) {
            console.error('❌ Cart API: Invalid product ID in cart item:', item.productId);
            throw idError;
          }
          
          const product = await productCollection.findOne({ _id: productId });
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
          console.error('❌ Cart API: Error populating product:', error);
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

    console.log('✅ Cart API: Cart retrieved successfully');
    console.log('📦 Cart API: Populated items count:', populatedItems.length);
    console.log('📊 Cart API: Cart summary:', {
      id: cart._id,
      itemCount: cart.itemCount || 0,
      subtotal: cart.subtotal || 0
    });
    
    const response = {
      success: true,
      cart: {
        _id: cart._id,
        items: populatedItems,
        itemCount: cart.itemCount || 0,
        subtotal: cart.subtotal || 0,
        lastActivity: cart.lastActivity
      }
    };
    
    console.log('📤 Cart API: Sending response');
    res.json(response);
  } catch (error) {
    console.error('❌ Cart API: Get cart error:', error);
    return handleDatabaseError(error, res, 'get user cart');
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

    if (req.databaseProvider === 'postgres') {
      try {
        const cart = await postgresCart.addItem(req.user.userId, { productId, quantity, variant });
        return res.json({
          success: true,
          message: 'Item added to cart successfully',
          cart
        });
      } catch (error) {
        return sendCartServiceError(error, res);
      }
    }

    const cartCollection = getCollection(req, 'cart');
    const productCollection = getCollection(req, 'products');

    // Check if product exists
    console.log('🔍 Cart API: Looking up product with ID:', productId);
    console.log('🔍 Cart API: Product ID type:', typeof productId);
    console.log('🔍 Cart API: Product ID length:', productId?.length);
    
    let productObjectId;
    try {
      productObjectId = toObjectId(productId);
      console.log('✅ Cart API: Successfully converted to ObjectId:', productObjectId);
    } catch (conversionError) {
      console.error('❌ Cart API: Failed to convert productId to ObjectId:', conversionError.message);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid product ID format' 
      });
    }
    const product = await productCollection.findOne({ _id: productObjectId });
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
    const userId = toObjectId(req.user.userId);
    let cart = await cartCollection.findOne({ customerId: userId });
    console.log('🛒 Cart API: Existing cart:', cart ? { id: cart._id, itemCount: cart.itemCount } : 'NO CART');
    
    if (!cart) {
      console.log('🆕 Cart API: Creating new cart for user:', req.user.userId);
      cart = {
        customerId: userId,
        items: [],
        itemCount: 0,
        subtotal: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const insertResult = await cartCollection.insertOne(cart);
      cart._id = insertResult.insertedId;
      console.log('🆕 Cart API: Created new cart with ID:', cart._id);
    }

    // Add item to cart logic (without Mongoose model methods)
    console.log('➕ Cart API: Adding item to cart...');
    console.log('📋 Cart API: Using calculated price:', productPrice);
    console.log('📋 Cart API: Variant data:', variant);
    
    // Find existing item with same productId and variant
    const existingItemIndex = cart.items.findIndex(item => {
      const isSameProduct = item.productId.toString() === productId.toString();
      const isSameVariant = JSON.stringify(item.variant || {}) === JSON.stringify(variant);
      return isSameProduct && isSameVariant;
    });

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].updatedAt = new Date();
      console.log('📈 Cart API: Updated existing item quantity');
    } else {
      // Add new item
      cart.items.push({
        productId: productObjectId,
        quantity: quantity,
        price: productPrice,
        variant: variant,
        addedAt: new Date(),
        updatedAt: new Date()
      });
      console.log('➕ Cart API: Added new item to cart');
    }

    // Recalculate cart totals
    cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();

    // Save cart to database
    console.log('💾 Cart API: Saving cart...');
    await cartCollection.replaceOne(
      { _id: cart._id },
      cart,
      { upsert: true }
    );
    console.log('✅ Cart API: Cart saved successfully');

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
    return handleDatabaseError(error, res, 'add item to cart');
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

    if (req.databaseProvider === 'postgres') {
      try {
        const cart = await postgresCart.updateItem(req.user.userId, { productId, quantity, variant });
        return res.json({
          success: true,
          message: 'Cart updated successfully',
          cart
        });
      } catch (error) {
        return sendCartServiceError(error, res);
      }
    }

    const cartCollection = getCollection(req, 'cart');
    const userId = toObjectId(req.user.userId);
    const productObjectId = toObjectId(productId);
    
    const cart = await cartCollection.findOne({ customerId: userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cart not found' 
      });
    }

    // Find the item to update
    const itemIndex = cart.items.findIndex(item => {
      const isSameProduct = item.productId.toString() === productId.toString();
      const isSameVariant = JSON.stringify(item.variant || {}) === JSON.stringify(variant);
      return isSameProduct && isSameVariant;
    });

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
    } else {
      // Update item quantity
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].updatedAt = new Date();
    }

    // Recalculate cart totals
    cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();

    // Save cart
    await cartCollection.replaceOne(
      { _id: cart._id },
      cart
    );

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
    console.error('❌ Cart API: Update cart error:', error);
    return handleDatabaseError(error, res, 'update cart item');
  }
});

// Remove item from cart (protected route)
router.delete('/items/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const variant = (req.body && req.body.variant) ? req.body.variant : {};

    console.log('🗑️ Cart API: Remove item request:', { productId, variant, userId: req.user.userId });
    console.log('🗑️ Cart API: Request body:', req.body);

    if (req.databaseProvider === 'postgres') {
      try {
        const cart = await postgresCart.removeItem(req.user.userId, { productId, variant });
        return res.json({
          success: true,
          message: 'Item removed from cart successfully',
          cart
        });
      } catch (error) {
        return sendCartServiceError(error, res);
      }
    }

    const productObjectId = toObjectId(productId);
    if (!productObjectId) {
      console.log('❌ Cart API: Invalid productId format:', productId);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid product ID format' 
      });
    }

    const cartCollection = getCollection(req, 'cart');
    const userId = toObjectId(req.user.userId);
    
    const cart = await cartCollection.findOne({ customerId: userId });
    if (!cart) {
      console.log('❌ Cart API: Cart not found for user:', req.user.userId);
      return res.status(404).json({ 
        success: false, 
        error: 'Cart not found' 
      });
    }

    console.log('🛒 Cart API: Found cart with items:', cart.items.length);
    console.log('📦 Cart API: Cart items before removal:', cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    })));

    // Find and remove the item
    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(item => {
      const isSameProduct = item.productId.toString() === productId.toString();
      const isSameVariant = JSON.stringify(item.variant || {}) === JSON.stringify(variant);
      return !(isSameProduct && isSameVariant);
    });
    
    const itemRemoved = cart.items.length < initialItemCount;
    if (!itemRemoved) {
      console.log('⚠️ Cart API: Item not found in cart for removal');
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }
    
    console.log('📦 Cart API: Cart items after removal:', cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    })));

    // Recalculate cart totals
    cart.itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();

    // Save cart
    await cartCollection.replaceOne(
      { _id: cart._id },
      cart
    );
    console.log('💾 Cart API: Cart saved successfully after removal');

    console.log('✅ Cart API: Item removed successfully');

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
    console.error('❌ Cart API: Remove from cart error:', error);
    return handleDatabaseError(error, res, 'remove item from cart');
  }
});

// Clear entire cart (protected route)
router.delete('/', authenticateToken, async (req, res) => {
  try {
    if (req.databaseProvider === 'postgres') {
      try {
        const cart = await postgresCart.clearCart(req.user.userId);
        return res.json({
          success: true,
          message: 'Cart cleared successfully',
          cart
        });
      } catch (error) {
        return sendCartServiceError(error, res);
      }
    }

    const cartCollection = getCollection(req, 'cart');
    const userId = toObjectId(req.user.userId);
    
    const cart = await cartCollection.findOne({ customerId: userId });
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        error: 'Cart not found' 
      });
    }

    // Clear cart items
    const clearedCart = {
      ...cart,
      items: [],
      itemCount: 0,
      subtotal: 0,
      updatedAt: new Date()
    };

    await cartCollection.replaceOne(
      { _id: cart._id },
      clearedCart
    );

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: {
        _id: clearedCart._id,
        items: clearedCart.items,
        itemCount: clearedCart.itemCount,
        subtotal: clearedCart.subtotal
      }
    });

  } catch (error) {
    console.error('❌ Cart API: Clear cart error:', error);
    return handleDatabaseError(error, res, 'clear cart');
  }
});

module.exports = router;
