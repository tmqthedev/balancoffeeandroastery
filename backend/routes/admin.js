const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Middleware to authenticate and authorize admin
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  });
};

// Get all users (admin only)
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = ['isActive = 1'];
    const params = { offset: offset, limit: parseInt(limit) };

    if (search) {
      whereConditions.push('(firstName LIKE @search OR lastName LIKE @search OR email LIKE @search)');
      params.search = `%${search}%`;
    }

    if (role) {
      whereConditions.push('role = @role');
      params.role = role;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM Users ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const totalItems = countResult[0].total;

    // Get users
    const usersQuery = `
      SELECT id, email, firstName, lastName, phone, role, isActive, emailVerified, createdAt, updatedAt
      FROM Users 
      ${whereClause}
      ORDER BY createdAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const users = await db.query(usersQuery, params);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get dashboard statistics (admin only)
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    // Get various statistics
    const stats = await Promise.all([
      // Total users
      db.query('SELECT COUNT(*) as count FROM Users WHERE isActive = 1'),
      // Total products
      db.query('SELECT COUNT(*) as count FROM Products WHERE isActive = 1'),
      // Total orders
      db.query('SELECT COUNT(*) as count FROM Orders'),
      // Total revenue
      db.query('SELECT SUM(total) as revenue FROM Orders WHERE paymentStatus = \'paid\''),
      // Recent orders
      db.query(`
        SELECT TOP 5 
          o.id, o.orderNumber, o.customerName, o.total, o.status, o.createdAt
        FROM Orders o
        ORDER BY o.createdAt DESC
      `),
      // Monthly revenue (last 12 months)
      db.query(`
        SELECT 
          YEAR(createdAt) as year,
          MONTH(createdAt) as month,
          SUM(total) as revenue,
          COUNT(*) as orders
        FROM Orders 
        WHERE createdAt >= DATEADD(month, -12, GETDATE()) 
          AND paymentStatus = 'paid'
        GROUP BY YEAR(createdAt), MONTH(createdAt)
        ORDER BY year, month
      `)
    ]);

    res.json({
      totalUsers: stats[0][0].count,
      totalProducts: stats[1][0].count,
      totalOrders: stats[2][0].count,
      totalRevenue: stats[3][0].revenue || 0,
      recentOrders: stats[4],
      monthlyRevenue: stats[5]
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get all contact messages (admin only)
router.get('/contacts', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    const params = { offset: offset, limit: parseInt(limit) };

    if (status) {
      whereConditions.push('status = @status');
      params.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM Contacts ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const totalItems = countResult[0].total;

    // Get contacts
    const contactsQuery = `
      SELECT id, name, email, phone, subject, message, status, createdAt, repliedAt
      FROM Contacts 
      ${whereClause}
      ORDER BY createdAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const contacts = await db.query(contactsQuery, params);

    res.json({
      contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Update contact status (admin only)
router.put('/contacts/:id', authenticateAdmin, [
  body('status').isIn(['new', 'read', 'replied', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const updateData = { status, id: parseInt(id) };
    let updateQuery = 'UPDATE Contacts SET status = @status';

    if (status === 'replied') {
      updateQuery += ', repliedAt = GETDATE()';
    }

    updateQuery += ' WHERE id = @id';

    const result = await db.execute(updateQuery, updateData);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact status updated successfully' });

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact (admin only)
router.delete('/contacts/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute('DELETE FROM Contacts WHERE id = @id', { id: parseInt(id) });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Get all blogs (admin only)
router.get('/blogs', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    const params = { offset: offset, limit: parseInt(limit) };

    if (search) {
      whereConditions.push('(title_vi LIKE @search OR title_en LIKE @search OR content_vi LIKE @search OR content_en LIKE @search)');
      params.search = `%${search}%`;
    }

    if (status) {
      whereConditions.push('status = @status');
      params.status = status;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM Blogs ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Get blogs
    const blogsQuery = `
      SELECT id, title_vi, title_en, content_vi, content_en, excerpt_vi, excerpt_en, 
             featured_image, status, featured, slug, meta_title, meta_description, 
             created_at, updated_at, author_id
      FROM Blogs 
      ${whereClause}
      ORDER BY created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const blogs = await db.query(blogsQuery, params);

    res.json({
      blogs,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Create new blog (admin only)
router.post('/blogs', authenticateAdmin, [
  body('title_vi').notEmpty().withMessage('Vietnamese title is required'),
  body('content_vi').notEmpty().withMessage('Vietnamese content is required'),
  body('status').isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title_vi, title_en, content_vi, content_en, excerpt_vi, excerpt_en,
      featured_image, status = 'draft', featured = false, meta_title, meta_description
    } = req.body;

    // Generate slug from Vietnamese title
    const slug = title_vi.toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const insertQuery = `
      INSERT INTO Blogs (
        title_vi, title_en, content_vi, content_en, excerpt_vi, excerpt_en,
        featured_image, status, featured, slug, meta_title, meta_description, 
        author_id, created_at, updated_at
      )
      VALUES (
        @title_vi, @title_en, @content_vi, @content_en, @excerpt_vi, @excerpt_en,
        @featured_image, @status, @featured, @slug, @meta_title, @meta_description,
        @author_id, GETDATE(), GETDATE()
      )
    `;

    const params = {
      title_vi, title_en, content_vi, content_en, excerpt_vi, excerpt_en,
      featured_image, status, featured, slug, meta_title, meta_description,
      author_id: req.user.id
    };

    const result = await db.execute(insertQuery, params);
    
    res.status(201).json({ 
      message: 'Blog created successfully',
      id: result.recordset[0]?.id || result.lastInsertRowid
    });

  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// Update blog (admin only)
router.put('/blogs/:id', authenticateAdmin, [
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateFields = [];
    const params = { id: parseInt(id) };

    // Build dynamic update query
    const allowedFields = [
      'title_vi', 'title_en', 'content_vi', 'content_en', 'excerpt_vi', 'excerpt_en',
      'featured_image', 'status', 'featured', 'meta_title', 'meta_description'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = @${field}`);
        params[field] = req.body[field];
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = GETDATE()');

    const updateQuery = `UPDATE Blogs SET ${updateFields.join(', ')} WHERE id = @id`;
    
    const result = await db.execute(updateQuery, params);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ message: 'Blog updated successfully' });

  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// Delete blog (admin only)
router.delete('/blogs/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute('DELETE FROM Blogs WHERE id = @id', { id: parseInt(id) });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ message: 'Blog deleted successfully' });

  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// Get newsletter subscriptions (admin only)
router.get('/newsletters', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 15, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    const params = { offset: offset, limit: parseInt(limit) };

    if (search) {
      whereConditions.push('email LIKE @search');
      params.search = `%${search}%`;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM Subscriptions ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Get newsletters
    const newslettersQuery = `
      SELECT id, email, createdAt as created_at
      FROM Subscriptions 
      ${whereClause}
      ORDER BY createdAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const newsletters = await db.query(newslettersQuery, params);

    res.json({
      newsletters,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get newsletters error:', error);
    res.status(500).json({ error: 'Failed to fetch newsletters' });
  }
});

// Delete newsletter subscription (admin only)
router.delete('/newsletters/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute('DELETE FROM Subscriptions WHERE id = @id', { id: parseInt(id) });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Newsletter subscription not found' });
    }

    res.json({ message: 'Newsletter subscription deleted successfully' });

  } catch (error) {
    console.error('Delete newsletter error:', error);
    res.status(500).json({ error: 'Failed to delete newsletter subscription' });
  }
});

module.exports = router;
