const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get user cart (protected route)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const cartQuery = `
      SELECT 
        c.id,
        c.quantity,
        c.createdAt,
        p.id as productId,
        p.name,
        p.nameVi,
        p.slug,
        p.price,
        p.images,
        p.stockQuantity,
        p.weight
      FROM CartItems c
      INNER JOIN Products p ON c.productId = p.id
      WHERE c.userId = @userId AND p.isActive = 1
      ORDER BY c.createdAt DESC
    `;

    const cartItems = await db.query(cartQuery, { userId: req.user.userId });

    // Parse images for each item
    const processedCartItems = cartItems.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : []
    }));

    // Calculate totals
    const subtotal = processedCartItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    res.json({
      items: processedCartItems,
      summary: {
        itemCount: processedCartItems.length,
        totalQuantity: processedCartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: subtotal
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// Add item to cart (protected route)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }

    // Check if product exists and is active
    const products = await db.query(
      'SELECT id, stockQuantity FROM Products WHERE id = @productId AND isActive = 1',
      { productId }
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];

    if (product.stockQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already exists in cart
    const existingItems = await db.query(
      'SELECT id, quantity FROM CartItems WHERE userId = @userId AND productId = @productId',
      { userId: req.user.userId, productId }
    );

    if (existingItems.length > 0) {
      // Update existing item
      const newQuantity = existingItems[0].quantity + quantity;
      
      if (product.stockQuantity < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock for requested quantity' });
      }

      await db.execute(
        'UPDATE CartItems SET quantity = @quantity, updatedAt = GETDATE() WHERE id = @id',
        { quantity: newQuantity, id: existingItems[0].id }
      );
    } else {
      // Add new item
      await db.execute(
        'INSERT INTO CartItems (userId, productId, quantity, createdAt, updatedAt) VALUES (@userId, @productId, @quantity, GETDATE(), GETDATE())',
        { userId: req.user.userId, productId, quantity }
      );
    }

    res.json({ message: 'Item added to cart successfully' });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity (protected route)
router.put('/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    // Check if item belongs to user
    const cartItems = await db.query(
      'SELECT c.id, p.stockQuantity FROM CartItems c INNER JOIN Products p ON c.productId = p.id WHERE c.id = @itemId AND c.userId = @userId',
      { itemId: parseInt(itemId), userId: req.user.userId }
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const item = cartItems[0];

    if (item.stockQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Update quantity
    await db.execute(
      'UPDATE CartItems SET quantity = @quantity, updatedAt = GETDATE() WHERE id = @itemId',
      { quantity, itemId: parseInt(itemId) }
    );

    res.json({ message: 'Cart item updated successfully' });

  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart (protected route)
router.delete('/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;

    const result = await db.execute(
      'DELETE FROM CartItems WHERE id = @itemId AND userId = @userId',
      { itemId: parseInt(itemId), userId: req.user.userId }
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });

  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// Clear entire cart (protected route)
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM CartItems WHERE userId = @userId',
      { userId: req.user.userId }
    );

    res.json({ message: 'Cart cleared successfully' });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Sync cart items from localStorage to database (protected route)
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    // Clear existing cart items
    await db.execute(
      'DELETE FROM CartItems WHERE userId = @userId',
      { userId: req.user.userId }
    );

    // Add each item from localStorage to database
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        continue; // Skip invalid items
      }

      // Check if product exists and is active
      const products = await db.query(
        'SELECT id, stockQuantity FROM Products WHERE id = @productId AND isActive = 1',
        { productId }
      );

      if (products.length === 0) {
        continue; // Skip invalid products
      }

      const product = products[0];
      const syncQuantity = Math.min(quantity, product.stockQuantity);

      // Insert item into database
      await db.execute(
        'INSERT INTO CartItems (userId, productId, quantity, createdAt, updatedAt) VALUES (@userId, @productId, @quantity, GETDATE(), GETDATE())',
        { userId: req.user.userId, productId, quantity: syncQuantity }
      );
    }

    // Return updated cart
    const cartQuery = `
      SELECT 
        c.id,
        c.quantity,
        c.createdAt,
        p.id as productId,
        p.name,
        p.nameVi,
        p.slug,
        p.price,
        p.images,
        p.stockQuantity,
        p.weight
      FROM CartItems c
      INNER JOIN Products p ON c.productId = p.id
      WHERE c.userId = @userId AND p.isActive = 1
      ORDER BY c.createdAt DESC
    `;

    const cartItems = await db.query(cartQuery, { userId: req.user.userId });

    // Parse images for each item
    const processedCartItems = cartItems.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : []
    }));

    // Calculate totals
    const subtotal = processedCartItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    res.json({
      items: processedCartItems,
      summary: {
        itemCount: processedCartItems.length,
        totalQuantity: processedCartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: subtotal
      }
    });

  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({ error: 'Failed to sync cart' });
  }
});

module.exports = router;
