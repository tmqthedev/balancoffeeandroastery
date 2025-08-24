const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, addressValidationRules } = require('../middleware/validation');

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.user.userId,
      status: 'active' 
    }).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id, // backwards compatibility
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses || [],
        preferences: user.preferences || {},
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile (protected route)
router.put('/profile', authenticateToken, [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('phone').optional().isLength({ min: 10, max: 15 }).withMessage('Phone number must be 10-15 digits'),
], async (req, res) => {
  try {
    console.log('🔍 Profile update request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      firstName, 
      lastName, 
      phone, 
      dateOfBirth, 
      gender,
      // Address fields
      address,
      city,
      province,
      postalCode
    } = req.body;
    
    // Email is not allowed to be updated for security reasons
    if (req.body.email) {
      return res.status(400).json({ error: 'Email cannot be updated for security reasons' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update basic profile info
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone || undefined;
    user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
    user.gender = gender || undefined;

    // Update or create default address if address information is provided
    if (address || city || province) {
      let defaultAddress = user.addresses.find(addr => addr.isDefault);
      
      if (defaultAddress) {
        // Update existing default address
        defaultAddress.firstName = firstName;
        defaultAddress.lastName = lastName;
        defaultAddress.address1 = address || defaultAddress.address1;
        defaultAddress.city = city || defaultAddress.city;
        defaultAddress.province = province || defaultAddress.province;
        defaultAddress.postalCode = postalCode || defaultAddress.postalCode;
        defaultAddress.phone = phone || defaultAddress.phone;
      } else {
        // Create new default address
        const newAddress = {
          type: 'both',
          firstName,
          lastName,
          address1: address || '',
          city: city || '',
          province: province || '',
          postalCode: postalCode || '',
          country: 'VN',
          phone: phone || undefined,
          isDefault: true
        };
        user.addresses.push(newAddress);
      }
    }

    await user.save();

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        addresses: user.addresses,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Add or update address (protected route)
router.post('/addresses', authenticateToken, validateRequest(addressValidationRules), async (req, res) => {
  try {
    const { 
      fullName,
      phone,
      street,
      ward,
      district,
      city,
      postalCode,
      label,
      isDefault = false
    } = req.body;

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If this is set as default, unset all other default addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Create new address object
    const newAddress = {
      fullName,
      phone,
      street,
      ward,
      district,
      city,
      postalCode: postalCode || undefined,
      label: label || 'Địa chỉ mới',
      isDefault: isDefault || user.addresses.length === 0 // Set as default if first address
    };

    user.addresses.push(newAddress);
    await user.save();

    res.json({
      success: true,
      message: 'Address saved successfully',
      address: newAddress
    });

  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Failed to save address' });
  }
});

// Get user addresses (protected route)
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('addresses');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      addresses: user.addresses || []
    });

  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Update address (protected route)
router.put('/addresses/:addressId', authenticateToken, [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('address1').trim().isLength({ min: 1 }).withMessage('Address is required'),
  body('city').trim().isLength({ min: 1 }).withMessage('City is required'),
  body('province').trim().isLength({ min: 1 }).withMessage('Province is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { addressId } = req.params;
    const updateData = req.body;

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    // Update address fields
    Object.assign(address, updateData);
    
    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      address
    });

  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete address (protected route)
router.delete('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default, set first remaining address as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
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
