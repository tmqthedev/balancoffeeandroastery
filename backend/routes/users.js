const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, addressValidationRules } = require('../middleware/validation');
const { getCollection, toObjectId, handleDatabaseError } = require('../middleware/mongoHelpers');
const postgresUsers = require('../repositories/postgresUsersRepository');
const logger = require('../utils/logger');

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.databaseProvider === 'postgres') {
      const user = await postgresUsers.findByLegacyId(req.user.userId);

      if (!user || user.status !== 'active') {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        success: true,
        user: {
          _id: user._id,
          id: user._id,
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
    }

    const usersCollection = getCollection(req, 'users');
    const userId = toObjectId(req.user.userId);
    
    const user = await usersCollection.findOne({ 
      _id: userId,
      status: 'active' 
    }, { 
      projection: { password: 0 } // Exclude password field
    });

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
    logger.error('❌ Get user profile error:', error);
    return handleDatabaseError(error, res, 'fetch user profile');
  }
});

// Update user profile (protected route)
router.put('/profile', authenticateToken, [
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('Họ không được để trống và không quá 50 ký tự'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Tên không được để trống và không quá 50 ký tự'),
  body('phone').optional().matches(/^[0-9+\-\s()]{8,20}$/).withMessage('Số điện thoại không hợp lệ'),
  body('dateOfBirth').optional().isISO8601().withMessage('Ngày sinh không hợp lệ'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),
  // Vietnamese address validation - optional fields
  body('address').optional().trim().isLength({ max: 255 }).withMessage('Địa chỉ không được quá 255 ký tự'),
  body('wardCommune').optional().trim().isLength({ max: 100 }).withMessage('Phường/Xã không được quá 100 ký tự'),
  body('district').optional().trim().isLength({ max: 100 }).withMessage('Quận/Huyện không được quá 100 ký tự'),
  body('province').optional().trim().isLength({ max: 100 }).withMessage('Tỉnh/Thành phố không được quá 100 ký tự'),
  body('postalCode').optional().matches(/^[0-9]{5,6}$/).withMessage('Mã bưu điện phải có 5-6 chữ số')
], async (req, res) => {
  try {
    logger.debug('🔍 Profile update request received');
    logger.debug('📋 Request body:', JSON.stringify(req.body, null, 2));
    logger.debug('👤 User ID:', req.user.userId);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('❌ Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: 'Dữ liệu không hợp lệ'
      });
    }

    const { 
      firstName, 
      lastName, 
      phone, 
      dateOfBirth, 
      gender,
      // Address fields - new Vietnamese format
      address,
      wardCommune,
      district,
      province,
      postalCode
    } = req.body;
    
    // Email is not allowed to be updated for security reasons
    if (req.body.email) {
      return res.status(400).json({ error: 'Email cannot be updated for security reasons' });
    }

    if (req.databaseProvider === 'postgres') {
      const user = await postgresUsers.findByLegacyId(req.user.userId);
      if (!user) {
        logger.warn('❌ User not found with ID:', req.user.userId);
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const updateData = {
        firstName,
        lastName,
        fullName: `${firstName || ''} ${lastName || ''}`.trim(),
        phone: phone || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender: gender || undefined
      };

      if (address || wardCommune || district || province) {
        const addresses = (user.addresses || []).filter(addr => !addr.isDefault);
        addresses.push({
          type: 'both',
          firstName,
          lastName,
          street: address || '',
          address1: address || '',
          wardCommune: wardCommune || '',
          district: district || '',
          city: district || '',
          province: province || '',
          postalCode: postalCode || '',
          country: 'VN',
          phone: phone || undefined,
          isDefault: true
        });
        updateData.addresses = addresses;
      }

      const updatedUser = await postgresUsers.updateProfile(req.user.userId, updateData);
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          _id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          dateOfBirth: updatedUser.dateOfBirth,
          gender: updatedUser.gender,
          addresses: updatedUser.addresses,
          role: updatedUser.role
        }
      });
    }

    const usersCollection = getCollection(req, 'users');
    const userId = toObjectId(req.user.userId);
    
    const user = await usersCollection.findOne({ _id: userId });
    if (!user) {
      logger.warn('❌ User not found with ID:', req.user.userId);
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    logger.debug('✅ User found:', {
      id: user._id,
      email: user.email,
      currentAddresses: user.addresses?.length || 0
    });

    // Prepare update data
    const updateData = {
      firstName,
      lastName,
      phone: phone || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender || undefined,
      updatedAt: new Date()
    };

    // Update or create default address if address information is provided
    if (address || wardCommune || district || province) {
      logger.debug('🏠 Processing address update:', { address, wardCommune, district, province });
      
      // FORCE CREATE NEW ADDRESS WITH PROPER STRUCTURE
      // Remove existing default address
      const addresses = (user.addresses || []).filter(addr => !addr.isDefault);
      
      // Create completely new address with Vietnamese format
      const newAddress = {
        type: 'both',
        firstName,
        lastName,
        street: address || '',
        address1: address || '', // Legacy support
        wardCommune: wardCommune || '',
        district: district || '',
        city: district || '', // Map district to legacy city field for backward compatibility
        province: province || '',
        postalCode: postalCode || '',
        country: 'VN',
        phone: phone || undefined,
        isDefault: true
      };
      
      addresses.push(newAddress);
      updateData.addresses = addresses;
      
      logger.debug('🆕 Force created new address with proper Vietnamese structure:', {
        street: newAddress.street,
        address1: newAddress.address1,
        wardCommune: newAddress.wardCommune,
        district: newAddress.district,
        city: newAddress.city,
        province: newAddress.province,
        postalCode: newAddress.postalCode
      });
    }

    // Update user in database
    const updateResult = await usersCollection.updateOne(
      { _id: userId },
      { $set: updateData }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Get updated user data
    const updatedUser = await usersCollection.findOne(
      { _id: userId },
      { projection: { password: 0 } }
    );
    logger.info('✅ User profile updated and saved successfully');
    logger.debug('📤 Returning user data:', {
      addresses: updatedUser.addresses,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName
    });

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        addresses: updatedUser.addresses,
        role: updatedUser.role
      }
    });

  } catch (error) {
    logger.error('❌ Update user profile error:', error);
    return handleDatabaseError(error, res, 'update user profile');
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

    const usersCollection = getCollection(req, 'users');
    const userId = toObjectId(req.user.userId);
    
    const user = await usersCollection.findOne({ _id: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const addresses = user.addresses || [];

    // If this is set as default, unset all other default addresses
    if (isDefault) {
      addresses.forEach(addr => {
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
      isDefault: isDefault || addresses.length === 0 // Set as default if first address
    };

    addresses.push(newAddress);

    // Update user with new addresses array
    await usersCollection.updateOne(
      { _id: userId },
      { 
        $set: { 
          addresses: addresses,
          updatedAt: new Date()
        } 
      }
    );

    res.json({
      success: true,
      message: 'Address saved successfully',
      address: newAddress
    });

  } catch (error) {
    logger.error('❌ Add address error:', error);
    return handleDatabaseError(error, res, 'save address');
  }
});

// Get user addresses (protected route)
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    if (req.databaseProvider === 'postgres') {
      const user = await postgresUsers.findByLegacyId(req.user.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        success: true,
        addresses: user.addresses || []
      });
    }

    const usersCollection = getCollection(req, 'users');
    const userId = toObjectId(req.user.userId);
    
    const user = await usersCollection.findOne(
      { _id: userId },
      { projection: { addresses: 1 } }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      addresses: user.addresses || []
    });

  } catch (error) {
    logger.error('❌ Get addresses error:', error);
    return handleDatabaseError(error, res, 'fetch addresses');
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

    const usersCollection = getCollection(req, 'users');
    const userId = toObjectId(req.user.userId);
    
    const user = await usersCollection.findOne({ _id: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const addresses = user.addresses || [];
    const addressIndex = addresses.findIndex(addr => addr._id?.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // If setting as default, unset other defaults
    if (updateData.isDefault) {
      addresses.forEach((addr, index) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        }
      });
    }

    // Update address fields
    Object.assign(addresses[addressIndex], updateData);
    
    // Save updated addresses to database
    await usersCollection.updateOne(
      { _id: userId },
      { 
        $set: { 
          addresses: addresses,
          updatedAt: new Date()
        } 
      }
    );

    res.json({
      success: true,
      message: 'Address updated successfully',
      address: addresses[addressIndex]
    });

  } catch (error) {
    logger.error('❌ Update address error:', error);
    return handleDatabaseError(error, res, 'update address');
  }
});

