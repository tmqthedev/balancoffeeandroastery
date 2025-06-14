const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const CRMService = require('../services/simpleCrmService'); // Use simple service for testing
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/data/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow CSV, Excel files
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

// Middleware to ensure admin access
router.use(authenticateToken);
router.use(requireAdmin);

// User Management Routes
router.get('/users', async (req, res) => {
  try {
    const filters = {
      role: req.query.role,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      search: req.query.search
    };

    const users = await CRMService.getAllUsers(filters);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'VIEW_USERS', 
      'Viewed user list',
      { filters }
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await CRMService.getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user activity logs
    const activityLogs = await CRMService.getUserActivityLogs(req.params.id);

    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'VIEW_USER_DETAIL', 
      `Viewed user details for user ID: ${req.params.id}`,
      { targetUserId: req.params.id }
    );

    res.json({
      success: true,
      data: {
        user,
        activityLogs
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const result = await CRMService.updateUser(req.params.id, req.body);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'UPDATE_USER', 
      `Updated user ID: ${req.params.id}`,
      { targetUserId: req.params.id, changes: req.body }
    );

    res.json(result);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });  }
});

// User Activity Routes
router.get('/users/:id/activity', async (req, res) => {
  try {
    const userId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;
    
    const activityLogs = await CRMService.getUserActivityLogs(userId, limit);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'VIEW_USER_ACTIVITY', 
      `Viewed activity logs for user ID: ${userId}`,
      { targetUserId: userId }
    );

    res.json({
      success: true,
      data: {
        logs: activityLogs
      }
    });
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/users/:id/activity', async (req, res) => {
  try {
    const userId = req.params.id;
    const { action, description, metadata } = req.body;
    
    const result = await CRMService.logUserActivity(userId, action, description, metadata);
    
    if (result) {
      res.json({
        success: true,
        message: 'Activity logged successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to log activity'
      });
    }
  } catch (error) {
    console.error('Error logging user activity:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Customer Management Routes
router.get('/customers', async (req, res) => {
  try {
    const filters = {
      ...req.query,
      role: 'customer' // Only get customers
    };

    const customers = await CRMService.getAllCustomers(filters);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'VIEW_CUSTOMERS', 
      'Viewed customers list',
      { filters }
    );

    res.json({
      success: true,
      data: {
        customers
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

router.get('/customers/:id/profile', async (req, res) => {
  try {
    const profile = await CRMService.getCustomerProfile(req.params.id);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'VIEW_CUSTOMER_PROFILE', 
      `Viewed customer profile for customer ID: ${req.params.id}`,
      { customerId: req.params.id }
    );

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/customers/:id/interactions', async (req, res) => {
  try {
    const interactionData = {
      ...req.body,
      customerId: req.params.id,
      createdBy: req.user.id
    };

    const result = await CRMService.addCustomerInteraction(interactionData);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'ADD_CUSTOMER_INTERACTION', 
      `Added interaction for customer ID: ${req.params.id}`,
      { customerId: req.params.id, interactionType: req.body.interactionType }
    );

    res.json(result);
  } catch (error) {
    console.error('Error adding customer interaction:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Sales Management Routes
router.get('/sales/opportunities', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      assignedTo: req.query.assignedTo,
      stageId: req.query.stageId
    };

    const opportunities = await CRMService.getSalesOpportunities(filters);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'VIEW_OPPORTUNITIES', 
      'Viewed sales opportunities',
      { filters }
    );

    res.json({
      success: true,
      data: opportunities
    });
  } catch (error) {
    console.error('Error fetching sales opportunities:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/sales/opportunities', async (req, res) => {
  try {
    const result = await CRMService.createSalesOpportunity(req.body);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'CREATE_OPPORTUNITY', 
      `Created sales opportunity: ${req.body.title}`,
      { opportunityData: req.body }
    );

    res.json(result);
  } catch (error) {
    console.error('Error creating sales opportunity:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/sales/pipeline-stages', async (req, res) => {
  try {
    const stages = await CRMService.getSalesPipelineStages();
    
    res.json({
      success: true,
      data: stages
    });
  } catch (error) {
    console.error('Error fetching pipeline stages:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Marketing Management Routes
router.get('/marketing/campaigns', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      type: req.query.type
    };

    const campaigns = await CRMService.getMarketingCampaigns(filters);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'VIEW_CAMPAIGNS', 
      'Viewed marketing campaigns',
      { filters }
    );

    res.json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    console.error('Error fetching marketing campaigns:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/marketing/campaigns', async (req, res) => {
  try {
    const campaignData = {
      ...req.body,
      createdBy: req.user.id
    };

    const result = await CRMService.createMarketingCampaign(campaignData);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'CREATE_CAMPAIGN', 
      `Created marketing campaign: ${req.body.name}`,
      { campaignData }
    );

    res.json(result);
  } catch (error) {
    console.error('Error creating marketing campaign:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Support Management Routes
router.get('/support/tickets', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      assignedTo: req.query.assignedTo
    };

    const tickets = await CRMService.getSupportTickets(filters);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'VIEW_TICKETS', 
      'Viewed support tickets',
      { filters }
    );

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/support/tickets', async (req, res) => {
  try {
    const result = await CRMService.createSupportTicket(req.body);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'CREATE_TICKET', 
      `Created support ticket: ${req.body.subject}`,
      { ticketData: req.body }
    );

    res.json(result);
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Analytics and Reporting Routes
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const dateRange = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const metrics = await CRMService.getDashboardMetrics(dateRange);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'VIEW_DASHBOARD', 
      'Viewed CRM dashboard metrics',
      { dateRange }
    );

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// System Configuration Routes
router.get('/system/configurations', async (req, res) => {
  try {
    const module = req.query.module;
    const configurations = await CRMService.getSystemConfigurations(module);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'VIEW_CONFIGURATIONS', 
      'Viewed system configurations',
      { module }
    );

    res.json({
      success: true,
      data: configurations
    });
  } catch (error) {
    console.error('Error fetching system configurations:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/system/configurations/:module/:key', async (req, res) => {
  try {
    const { module, key } = req.params;
    const { value } = req.body;

    const result = await CRMService.updateSystemConfiguration(
      module, 
      key, 
      value, 
      req.user.id
    );
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'UPDATE_CONFIGURATION', 
      `Updated system configuration: ${module}.${key}`,
      { module, key, value }
    );

    res.json(result);
  } catch (error) {
    console.error('Error updating system configuration:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Data Management Routes
router.post('/data/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const jobData = {
      type: 'import',
      dataType: req.body.dataType,
      fileName: req.file.originalname,
      filePath: req.file.path,
      options: req.body.options ? JSON.parse(req.body.options) : {},
      createdBy: req.user.id
    };

    const result = await CRMService.createDataJob(jobData);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'DATA_IMPORT', 
      `Started data import: ${req.file.originalname}`,
      { dataType: req.body.dataType, fileName: req.file.originalname }
    );

    res.json(result);
  } catch (error) {
    console.error('Error creating import job:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/data/export', async (req, res) => {
  try {
    const jobData = {
      type: 'export',
      dataType: req.body.dataType,
      options: req.body.options || {},
      createdBy: req.user.id
    };

    const result = await CRMService.createDataJob(jobData);
    
    // Log admin activity
    await CRMService.logUserActivity(
      req.user.id, 
      'DATA_EXPORT', 
      `Started data export: ${req.body.dataType}`,
      { dataType: req.body.dataType }
    );

    res.json(result);
  } catch (error) {
    console.error('Error creating export job:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/data/jobs', async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status
    };

    const jobs = await CRMService.getDataJobs(filters);
    
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching data jobs:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  res.json({
    success: true,
    message: 'CRM API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
