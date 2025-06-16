const db = require('../config/database');

// CRM Service adapted for both real DB and mock DB
class CRMService {
    // Helper method to handle both real and mock database
  static async executeQuery(query, params = {}) {
    try {
      // Check if we're in mock mode first
      if (db.isMockMode?.()) {
        // Mock database mode
        return this.handleMockQuery(query, params);
      } else {
        // Real database mode
        const pool = await db.getPool();
        const request = pool.request();
        
        // Add parameters to request
        Object.keys(params).forEach(key => {
          request.input(key, params[key]);
        });
        
        const result = await request.query(query);
        return result.recordset;
      }
    } catch (error) {
      console.error('CRM Service Query Error:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }
  static handleMockQuery(query, params) {
    // Simple mock query handler for testing
    const lowerQuery = query.toLowerCase().trim();
    
    if (lowerQuery.includes('select') && lowerQuery.includes('users')) {
      return db.mockData?.users || [];
    }
    
    if (lowerQuery.includes('select') && lowerQuery.includes('userroles')) {
      return db.mockData?.userRoles || [];
    }
    
    if (lowerQuery.includes('select') && lowerQuery.includes('customersegments')) {
      return db.mockData?.customerSegments || [];
    }
    
    if (lowerQuery.includes('select') && lowerQuery.includes('salesopportunities')) {
      return db.mockData?.salesOpportunities || [];
    }
    
    if (lowerQuery.includes('select') && lowerQuery.includes('supporttickets')) {
      return db.mockData?.supportTickets || [];
    }
    
    if (lowerQuery.includes('select') && lowerQuery.includes('systemconfigurations')) {
      return db.mockData?.systemConfigurations || [];
    }
    
    // Default empty result
    return [];
  }
  // Dashboard Analytics
  static async getDashboardMetrics() {
    try {
      console.log('🔍 getDashboardMetrics called');
      console.log('🔍 db.isMockMode:', typeof db.isMockMode);
      console.log('🔍 db.isMockMode():', db.isMockMode ? db.isMockMode() : 'function not available');
      
      if (db.isMockMode && typeof db.isMockMode === 'function' && db.isMockMode()) {
        console.log('📊 Using mock metrics');
        // Mock metrics
        return {
          totalUsers: db.mockData?.users?.length || 0,
          totalCustomers: db.mockData?.users?.filter(u => u.role === 'customer')?.length || 0,
          totalOrders: 15,  // Mock data
          totalRevenue: 25000000,
          newCustomersToday: 2,
          ordersToday: 5,
          revenueToday: 1500000,
          activeTickets: db.mockData?.supportTickets?.filter(t => t.status === 'open')?.length || 0,
          salesOpportunities: db.mockData?.salesOpportunities?.length || 0,
          conversionRate: 12.5,
          avgOrderValue: 1666667,
          customerSatisfaction: 4.8
        };
      } else {
        console.log('📊 Using real database metrics');
        // Real database queries for production
        const metrics = {};
        
        // Total users
        const userCount = await this.executeQuery('SELECT COUNT(*) as count FROM Users');
        metrics.totalUsers = userCount[0]?.count || 0;
        
        // Total customers
        const customerCount = await this.executeQuery("SELECT COUNT(*) as count FROM Users WHERE role = 'customer'");
        metrics.totalCustomers = customerCount[0]?.count || 0;
        
        // Add more real queries here...
        
        return metrics;
      }
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      throw new Error(`Error fetching dashboard metrics: ${error.message}`);
    }
  }

  // User Management
  static async getAllUsers(filters = {}) {
    try {
      if (db.isMockMode?.()) {
        let users = db.mockData?.users || [];
        
        // Apply filters
        if (filters.role) {
          users = users.filter(u => u.role === filters.role);
        }
        
        if (filters.isActive !== undefined) {
          users = users.filter(u => u.isActive === filters.isActive);
        }
        
        if (filters.search) {
          const search = filters.search.toLowerCase();
          users = users.filter(u => 
            u.firstName?.toLowerCase().includes(search) ||
            u.lastName?.toLowerCase().includes(search) ||
            u.email?.toLowerCase().includes(search)
          );
        }
        
        // Add role name from userRoles
        const userRoles = db.mockData?.userRoles || [];
        users = users.map(user => {
          const role = userRoles.find(r => r.id === user.roleId);
          return {
            ...user,
            roleName: role?.name || null,
            roleNameVi: role?.nameVi || null
          };
        });
        
        return users;
      } else {
        // Real database query
        let query = `
          SELECT u.*, ur.name as roleName, ur.nameVi as roleNameVi,
                 manager.firstName + ' ' + manager.lastName as managerName
          FROM Users u
          LEFT JOIN UserRoles ur ON u.roleId = ur.id
          LEFT JOIN Users manager ON u.manager = manager.id
          WHERE 1=1
        `;
        
        const params = {};
        
        if (filters.role) {
          query += ` AND u.role = @role`;
          params.role = filters.role;
        }
        
        if (filters.isActive !== undefined) {
          query += ` AND u.isActive = @isActive`;
          params.isActive = filters.isActive;
        }
        
        if (filters.search) {
          query += ` AND (u.firstName LIKE @search OR u.lastName LIKE @search OR u.email LIKE @search)`;
          params.search = `%${filters.search}%`;
        }
        
        query += ` ORDER BY u.createdAt DESC`;
        
        return await this.executeQuery(query, params);
      }
    } catch (error) {
      console.error('Get all users error:', error);
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  static async getUserById(userId) {
    try {
      if (db.isMockMode && db.isMockMode()) {
        const users = db.mockData?.users || [];
        const user = users.find(u => u.id == userId);
        
        if (user?.roleId) {
          const userRoles = db.mockData?.userRoles || [];
          const role = userRoles.find(r => r.id === user.roleId);
          user.roleName = role?.name || null;
          user.roleNameVi = role?.nameVi || null;
        }
        
        return user;
      } else {
        const query = `
          SELECT u.*, ur.name as roleName, ur.nameVi as roleNameVi,
                 manager.firstName + ' ' + manager.lastName as managerName
          FROM Users u
          LEFT JOIN UserRoles ur ON u.roleId = ur.id
          LEFT JOIN Users manager ON u.manager = manager.id
          WHERE u.id = @userId
        `;
        
        const result = await this.executeQuery(query, { userId });
        return result[0] || null;
      }
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Customer Management
  static async getAllCustomers(filters = {}) {
    try {
      const customerFilters = { ...filters, role: 'customer' };
      return await this.getAllUsers(customerFilters);
    } catch (error) {
      console.error('Get all customers error:', error);
      throw new Error(`Error fetching customers: ${error.message}`);
    }
  }

  // Sales Management
  static async getAllSalesOpportunities(filters = {}) {
    try {
      if (db.isMockMode && db.isMockMode()) {
        let opportunities = db.mockData?.salesOpportunities || [];
        
        // Apply basic filters
        if (filters.status) {
          opportunities = opportunities.filter(o => o.status === filters.status);
        }
        
        return opportunities;
      } else {
        let query = `
          SELECT so.*, u.firstName + ' ' + u.lastName as customerName,
                 assigned.firstName + ' ' + assigned.lastName as assignedToName
          FROM SalesOpportunities so
          LEFT JOIN Users u ON so.customerId = u.id
          LEFT JOIN Users assigned ON so.assignedTo = assigned.id
          WHERE 1=1
        `;
        
        const params = {};
        
        if (filters.status) {
          query += ` AND so.status = @status`;
          params.status = filters.status;
        }
        
        query += ` ORDER BY so.createdAt DESC`;
        
        return await this.executeQuery(query, params);
      }
    } catch (error) {
      console.error('Get sales opportunities error:', error);
      throw new Error(`Error fetching sales opportunities: ${error.message}`);
    }
  }

  // Support Management
  static async getAllSupportTickets(filters = {}) {
    try {
      if (db.isMockMode && db.isMockMode()) {
        let tickets = db.mockData?.supportTickets || [];
        
        if (filters.status) {
          tickets = tickets.filter(t => t.status === filters.status);
        }
        
        return tickets;
      } else {
        let query = `
          SELECT st.*, u.firstName + ' ' + u.lastName as customerName,
                 assigned.firstName + ' ' + assigned.lastName as assignedToName
          FROM SupportTickets st
          LEFT JOIN Users u ON st.customerId = u.id
          LEFT JOIN Users assigned ON st.assignedTo = assigned.id
          WHERE 1=1
        `;
        
        const params = {};
        
        if (filters.status) {
          query += ` AND st.status = @status`;
          params.status = filters.status;
        }
        
        query += ` ORDER BY st.createdAt DESC`;
        
        return await this.executeQuery(query, params);
      }
    } catch (error) {
      console.error('Get support tickets error:', error);
      throw new Error(`Error fetching support tickets: ${error.message}`);
    }
  }

  // System Configuration
  static async getSystemConfigurations(module = null) {
    try {
      if (db.isMockMode && db.isMockMode()) {
        let configs = db.mockData?.systemConfigurations || [];
        
        if (module) {
          configs = configs.filter(c => c.module === module);
        }
        
        return configs;
      } else {
        let query = `SELECT * FROM SystemConfigurations`;
        const params = {};
        
        if (module) {
          query += ` WHERE module = @module`;
          params.module = module;
        }
        
        query += ` ORDER BY module, configKey`;
        
        return await this.executeQuery(query, params);
      }
    } catch (error) {
      console.error('Get system configurations error:', error);
      throw new Error(`Error fetching system configurations: ${error.message}`);
    }
  }

  // User Activity Logs
  static async getUserActivityLogs(userId = null, limit = 50) {
    try {
      if (db.isMockMode && db.isMockMode()) {
        let logs = db.mockData?.userActivityLogs || [];
        
        if (userId) {
          logs = logs.filter(l => l.userId == userId);
        }
        
        return logs.slice(0, limit);
      } else {
        let query = `
          SELECT ual.*, u.firstName + ' ' + u.lastName as userName
          FROM UserActivityLogs ual
          LEFT JOIN Users u ON ual.userId = u.id
        `;
        
        const params = {};
        
        if (userId) {
          query += ` WHERE ual.userId = @userId`;
          params.userId = userId;
        }
        
        query += ` ORDER BY ual.createdAt DESC`;
        
        if (limit) {
          query += ` OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`;
          params.limit = limit;
        }
        
        return await this.executeQuery(query, params);
      }
    } catch (error) {
      console.error('Get user activity logs error:', error);
      throw new Error(`Error fetching user activity logs: ${error.message}`);
    }
  }

  // Helper method to log user activity
  static async logUserActivity(userId, action, description, metadata = {}) {
    try {
      if (db.isMockMode && db.isMockMode()) {
        // In mock mode, just add to mock data
        if (!db.mockData.userActivityLogs) {
          db.mockData.userActivityLogs = [];
        }
        
        db.mockData.userActivityLogs.unshift({
          id: Date.now(),
          userId,
          action,
          description,
          metadata: JSON.stringify(metadata),
          createdAt: new Date()
        });
        
        return true;
      } else {
        const query = `
          INSERT INTO UserActivityLogs (userId, action, description, metadata)
          VALUES (@userId, @action, @description, @metadata)
        `;
        
        await this.executeQuery(query, {
          userId,
          action,
          description,
          metadata: JSON.stringify(metadata)
        });
        
        return true;
      }
    } catch (error) {
      console.error('Log user activity error:', error);
      // Don't throw error for logging failures
      return false;
    }
  }
}

module.exports = CRMService;
