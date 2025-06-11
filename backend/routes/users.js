const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

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

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, email, firstName, lastName, phone, address, city, postalCode, role, profileImage, createdAt FROM Users WHERE id = @userId AND isActive = 1',
      { userId: req.user.userId }
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile (protected route)
router.put('/profile', authenticateToken, [
  body('first_name').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('last_name').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone('vi-VN').withMessage('Invalid phone number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, phone, date_of_birth, gender } = req.body;

    // Check if email is already used by another user
    const existingUsers = await db.query(
      'SELECT id FROM Users WHERE email = @email AND id != @userId AND is_active = 1',
      { email, userId: req.user.userId }
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already in use by another account' });
    }

    // Update user profile
    await db.execute(
      `UPDATE Users 
       SET first_name = @firstName, last_name = @lastName, email = @email, 
           phone = @phone, date_of_birth = @dateOfBirth, gender = @gender, 
           updated_at = GETDATE()
       WHERE id = @userId`,
      {
        firstName: first_name,
        lastName: last_name,
        email,
        phone: phone || null,
        dateOfBirth: date_of_birth || null,
        gender: gender || null,
        userId: req.user.userId
      }
    );

    // Fetch updated user data
    const users = await db.query(
      'SELECT id, email, first_name, last_name, phone, date_of_birth, gender, role, created_at FROM Users WHERE id = @userId AND is_active = 1',
      { userId: req.user.userId }
    );

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: users[0]
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password (protected route)
router.put('/change-password', authenticateToken, [
  body('current_password').isLength({ min: 1 }).withMessage('Current password is required'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { current_password, new_password } = req.body;

    // Get current user password
    const users = await db.query(
      'SELECT password FROM Users WHERE id = @userId AND is_active = 1',
      { userId: req.user.userId }
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, users[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await db.execute(
      'UPDATE Users SET password = @password, updated_at = GETDATE() WHERE id = @userId',
      {
        password: hashedNewPassword,
        userId: req.user.userId
      }
    );

    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user orders (protected route)
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM Orders WHERE userId = @userId',
      { userId: req.user.userId }
    );
    const totalItems = countResult[0].total;

    // Get orders
    const ordersQuery = `
      SELECT 
        o.id,
        o.orderNumber,
        o.total,
        o.status,
        o.paymentStatus,
        o.createdAt,
        (SELECT COUNT(*) FROM OrderProducts WHERE orderId = o.id) as itemCount
      FROM Orders o
      WHERE o.userId = @userId
      ORDER BY o.createdAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const orders = await db.query(ordersQuery, {
      userId: req.user.userId,
      offset: offset,
      limit: parseInt(limit)
    });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get user cart items (protected route)
router.get('/cart', authenticateToken, async (req, res) => {
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
    console.error('Get user cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// Add item to cart (protected route)
router.post('/cart', authenticateToken, async (req, res) => {
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
router.put('/cart/:itemId', authenticateToken, async (req, res) => {
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
router.delete('/cart/:itemId', authenticateToken, async (req, res) => {
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

module.exports = router;