// Delete address (protected route)
router.delete('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const { addressId } = req.params;

    const usersCollection = getCollection(req, 'users');
    const userId = toObjectId(req.user.userId);
    
    const user = await usersCollection.findOne({ _id: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const addresses = user.addresses || [];
    const addressIndex = addresses.findIndex(addr => addr._id?.toString() === addressId);
    
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const wasDefault = addresses[addressIndex].isDefault;
    addresses.splice(addressIndex, 1);

    // If deleted address was default, set first remaining address as default
    if (wasDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    // Update user with modified addresses
    await usersCollection.updateOne(
      { _id: userId },
      { 
        $set: { 
          addresses: addresses,
          updatedAt: new Date()
        } 
      }
    );

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    logger.error('❌ Delete address error:', error);
    return handleDatabaseError(error, res, 'delete address');
  }
});

// Change password (protected route)
router.put('/change-password', authenticateToken, [
  body('current_password').isLength({ min: 1 }).withMessage('Mật khẩu hiện tại là bắt buộc'),
  body('new_password').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),
  body('confirm_password').optional().custom((value, { req }) => {
    if (value && value !== req.body.new_password) {
      throw new Error('Mật khẩu xác nhận không khớp');
    }
    return true;
  }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
    }

    const { current_password, new_password } = req.body;

    const usersCollection = getCollection(req, 'users');
    const userId = toObjectId(req.user.userId);

    // Get current user
    const user = await usersCollection.findOne({ 
      _id: userId,
      status: 'active' 
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu hiện tại không đúng' 
      });
    }

    // Check if new password is the same as current password
    const isSamePassword = await bcrypt.compare(new_password, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu mới không được trùng khớp với mật khẩu hiện tại' 
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await usersCollection.updateOne(
      { _id: userId },
      { 
        $set: {
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      }
    );

    res.json({ 
      success: true, 
      message: 'Đổi mật khẩu thành công' 
    });

  } catch (error) {
    handleDatabaseError(res, error, 'Failed to change password');
  }
});

