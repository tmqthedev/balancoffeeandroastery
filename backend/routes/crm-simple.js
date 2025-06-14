const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Middleware to ensure admin access
router.use(authenticateToken);
router.use(requireAdmin);

// Simple test route
router.get('/health', async (req, res) => {
  res.json({
    success: true,
    message: 'CRM API is running',
    timestamp: new Date().toISOString()
  });
});

// Mock dashboard metrics
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const mockMetrics = {
      totalUsers: 2,
      totalCustomers: 1,
      totalOrders: 0,
      totalRevenue: 0,
      newCustomersToday: 0,
      ordersToday: 0,
      revenueToday: 0,
      activeTickets: 0
    };

    res.json({
      success: true,
      data: mockMetrics
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mock users list
router.get('/users', async (req, res) => {
  try {
    const mockUsers = [
      {
        id: 1,
        email: 'admin@balancoffee.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2024-01-01')
      },
      {
        id: 2,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        isActive: true,
        createdAt: new Date('2024-01-15')
      }
    ];

    res.json({
      success: true,
      data: {
        users: mockUsers,
        total: mockUsers.length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mock customers list  
router.get('/customers', async (req, res) => {
  try {
    const mockCustomers = [
      {
        id: 2,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: null,
        totalOrders: 0,
        totalSpent: 0,
        segment: 'new',
        lastOrderDate: null,
        createdAt: new Date('2024-01-15')
      }
    ];

    res.json({
      success: true,
      data: {
        customers: mockCustomers,
        total: mockCustomers.length
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mock system configurations
router.get('/system/configurations', async (req, res) => {
  try {
    const mockConfigs = [
      {
        id: 1,
        key: 'site_name',
        value: 'Balan Coffee & Roastery',
        type: 'string',
        description: 'Website name'
      },
      {
        id: 2,
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        description: 'Enable maintenance mode'
      }
    ];

    res.json({
      success: true,
      data: mockConfigs
    });
  } catch (error) {
    console.error('Error fetching configurations:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
