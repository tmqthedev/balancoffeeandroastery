const MockDatabase = require('../config/mock-database');

// Simple CRM Service for testing unified schema
// This service directly uses mock data without database config
class SimpleCRMService {
  static mockDb = null;
  
  // Initialize mock database
  static getMockDatabase() {
    if (!this.mockDb) {
      this.mockDb = new MockDatabase();
    }
    return this.mockDb;
  }
    // Dashboard Analytics
  static async getDashboardMetrics() {
    try {
      console.log('🔍 SimpleCRMService.getDashboardMetrics called');
      console.log('🔍 SimpleCRMService class:', this.constructor.name);
      console.log('🔍 getMockDatabase method:', typeof this.getMockDatabase);
      
      // Always use mock data directly
      const mockDatabase = this.getMockDatabase();
      console.log('🔍 Mock database instance:', !!mockDatabase);
      
      const mockData = mockDatabase.mockData || {};
      console.log('📊 Mock data available:', Object.keys(mockData));
      
      const metrics = {
        totalUsers: mockData.users?.length || 0,
        totalCustomers: mockData.users?.filter(u => u.role === 'customer')?.length || 0,
        totalOrders: 15,
        totalRevenue: 25000000,
        newCustomersToday: 2,
        ordersToday: 5,
        revenueToday: 1500000,
        activeTickets: mockData.supportTickets?.filter(t => t.status === 'open')?.length || 0,
        salesOpportunities: mockData.salesOpportunities?.length || 0,
        conversionRate: 12.5,
        avgOrderValue: 1666667,
        customerSatisfaction: 4.8
      };
      
      console.log('📊 Returning metrics:', metrics);
      return metrics;
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      throw new Error(`Error fetching dashboard metrics: ${error.message}`);
    }
  }
  // User Management
  static async getAllUsers(filters = {}) {
    try {
      console.log('👥 SimpleCRMService.getAllUsers called with filters:', filters);
      
      const mockData = this.getMockDatabase().mockData || {};
      let users = mockData.users || [];
      
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
      const userRoles = mockData.userRoles || [];
      users = users.map(user => {
        const role = userRoles.find(r => r.id === user.roleId);
        return {
          ...user,
          roleName: role?.name || null,
          roleNameVi: role?.nameVi || null
        };
      });
      
      console.log('👥 Returning users:', users.length);
      return users;
    } catch (error) {
      console.error('Get all users error:', error);
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  // Customer Management
  static async getAllCustomers(filters = {}) {
    try {
      console.log('🧑‍💼 SimpleCRMService.getAllCustomers called');
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
      console.log('💼 SimpleCRMService.getAllSalesOpportunities called');
      
      const mockData = this.getMockDatabase().mockData || {};
      let opportunities = mockData.salesOpportunities || [];
      
      if (filters.status) {
        opportunities = opportunities.filter(o => o.status === filters.status);
      }
      
      console.log('💼 Returning opportunities:', opportunities.length);
      return opportunities;
    } catch (error) {
      console.error('Get sales opportunities error:', error);
      throw new Error(`Error fetching sales opportunities: ${error.message}`);
    }
  }
  // Support Management
  static async getAllSupportTickets(filters = {}) {
    try {
      console.log('🎫 SimpleCRMService.getAllSupportTickets called');
      
      const mockData = this.getMockDatabase().mockData || {};
      let tickets = mockData.supportTickets || [];
      
      if (filters.status) {
        tickets = tickets.filter(t => t.status === filters.status);
      }
      
      console.log('🎫 Returning tickets:', tickets.length);
      return tickets;
    } catch (error) {
      console.error('Get support tickets error:', error);
      throw new Error(`Error fetching support tickets: ${error.message}`);
    }
  }
  // System Configuration
  static async getSystemConfigurations(module = null) {
    try {
      console.log('⚙️ SimpleCRMService.getSystemConfigurations called for module:', module);
      
      const mockData = this.getMockDatabase().mockData || {};
      let configs = mockData.systemConfigurations || [];
      
      if (module) {
        configs = configs.filter(c => c.module === module);
      }
      
      console.log('⚙️ Returning configs:', configs.length);
      return configs;
    } catch (error) {
      console.error('Get system configurations error:', error);
      throw new Error(`Error fetching system configurations: ${error.message}`);
    }
  }
  // User Activity Logs
  static async getUserActivityLogs(userId = null, limit = 50) {
    try {
      console.log('📋 SimpleCRMService.getUserActivityLogs called for user:', userId);
      
      const mockData = this.getMockDatabase().mockData || {};
      let logs = mockData.userActivityLogs || [];
      
      if (userId) {
        logs = logs.filter(l => l.userId == userId);
      }
      
      const result = logs.slice(0, limit);
      console.log('📋 Returning logs:', result.length);
      return result;
    } catch (error) {
      console.error('Get user activity logs error:', error);
      throw new Error(`Error fetching user activity logs: ${error.message}`);
    }
  }
  // Helper method to log user activity
  static async logUserActivity(userId, action, description, metadata = {}) {
    try {
      console.log('📝 SimpleCRMService.logUserActivity called');
      
      const mockData = this.getMockDatabase().mockData || {};
      if (!mockData.userActivityLogs) {
        mockData.userActivityLogs = [];
      }
      
      mockData.userActivityLogs.unshift({
        id: Date.now(),
        userId,
        action,
        description,
        metadata: JSON.stringify(metadata),
        createdAt: new Date()
      });
        console.log('📝 Activity logged successfully');
      return true;
    } catch (error) {
      console.error('Log user activity error:', error);
      return false;
    }
  }

  // Get user by ID
  static async getUserById(userId) {
    try {
      console.log('� SimpleCRMService.getUserById called for:', userId);
      
      const mockData = this.getMockDatabase().mockData || {};
      const users = mockData.users || [];
      const user = users.find(u => u.id == userId);
      
      if (user) {
        // Add role information
        const userRoles = mockData.userRoles || [];
        const role = userRoles.find(r => r.id === user.roleId);
        return {
          ...user,
          roleName: role?.name || null,
          roleNameVi: role?.nameVi || null
        };
      }
      
      return null;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Update user
  static async updateUser(userId, updateData) {
    try {
      console.log('✏️ SimpleCRMService.updateUser called for:', userId);
      
      const mockData = this.getMockDatabase().mockData || {};
      const users = mockData.users || [];
      const userIndex = users.findIndex(u => u.id == userId);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updateData, updatedAt: new Date() };
        return users[userIndex];
      }
      
      throw new Error('User not found');
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Get customer profile
  static async getCustomerProfile(customerId) {
    try {
      console.log('👤 SimpleCRMService.getCustomerProfile called for:', customerId);
      
      const user = await this.getUserById(customerId);
      if (!user || user.role !== 'customer') {
        throw new Error('Customer not found');
      }
      
      // Mock additional customer data
      return {
        ...user,
        totalOrders: 5,
        totalSpent: 2500000,
        lastOrderDate: '2024-01-15',
        averageOrderValue: 500000,
        customerSegment: 'VIP',
        preferredProducts: ['Arabica Cầu Đất', 'Robusta Lâm Đồng']
      };
    } catch (error) {
      console.error('Get customer profile error:', error);
      throw new Error(`Error fetching customer profile: ${error.message}`);
    }
  }

  // Add customer interaction
  static async addCustomerInteraction(interactionData) {
    try {
      console.log('💬 SimpleCRMService.addCustomerInteraction called');
      
      const mockData = this.getMockDatabase().mockData || {};
      if (!mockData.customerInteractions) {
        mockData.customerInteractions = [];
      }
      
      const interaction = {
        id: Date.now(),
        ...interactionData,
        createdAt: new Date()
      };
      
      mockData.customerInteractions.unshift(interaction);
      return interaction;
    } catch (error) {
      console.error('Add customer interaction error:', error);
      throw new Error(`Error adding customer interaction: ${error.message}`);
    }
  }

  // Get sales opportunities (alias for getAllSalesOpportunities)
  static async getSalesOpportunities(filters = {}) {
    return await this.getAllSalesOpportunities(filters);
  }

  // Create sales opportunity
  static async createSalesOpportunity(opportunityData) {
    try {
      console.log('💼 SimpleCRMService.createSalesOpportunity called');
      
      const mockData = this.getMockDatabase().mockData || {};
      if (!mockData.salesOpportunities) {
        mockData.salesOpportunities = [];
      }
      
      const opportunity = {
        id: Date.now(),
        ...opportunityData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockData.salesOpportunities.unshift(opportunity);
      return opportunity;
    } catch (error) {
      console.error('Create sales opportunity error:', error);
      throw new Error(`Error creating sales opportunity: ${error.message}`);
    }
  }

  // Get sales pipeline stages
  static async getSalesPipelineStages() {
    try {
      console.log('📊 SimpleCRMService.getSalesPipelineStages called');
      
      return [
        { id: 1, name: 'Prospecting', nameVi: 'Tìm kiếm khách hàng', order: 1 },
        { id: 2, name: 'Qualification', nameVi: 'Đánh giá', order: 2 },
        { id: 3, name: 'Proposal', nameVi: 'Đề xuất', order: 3 },
        { id: 4, name: 'Negotiation', nameVi: 'Thương lượng', order: 4 },
        { id: 5, name: 'Closed Won', nameVi: 'Thành công', order: 5 },
        { id: 6, name: 'Closed Lost', nameVi: 'Thất bại', order: 6 }
      ];
    } catch (error) {
      console.error('Get sales pipeline stages error:', error);
      throw new Error(`Error fetching sales pipeline stages: ${error.message}`);
    }
  }

  // Get marketing campaigns
  static async getMarketingCampaigns(filters = {}) {
    try {
      console.log('📢 SimpleCRMService.getMarketingCampaigns called');
      
      const mockCampaigns = [
        {
          id: 1,
          name: 'Coffee Lovers Spring Campaign',
          nameVi: 'Chiến dịch mùa xuân người yêu cà phê',
          status: 'active',
          startDate: '2024-03-01',
          endDate: '2024-05-31',
          budget: 10000000,
          spent: 6500000,
          leads: 125,
          conversions: 23
        },
        {
          id: 2,
          name: 'Premium Arabica Launch',
          nameVi: 'Ra mắt Arabica cao cấp',
          status: 'completed',
          startDate: '2024-01-15',
          endDate: '2024-02-29',
          budget: 15000000,
          spent: 14800000,
          leads: 89,
          conversions: 34
        }
      ];
      
      let campaigns = mockCampaigns;
      
      if (filters.status) {
        campaigns = campaigns.filter(c => c.status === filters.status);
      }
      
      return campaigns;
    } catch (error) {
      console.error('Get marketing campaigns error:', error);
      throw new Error(`Error fetching marketing campaigns: ${error.message}`);
    }
  }

  // Create marketing campaign
  static async createMarketingCampaign(campaignData) {
    try {
      console.log('📢 SimpleCRMService.createMarketingCampaign called');
      
      const campaign = {
        id: Date.now(),
        ...campaignData,
        leads: 0,
        conversions: 0,
        spent: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return campaign;
    } catch (error) {
      console.error('Create marketing campaign error:', error);
      throw new Error(`Error creating marketing campaign: ${error.message}`);
    }
  }

  // Get support tickets (alias for getAllSupportTickets)
  static async getSupportTickets(filters = {}) {
    return await this.getAllSupportTickets(filters);
  }
}

module.exports = SimpleCRMService;
