const sql = require('mssql');
const db = require('../config/database');

class CRMService {
  // User Management
  static async getAllUsers(filters = {}) {
    try {
      const pool = await db.getPool();
      let query = `
        SELECT u.*, ur.name as roleName, ur.nameVi as roleNameVi,
               manager.firstName + ' ' + manager.lastName as managerName
        FROM Users u
        LEFT JOIN UserRoles ur ON u.roleId = ur.id
        LEFT JOIN Users manager ON u.manager = manager.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.role) {
        query += ` AND u.role = @role`;
        params.push({ name: 'role', type: sql.NVarChar, value: filters.role });
      }
      
      if (filters.isActive !== undefined) {
        query += ` AND u.isActive = @isActive`;
        params.push({ name: 'isActive', type: sql.Bit, value: filters.isActive });
      }
      
      if (filters.search) {
        query += ` AND (u.firstName LIKE @search OR u.lastName LIKE @search OR u.email LIKE @search)`;
        params.push({ name: 'search', type: sql.NVarChar, value: `%${filters.search}%` });
      }
      
      query += ` ORDER BY u.createdAt DESC`;
      
      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });
      
      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  static async getUserById(userId) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT u.*, ur.name as roleName, ur.nameVi as roleNameVi,
                 manager.firstName + ' ' + manager.lastName as managerName
          FROM Users u
          LEFT JOIN UserRoles ur ON u.roleId = ur.id
          LEFT JOIN Users manager ON u.manager = manager.id
          WHERE u.id = @userId
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  static async updateUser(userId, userData) {
    try {
      const pool = await db.getPool();
      const {
        firstName, lastName, email, phone, address, city, postalCode,
        role, roleId, department, manager, territories, salesQuota, isActive
      } = userData;      await pool.request()
        .input('userId', sql.Int, userId)
        .input('firstName', sql.NVarChar, firstName)
        .input('lastName', sql.NVarChar, lastName)
        .input('email', sql.NVarChar, email)
        .input('phone', sql.NVarChar, phone)
        .input('address', sql.NVarChar, address)
        .input('city', sql.NVarChar, city)
        .input('postalCode', sql.NVarChar, postalCode)
        .input('role', sql.NVarChar, role)
        .input('roleId', sql.Int, roleId)
        .input('department', sql.NVarChar, department)
        .input('manager', sql.Int, manager)
        .input('territories', sql.NVarChar, territories)
        .input('salesQuota', sql.Decimal(12, 2), salesQuota)
        .input('isActive', sql.Bit, isActive)
        .query(`
          UPDATE Users 
          SET firstName = @firstName, lastName = @lastName, email = @email,
              phone = @phone, address = @address, city = @city,
              postalCode = @postalCode, role = @role, roleId = @roleId,
              department = @department, manager = @manager,
              territories = @territories, salesQuota = @salesQuota,
              isActive = @isActive, updatedAt = GETDATE()
          WHERE id = @userId
        `);

      return { success: true, message: 'User updated successfully' };
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  static async logUserActivity(userId, action, description, metadata = {}) {
    try {
      const pool = await db.getPool();
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('action', sql.NVarChar, action)
        .input('description', sql.NVarChar, description)
        .input('metadata', sql.NText, JSON.stringify(metadata))
        .query(`
          INSERT INTO UserActivityLogs (userId, action, description, metadata)
          VALUES (@userId, @action, @description, @metadata)
        `);
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  }

  static async getUserActivityLogs(userId, limit = 100) {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit) * FROM UserActivityLogs
          WHERE userId = @userId
          ORDER BY createdAt DESC
        `);
      
      return result.recordset;
    } catch (error) {
      throw new Error(`Error fetching user activity logs: ${error.message}`);
    }
  }

  // Customer Management
  static async getCustomerProfile(customerId) {
    try {
      const pool = await db.getPool();
      
      // Get customer basic info
      const customerResult = await pool.request()
        .input('customerId', sql.Int, customerId)
        .query(`
          SELECT u.*, 
                 COUNT(DISTINCT o.id) as totalOrders,
                 SUM(o.total) as totalSpent,
                 MAX(o.createdAt) as lastOrderDate,
                 MIN(o.createdAt) as firstOrderDate
          FROM Users u
          LEFT JOIN Orders o ON u.id = o.userId
          WHERE u.id = @customerId AND u.role = 'customer'
          GROUP BY u.id, u.email, u.firstName, u.lastName, u.phone, u.address, 
                   u.city, u.postalCode, u.role, u.isActive, u.emailVerified,
                   u.facebookId, u.profileImage, u.createdAt, u.updatedAt
        `);

      if (customerResult.recordset.length === 0) {
        throw new Error('Customer not found');
      }

      const customer = customerResult.recordset[0];

      // Get recent orders
      const ordersResult = await pool.request()
        .input('customerId', sql.Int, customerId)
        .query(`
          SELECT TOP 10 * FROM Orders
          WHERE userId = @customerId
          ORDER BY createdAt DESC
        `);

      // Get customer segments
      const segmentsResult = await pool.request()
        .input('customerId', sql.Int, customerId)
        .query(`
          SELECT cs.name, cs.nameVi, cs.description, cs.descriptionVi, csa.assignedAt
          FROM CustomerSegmentAssignments csa
          JOIN CustomerSegments cs ON csa.segmentId = cs.id
          WHERE csa.customerId = @customerId AND cs.isActive = 1
        `);

      // Get recent interactions
      const interactionsResult = await pool.request()
        .input('customerId', sql.Int, customerId)
        .query(`
          SELECT TOP 10 ci.*, u.firstName + ' ' + u.lastName as staffName
          FROM CustomerInteractions ci
          LEFT JOIN Users u ON ci.assignedTo = u.id
          WHERE ci.customerId = @customerId
          ORDER BY ci.createdAt DESC
        `);

      return {
        customer,
        recentOrders: ordersResult.recordset,
        segments: segmentsResult.recordset,
        recentInteractions: interactionsResult.recordset
      };
    } catch (error) {
      throw new Error(`Error fetching customer profile: ${error.message}`);
    }
  }

  static async addCustomerInteraction(interactionData) {
    try {
      const pool = await db.getPool();
      const {
        customerId, interactionType, channel, subject, content,
        assignedTo, scheduledAt, metadata, createdBy
      } = interactionData;

      const result = await pool.request()
        .input('customerId', sql.Int, customerId)
        .input('interactionType', sql.NVarChar, interactionType)
        .input('channel', sql.NVarChar, channel)
        .input('subject', sql.NVarChar, subject)
        .input('content', sql.NText, content)
        .input('assignedTo', sql.Int, assignedTo)
        .input('scheduledAt', sql.DateTime2, scheduledAt)
        .input('metadata', sql.NText, metadata ? JSON.stringify(metadata) : null)
        .input('createdBy', sql.Int, createdBy)
        .query(`
          INSERT INTO CustomerInteractions 
          (customerId, interactionType, channel, subject, content, assignedTo, scheduledAt, metadata, createdBy)
          OUTPUT INSERTED.id
          VALUES (@customerId, @interactionType, @channel, @subject, @content, @assignedTo, @scheduledAt, @metadata, @createdBy)
        `);

      return { success: true, id: result.recordset[0].id };
    } catch (error) {
      throw new Error(`Error adding customer interaction: ${error.message}`);
    }
  }

  // Sales Management
  static async getSalesOpportunities(filters = {}) {
    try {
      const pool = await db.getPool();
      let query = `
        SELECT so.*, 
               c.firstName + ' ' + c.lastName as customerName,
               c.email as customerEmail,
               s.name as stageName, s.nameVi as stageNameVi,
               u.firstName + ' ' + u.lastName as assignedToName
        FROM SalesOpportunities so
        JOIN Users c ON so.customerId = c.id
        JOIN SalesPipelineStages s ON so.stageId = s.id
        JOIN Users u ON so.assignedTo = u.id
        WHERE 1=1
      `;

      const params = [];

      if (filters.status) {
        query += ` AND so.status = @status`;
        params.push({ name: 'status', type: sql.NVarChar, value: filters.status });
      }

      if (filters.assignedTo) {
        query += ` AND so.assignedTo = @assignedTo`;
        params.push({ name: 'assignedTo', type: sql.Int, value: filters.assignedTo });
      }

      if (filters.stageId) {
        query += ` AND so.stageId = @stageId`;
        params.push({ name: 'stageId', type: sql.Int, value: filters.stageId });
      }

      query += ` ORDER BY so.expectedCloseDate ASC`;

      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Error fetching sales opportunities: ${error.message}`);
    }
  }

  static async createSalesOpportunity(opportunityData) {
    try {
      const pool = await db.getPool();
      const {
        title, customerId, stageId, assignedTo, value, probability,
        expectedCloseDate, description, notes
      } = opportunityData;

      const result = await pool.request()
        .input('title', sql.NVarChar, title)
        .input('customerId', sql.Int, customerId)
        .input('stageId', sql.Int, stageId)
        .input('assignedTo', sql.Int, assignedTo)
        .input('value', sql.Decimal(12, 2), value)
        .input('probability', sql.Decimal(5, 2), probability)
        .input('expectedCloseDate', sql.DateTime2, expectedCloseDate)
        .input('description', sql.NText, description)
        .input('notes', sql.NText, notes)
        .query(`
          INSERT INTO SalesOpportunities 
          (title, customerId, stageId, assignedTo, value, probability, expectedCloseDate, description, notes)
          OUTPUT INSERTED.id
          VALUES (@title, @customerId, @stageId, @assignedTo, @value, @probability, @expectedCloseDate, @description, @notes)
        `);

      return { success: true, id: result.recordset[0].id };
    } catch (error) {
      throw new Error(`Error creating sales opportunity: ${error.message}`);
    }
  }

  static async getSalesPipelineStages() {
    try {
      const pool = await db.getPool();
      const result = await pool.request()
        .query(`
          SELECT * FROM SalesPipelineStages
          WHERE isActive = 1
          ORDER BY orderIndex
        `);
      
      return result.recordset;
    } catch (error) {
      throw new Error(`Error fetching pipeline stages: ${error.message}`);
    }
  }

  // Marketing Management
  static async getMarketingCampaigns(filters = {}) {
    try {
      const pool = await db.getPool();
      let query = `
        SELECT mc.*, 
               cb.firstName + ' ' + cb.lastName as createdByName,
               ab.firstName + ' ' + ab.lastName as assignedToName
        FROM MarketingCampaigns mc
        JOIN Users cb ON mc.createdBy = cb.id
        LEFT JOIN Users ab ON mc.assignedTo = ab.id
        WHERE 1=1
      `;

      const params = [];

      if (filters.status) {
        query += ` AND mc.status = @status`;
        params.push({ name: 'status', type: sql.NVarChar, value: filters.status });
      }

      if (filters.type) {
        query += ` AND mc.type = @type`;
        params.push({ name: 'type', type: sql.NVarChar, value: filters.type });
      }

      query += ` ORDER BY mc.createdAt DESC`;

      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Error fetching marketing campaigns: ${error.message}`);
    }
  }

  static async createMarketingCampaign(campaignData) {
    try {
      const pool = await db.getPool();
      const {
        name, nameVi, type, budget, targetAudience, channels,
        startDate, endDate, description, goals, createdBy, assignedTo
      } = campaignData;

      const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('nameVi', sql.NVarChar, nameVi)
        .input('type', sql.NVarChar, type)
        .input('budget', sql.Decimal(12, 2), budget)
        .input('targetAudience', sql.NText, targetAudience ? JSON.stringify(targetAudience) : null)
        .input('channels', sql.NVarChar, channels)
        .input('startDate', sql.DateTime2, startDate)
        .input('endDate', sql.DateTime2, endDate)
        .input('description', sql.NText, description)
        .input('goals', sql.NText, goals ? JSON.stringify(goals) : null)
        .input('createdBy', sql.Int, createdBy)
        .input('assignedTo', sql.Int, assignedTo)
        .query(`
          INSERT INTO MarketingCampaigns 
          (name, nameVi, type, budget, targetAudience, channels, startDate, endDate, description, goals, createdBy, assignedTo)
          OUTPUT INSERTED.id
          VALUES (@name, @nameVi, @type, @budget, @targetAudience, @channels, @startDate, @endDate, @description, @goals, @createdBy, @assignedTo)
        `);

      return { success: true, id: result.recordset[0].id };
    } catch (error) {
      throw new Error(`Error creating marketing campaign: ${error.message}`);
    }
  }

  // Support Management
  static async getSupportTickets(filters = {}) {
    try {
      const pool = await db.getPool();
      let query = `
        SELECT st.*, 
               c.firstName + ' ' + c.lastName as customerName,
               u.firstName + ' ' + u.lastName as assignedToName
        FROM SupportTickets st
        LEFT JOIN Users c ON st.customerId = c.id
        LEFT JOIN Users u ON st.assignedTo = u.id
        WHERE 1=1
      `;

      const params = [];

      if (filters.status) {
        query += ` AND st.status = @status`;
        params.push({ name: 'status', type: sql.NVarChar, value: filters.status });
      }

      if (filters.priority) {
        query += ` AND st.priority = @priority`;
        params.push({ name: 'priority', type: sql.NVarChar, value: filters.priority });
      }

      if (filters.assignedTo) {
        query += ` AND st.assignedTo = @assignedTo`;
        params.push({ name: 'assignedTo', type: sql.Int, value: filters.assignedTo });
      }

      query += ` ORDER BY st.createdAt DESC`;

      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Error fetching support tickets: ${error.message}`);
    }
  }

  static async createSupportTicket(ticketData) {
    try {
      const pool = await db.getPool();
      const {
        customerId, customerEmail, customerName, subject, description,
        priority, category, assignedTo
      } = ticketData;

      // Generate ticket number
      const ticketNumber = 'TK' + Date.now();

      const result = await pool.request()
        .input('ticketNumber', sql.NVarChar, ticketNumber)
        .input('customerId', sql.Int, customerId)
        .input('customerEmail', sql.NVarChar, customerEmail)
        .input('customerName', sql.NVarChar, customerName)
        .input('subject', sql.NVarChar, subject)
        .input('description', sql.NText, description)
        .input('priority', sql.NVarChar, priority)
        .input('category', sql.NVarChar, category)
        .input('assignedTo', sql.Int, assignedTo)
        .query(`
          INSERT INTO SupportTickets 
          (ticketNumber, customerId, customerEmail, customerName, subject, description, priority, category, assignedTo)
          OUTPUT INSERTED.id
          VALUES (@ticketNumber, @customerId, @customerEmail, @customerName, @subject, @description, @priority, @category, @assignedTo)
        `);

      return { success: true, id: result.recordset[0].id, ticketNumber };
    } catch (error) {
      throw new Error(`Error creating support ticket: ${error.message}`);
    }
  }

  // Analytics and Reporting
  static async getDashboardMetrics(dateRange = {}) {
    try {
      const pool = await db.getPool();
      const { startDate, endDate } = dateRange;

      let dateFilter = '';
      const params = [];

      if (startDate && endDate) {
        dateFilter = ' AND createdAt BETWEEN @startDate AND @endDate';
        params.push(
          { name: 'startDate', type: sql.DateTime2, value: startDate },
          { name: 'endDate', type: sql.DateTime2, value: endDate }
        );
      }

      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });

      // Customer metrics
      const customerMetrics = await request.query(`
        SELECT 
          COUNT(*) as totalCustomers,
          COUNT(CASE WHEN role = 'customer' THEN 1 END) as activeCustomers,
          COUNT(CASE WHEN createdAt >= DATEADD(day, -30, GETDATE()) THEN 1 END) as newCustomersLast30Days
        FROM Users
        WHERE 1=1 ${dateFilter}
      `);

      // Sales metrics
      const salesMetrics = await request.query(`
        SELECT 
          COUNT(*) as totalOrders,
          SUM(total) as totalRevenue,
          AVG(total) as averageOrderValue,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completedOrders
        FROM Orders
        WHERE 1=1 ${dateFilter}
      `);

      // Support metrics
      const supportMetrics = await request.query(`
        SELECT 
          COUNT(*) as totalTickets,
          COUNT(CASE WHEN status = 'open' THEN 1 END) as openTickets,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolvedTickets,
          AVG(CASE WHEN resolvedAt IS NOT NULL THEN DATEDIFF(hour, createdAt, resolvedAt) END) as avgResolutionTimeHours
        FROM SupportTickets
        WHERE 1=1 ${dateFilter}
      `);

      return {
        customers: customerMetrics.recordset[0],
        sales: salesMetrics.recordset[0],
        support: supportMetrics.recordset[0]
      };
    } catch (error) {
      throw new Error(`Error fetching dashboard metrics: ${error.message}`);
    }
  }

  // System Configuration
  static async getSystemConfigurations(module = null) {
    try {
      const pool = await db.getPool();
      let query = 'SELECT * FROM SystemConfigurations';
      
      if (module) {
        query += ' WHERE module = @module';
      }
      
      query += ' ORDER BY module, configKey';

      const request = pool.request();
      if (module) {
        request.input('module', sql.NVarChar, module);
      }

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Error fetching system configurations: ${error.message}`);
    }
  }

  static async updateSystemConfiguration(module, configKey, configValue, updatedBy) {
    try {
      const pool = await db.getPool();      await pool.request()
        .input('module', sql.NVarChar, module)
        .input('configKey', sql.NVarChar, configKey)
        .input('configValue', sql.NText, configValue)
        .input('updatedBy', sql.Int, updatedBy)
        .query(`
          UPDATE SystemConfigurations 
          SET configValue = @configValue, updatedBy = @updatedBy, updatedAt = GETDATE()
          WHERE module = @module AND configKey = @configKey
        `);

      return { success: true, message: 'Configuration updated successfully' };
    } catch (error) {
      throw new Error(`Error updating system configuration: ${error.message}`);
    }
  }

  // Data Management
  static async createDataJob(jobData) {
    try {
      const pool = await db.getPool();
      const { type, dataType, fileName, filePath, options, createdBy } = jobData;

      const result = await pool.request()
        .input('type', sql.NVarChar, type)
        .input('dataType', sql.NVarChar, dataType)
        .input('fileName', sql.NVarChar, fileName)
        .input('filePath', sql.NVarChar, filePath)
        .input('options', sql.NText, options ? JSON.stringify(options) : null)
        .input('createdBy', sql.Int, createdBy)
        .query(`
          INSERT INTO DataJobs (type, dataType, fileName, filePath, options, createdBy)
          OUTPUT INSERTED.id
          VALUES (@type, @dataType, @fileName, @filePath, @options, @createdBy)
        `);

      return { success: true, id: result.recordset[0].id };
    } catch (error) {
      throw new Error(`Error creating data job: ${error.message}`);
    }
  }

  static async getDataJobs(filters = {}) {
    try {
      const pool = await db.getPool();
      let query = `
        SELECT dj.*, u.firstName + ' ' + u.lastName as createdByName
        FROM DataJobs dj
        JOIN Users u ON dj.createdBy = u.id
        WHERE 1=1
      `;

      const params = [];

      if (filters.type) {
        query += ` AND dj.type = @type`;
        params.push({ name: 'type', type: sql.NVarChar, value: filters.type });
      }

      if (filters.status) {
        query += ` AND dj.status = @status`;
        params.push({ name: 'status', type: sql.NVarChar, value: filters.status });
      }

      query += ` ORDER BY dj.createdAt DESC`;

      const request = pool.request();
      params.forEach(param => {
        request.input(param.name, param.type, param.value);
      });

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Error fetching data jobs: ${error.message}`);
    }
  }
}

module.exports = CRMService;