// Get user orders (protected route)
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);
    
    const ordersCollection = getCollection(req, 'orders');
    const userId = toObjectId(req.user.userId);

    // Get total count
    const totalItems = await ordersCollection.countDocuments({ userId });

    // Get orders with pagination
    const orders = await ordersCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .project({
        orderNumber: 1,
        total: 1,
        status: 1,
        paymentStatus: 1,
        createdAt: 1,
        items: 1
      })
      .toArray();

    // Add item count for each order
    const ordersWithItemCount = orders.map(order => ({
      ...order,
      itemCount: order.items ? order.items.length : 0
    }));

    res.json({
      orders: ordersWithItemCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / parseInt(limit))
      }
    });

  } catch (error) {
    handleDatabaseError(res, error, 'Failed to fetch orders');
  }
});

// Get user cart items (protected route)
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const cartCollection = getCollection(req, 'cart');
    const productsCollection = getCollection(req, 'products');
    const userId = toObjectId(req.user.userId);

    // Get cart items with product details using aggregation
    const cartItems = await cartCollection.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $match: { 'product.isActive': true } },
      {
        $project: {
          _id: 1,
          quantity: 1,
          createdAt: 1,
          productId: '$product._id',
          name: '$product.name',
          nameVi: '$product.nameVi',
          slug: '$product.slug',
          price: '$product.price',
          images: '$product.images',
          stockQuantity: '$product.stockQuantity',
          weight: '$product.weight'
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );

    res.json({
      items: cartItems,
      summary: {
        itemCount: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: subtotal
      }
    });

  } catch (error) {
    handleDatabaseError(res, error, 'Failed to fetch cart items');
  }
});

// Add item to cart (protected route)
router.post('/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product ID or quantity' });
    }

    const cartCollection = getCollection(req, 'cart');
    const productsCollection = getCollection(req, 'products');
    const userId = toObjectId(req.user.userId);
    const productObjectId = toObjectId(productId);

    // Check if product exists and is active
    const product = await productsCollection.findOne({
      _id: productObjectId,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already exists in cart
    const existingItem = await cartCollection.findOne({
      userId,
      productId: productObjectId
    });

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stockQuantity < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock for requested quantity' });
      }

      await cartCollection.updateOne(
        { _id: existingItem._id },
        { 
          $set: {
            quantity: newQuantity,
            updatedAt: new Date()
          }
        }
      );
    } else {
      // Add new item
      await cartCollection.insertOne({
        userId,
        productId: productObjectId,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    res.json({ message: 'Item added to cart successfully' });

  } catch (error) {
    handleDatabaseError(res, error, 'Failed to add item to cart');
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

    const cartCollection = getCollection(req, 'cart');
    const productsCollection = getCollection(req, 'products');
    const userId = toObjectId(req.user.userId);
    const cartItemId = toObjectId(itemId);

    // Check if item belongs to user and get product info
    const cartItem = await cartCollection.findOne({
      _id: cartItemId,
      userId
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check product stock
    const product = await productsCollection.findOne({
      _id: cartItem.productId
    });

    if (!product || product.stockQuantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Update quantity
    await cartCollection.updateOne(
      { _id: cartItemId },
      { 
        $set: {
          quantity,
          updatedAt: new Date()
        }
      }
    );

    res.json({ message: 'Cart item updated successfully' });

  } catch (error) {
    handleDatabaseError(res, error, 'Failed to update cart item');
  }
});

// Remove item from cart (protected route)
router.delete('/cart/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const cartCollection = getCollection(req, 'cart');
    const userId = toObjectId(req.user.userId);
    const cartItemId = toObjectId(itemId);

    const result = await cartCollection.deleteOne({
      _id: cartItemId,
      userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });

  } catch (error) {
    handleDatabaseError(res, error, 'Failed to remove cart item');
  }
});

module.exports = router;
