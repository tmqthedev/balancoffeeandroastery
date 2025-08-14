// Mock database for development when real MSSQL is not available
class MockDatabase {
  constructor() {
    this.mockData = {
      // Extended users with CRM fields
      users: [
        {
          id: 1,
          email: 'admin@balancoffee.com',
          password: '$2b$12$v.Asbvx1DxwYFel57uUu.eUFA3GuowvuNVyfdPV194acvto6woacu', // password123
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          roleId: 1, // Super Admin
          department: 'Management',
          manager: null,
          territories: '["all"]',
          salesQuota: null,
          lastLoginAt: new Date(),
          isOnline: true,
          isActive: true,
          emailVerified: true,
          createdAt: new Date('2024-01-01')
        },
        {
          id: 2,
          email: 'user@example.com',
          password: '$2b$12$v.Asbvx1DxwYFel57uUu.eUFA3GuowvuNVyfdPV194acvto6woacu', // password123
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer',
          roleId: null,
          department: null,
          manager: null,
          territories: null,
          salesQuota: null,
          lastLoginAt: new Date('2024-02-01'),
          isOnline: false,
          isActive: true,
          emailVerified: true,
          createdAt: new Date('2024-01-15')
        },
        {
          id: 3,
          email: 'sales@balancoffee.com',
          password: '$2b$12$v.Asbvx1DxwYFel57uUu.eUFA3GuowvuNVyfdPV194acvto6woacu',
          firstName: 'Sales',
          lastName: 'Manager',
          role: 'admin',
          roleId: 2, // Sales Manager
          department: 'Sales',
          manager: 1,
          territories: '["HCM", "Hanoi"]',
          salesQuota: 100000000,
          lastLoginAt: new Date('2024-06-14'),
          isOnline: true,
          isActive: true,
          emailVerified: true,
          createdAt: new Date('2024-01-05')
        }
      ],
      
      // User roles
      userRoles: [
        {
          id: 1,
          name: 'Super Admin',
          nameVi: 'Quản trị viên tối cao',
          description: 'Full system access',
          descriptionVi: 'Quyền truy cập toàn hệ thống',
          permissions: '["*"]',
          isActive: true,
          createdAt: new Date('2024-01-01')
        },
        {
          id: 2,
          name: 'Sales Manager',
          nameVi: 'Quản lý bán hàng',
          description: 'Sales team management',
          descriptionVi: 'Quản lý đội ngũ bán hàng',
          permissions: '["sales.*", "customers.read", "customers.update", "reports.sales"]',
          isActive: true,
          createdAt: new Date('2024-01-01')
        }
      ],
      
      // Customer segments
      customerSegments: [
        {
          id: 1,
          name: 'VIP Customers',
          nameVi: 'Khách hàng VIP',
          description: 'High-value customers',
          descriptionVi: 'Khách hàng có giá trị cao',
          criteria: '{"total_orders": {">=": 10}, "total_spent": {">=": 5000000}}',
          isActive: true,
          createdAt: new Date('2024-01-01')
        }
      ],
      
      // Sales opportunities
      salesOpportunities: [
        {
          id: 1,
          title: 'Corporate Coffee Supply Contract',
          description: 'Monthly coffee supply for 500 employee office',
          customerId: 2,
          value: 50000000,
          probability: 75,
          stage: 'Negotiation',
          status: 'open',
          expectedCloseDate: new Date('2024-07-01'),
          assignedTo: 3,
          createdBy: 3,
          createdAt: new Date('2024-06-01')
        }
      ],
      
      // Support tickets
      supportTickets: [
        {
          id: 1,
          ticketNumber: 'TK-2024-001',
          subject: 'Coffee quality inquiry',
          description: 'Customer asking about roast date',
          customerId: 2,
          assignedTo: 1,
          status: 'open',
          priority: 'medium',
          category: 'Product Quality',
          createdAt: new Date('2024-06-10')
        }
      ],
      
      // System configurations
      systemConfigurations: [
        {
          id: 1,
          module: 'general',
          configKey: 'company_name',
          configValue: 'Balan Coffee & Roastery',
          dataType: 'string',
          description: 'Company name',
          updatedBy: 1,
          createdAt: new Date('2024-01-01')
        },
        {
          id: 2,
          module: 'sales',
          configKey: 'default_currency',
          configValue: 'VND',
          dataType: 'string',
          description: 'Default currency',
          updatedBy: 1,
          createdAt: new Date('2024-01-01')
        }
      ],
      
      // User activity logs
      userActivityLogs: [
        {
          id: 1,
          userId: 1,
          action: 'login',
          description: 'User logged in',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          metadata: '{"loginMethod": "password"}',
          createdAt: new Date()
        }
      ],      products: [
        {
          id: 1,
          name: 'Arabica Cầu Đất Premium',
          nameVi: 'Arabica Cầu Đất Cao Cấp',
          description: 'Premium Arabica coffee beans from Cau Dat plateau, known for its rich flavor and aromatic profile.',
          descriptionVi: 'Hạt cà phê Arabica cao cấp từ cao nguyên Cầu Đất, nổi tiếng với hương vị đậm đà và thơm ngon.',
          price: 650000,
          comparePrice: 750000,
          stockQuantity: 50,
          image_url: '/images/arabica-cau-dat.jpg',
          isFeatured: true,
          isActive: true,
          views: 150,
          createdAt: new Date('2024-01-01')
        },
        {
          id: 2,
          name: 'Robusta Lâm Đồng',
          nameVi: 'Robusta Lâm Đồng',
          description: 'Strong and bold Robusta coffee beans from Lam Dong province, perfect for espresso.',
          descriptionVi: 'Hạt cà phê Robusta mạnh mẽ từ tỉnh Lâm Đồng, hoàn hảo cho espresso.',
          price: 450000,
          comparePrice: null,
          stockQuantity: 75,
          image_url: '/images/robusta-lam-dong.jpg',
          isFeatured: true,
          isActive: true,
          views: 120,
          createdAt: new Date('2024-01-05')
        },
        {
          id: 3,
          name: 'Specialty Blend',
          nameVi: 'Blend Đặc Biệt',
          description: 'A carefully crafted blend of Arabica and Robusta beans for balanced flavor.',
          descriptionVi: 'Hỗn hợp được pha chế cẩn thận từ hạt Arabica và Robusta cho hương vị cân bằng.',
          price: 550000,
          comparePrice: 620000,
          stockQuantity: 30,
          image_url: '/images/specialty-blend.jpg',
          isFeatured: false,
          isActive: true,
          views: 85,
          createdAt: new Date('2024-01-10')
        },        {
          id: 4,
          name: 'Dark Roast Supreme',
          nameVi: 'Rang Đậm Cao Cấp',
          description: 'Intense dark roast coffee with rich, smoky flavors and low acidity.',
          descriptionVi: 'Cà phê rang đậm đặc với hương vị đậm đà, khói và độ axit thấp.',
          price: 600000,
          comparePrice: null,
          stockQuantity: 40,
          image_url: '/images/dark-roast.jpg',
          isFeatured: false,
          isActive: true,
          views: 95,
          createdAt: new Date('2024-01-15')
        },
        {
          id: 5,
          name: 'Medium Roast Classic',
          nameVi: 'Rang Vừa Cổ Điển',
          description: 'Classic medium roast with balanced flavor, perfect for all brewing methods.',
          descriptionVi: 'Rang vừa cổ điển với hương vị cân bằng, phù hợp với mọi phương pháp pha.',
          price: 520000,
          comparePrice: null,
          stockQuantity: 60,
          image_url: '/images/medium-roast.jpg',
          isFeatured: false,
          isActive: true,
          views: 110,
          createdAt: new Date('2024-01-20')
        }
      ],
      categories: [
        {
          id: 1,
          name: 'Arabica',
          nameVi: 'Arabica',
          slug: 'arabica',
          description: 'Premium Arabica coffee beans',
          isActive: true
        },
        {
          id: 2,
          name: 'Robusta',
          nameVi: 'Robusta',
          slug: 'robusta',
          description: 'Strong Robusta coffee beans',
          isActive: true
        },
        {
          id: 3,
          name: 'Blends',
          nameVi: 'Pha Trộn',
          slug: 'blends',
          description: 'Carefully crafted coffee blends',
          isActive: true
        },
        {
          id: 4,
          name: 'Dark Roast',
          nameVi: 'Rang Đậm',
          slug: 'dark-roast',
          description: 'Dark roasted coffee beans',
          isActive: true
        }
      ],
      blogs: [
        {
          id: 1,
          title: 'The Art of Coffee Roasting',
          titleVi: 'Nghệ Thuật Rang Cà Phê',
          slug: 'art-of-coffee-roasting',
          excerpt: 'Discover the secrets behind perfect coffee roasting and how it affects the flavor profile.',
          excerptVi: 'Khám phá bí mật đằng sau việc rang cà phê hoàn hảo và cách nó ảnh hưởng đến hương vị.',
          content: 'Coffee roasting is both an art and a science...',
          contentVi: 'Rang cà phê vừa là nghệ thuật vừa là khoa học...',
          featuredImage: '/images/blog/coffee-roasting.jpg',
          publishedAt: new Date('2024-01-15'),
          status: 'published',
          tags: 'roasting,coffee,arabica',
          viewCount: 245,
          authorId: 1,
          createdAt: new Date('2024-01-01')
        },
        {
          id: 2,
          title: 'Vietnamese Coffee Culture',
          titleVi: 'Văn Hóa Cà Phê Việt Nam',
          slug: 'vietnamese-coffee-culture',
          excerpt: 'Explore the rich tradition of Vietnamese coffee and its unique brewing methods.',
          excerptVi: 'Khám phá truyền thống phong phú của cà phê Việt Nam và phương pháp pha chế độc đáo.',
          content: 'Vietnamese coffee culture has a long and storied history...',
          contentVi: 'Văn hóa cà phê Việt Nam có một lịch sử lâu đời và phong phú...',
          featuredImage: '/images/blog/vietnamese-coffee.jpg',
          publishedAt: new Date('2024-02-01'),
          status: 'published',
          tags: 'vietnamese,culture,traditional',
          viewCount: 189,
          authorId: 1,
          createdAt: new Date('2024-01-15')
        },
        {
          id: 3,
          title: 'Health Benefits of Coffee',
          titleVi: 'Lợi Ích Sức Khỏe Của Cà Phê',
          slug: 'health-benefits-of-coffee',
          excerpt: 'Learn about the surprising health benefits of moderate coffee consumption.',
          excerptVi: 'Tìm hiểu về những lợi ích sức khỏe đáng ngạc nhiên của việc uống cà phê vừa phải.',
          content: 'Recent studies have shown that coffee consumption...',
          contentVi: 'Các nghiên cứu gần đây đã chỉ ra rằng việc uống cà phê...',
          featuredImage: '/images/blog/coffee-health.jpg',
          publishedAt: new Date('2024-02-15'),
          status: 'published',
          tags: 'health,benefits,research',
          viewCount: 156,
          authorId: 1,
          createdAt: new Date('2025-06-04')
        }
      ],
      contacts: [],
      orders: [
        {
          id: 1,
          orderNumber: 'TEST001',
          userId: 2,
          customerEmail: 'user@example.com',
          customerName: 'John Doe',
          customerPhone: '0901234567',
          shippingAddress: '123 Test Street, District 1',
          shippingCity: 'Ho Chi Minh City',
          shippingPostalCode: '70000',
          shippingProvince: 'Ho Chi Minh',
          billingAddress: '123 Test Street, District 1',
          billingCity: 'Ho Chi Minh City',
          billingPostalCode: '70000',
          billingProvince: 'Ho Chi Minh',
          subtotal: 100000.00,
          shippingFee: 0.00,
          tax: 0.00,
          discount: 0.00,
          total: 100000.00,
          status: 'pending',
          paymentMethod: 'ipos',
          paymentStatus: 'pending',
          iposOrderId: null,
          qrCode: null,
          qrCodeUrl: null,
          paymentUrl: null,
          transactionId: null,
          paidAt: null,
          expiresAt: null,
          notes: 'Test order for iPOS integration',
          createdAt: new Date('2025-06-14T10:00:00'),
          updatedAt: new Date('2025-06-14T10:00:00')
        },
        {
          id: 2,
          orderNumber: 'ORD202506140001',
          userId: 2,
          customerEmail: 'user@example.com',
          customerName: 'John Doe',
          customerPhone: '0901234567',
          shippingAddress: '456 Coffee Street, District 3',
          shippingCity: 'Ho Chi Minh City',
          shippingPostalCode: '70000',
          shippingProvince: 'Ho Chi Minh',
          billingAddress: '456 Coffee Street, District 3',
          billingCity: 'Ho Chi Minh City',
          billingPostalCode: '70000',
          billingProvince: 'Ho Chi Minh',
          subtotal: 259.90,
          shippingFee: 30.00,
          tax: 0.00,
          discount: 10.00,
          total: 279.90,
          status: 'confirmed',
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          iposOrderId: null,
          qrCode: null,
          qrCodeUrl: null,
          paymentUrl: null,
          transactionId: null,
          paidAt: null,
          expiresAt: null,
          notes: 'Customer requested fast delivery',
          createdAt: new Date('2025-06-14T08:30:00'),
          updatedAt: new Date('2025-06-14T09:15:00')
        }
      ]
    };
  }

  async query(sql, params = {}) {
    console.log('Mock DB Query:', sql.substring(0, 100) + '...');
    console.log('Mock DB Params:', params);    if (sql.includes('SELECT') && sql.includes('Products')) {
      // Handle product filtering and pagination
      let products = [...this.mockData.products];
      
      // Handle single product by ID query (most specific filter first)
      if (sql.includes('WHERE p.id = @id') && params.id) {
        const productId = parseInt(params.id, 10);
        if (isNaN(productId)) {
          // If ID is not a valid number (like "test-simple"), return empty array
          return [];
        }
        products = products.filter(p => p.id === productId);
      }
      
      // Apply other filters
      if (sql.includes('price >= @minPrice') && params.minPrice) {
        products = products.filter(p => p.price >= params.minPrice);
      }
      
      if (sql.includes('price <= @maxPrice') && params.maxPrice) {
        products = products.filter(p => p.price <= params.maxPrice);
      }
      
      if (sql.includes('stockQuantity > 0')) {
        products = products.filter(p => p.stockQuantity > 0);
      }
      
      if (sql.includes('LIKE @search') && params.search) {
        const searchTerm = params.search.replace(/%/g, '').toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.nameVi.toLowerCase().includes(searchTerm) ||
          p.descriptionVi.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply sorting
      if (sql.includes('ORDER BY p.price ASC')) {
        products.sort((a, b) => a.price - b.price);
      } else if (sql.includes('ORDER BY p.price DESC')) {
        products.sort((a, b) => b.price - a.price);
      } else if (sql.includes('ORDER BY p.name ASC')) {
        products.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sql.includes('ORDER BY p.views DESC')) {
        products.sort((a, b) => b.views - a.views);
      }
        // Handle count query
      if (sql.includes('COUNT')) {
        return [{ total: products.length }];
      }
      
      // Handle pagination
      if (sql.includes('OFFSET') && sql.includes('FETCH NEXT')) {
        const offset = params.offset || 0;
        const limit = params.limit || 12;
        products = products.slice(offset, offset + limit);
      }
      
      // Handle aliases in SELECT statement
      if (sql.includes('as stock_quantity')) {
        products = products.map(product => ({
          ...product,
          stock_quantity: product.stockQuantity
        }));
      }
      
      return products;
    }    if (sql.includes('SELECT') && sql.includes('Categories')) {
      return [...this.mockData.categories];
    }

    if (sql.includes('SELECT') && sql.includes('Blogs')) {
      let blogs = [...this.mockData.blogs];
      
      // Add author name for JOIN queries
      if (sql.includes('Users u ON b.authorId = u.id')) {
        blogs = blogs.map(blog => {
          const author = this.mockData.users.find(u => u.id === blog.authorId);
          return {
            ...blog,
            authorName: author ? `${author.firstName} ${author.lastName}` : 'Unknown Author'
          };
        });
      }
      
      // Handle search
      if (sql.includes('LIKE @search') && params.search) {
        const searchTerm = params.search.replace(/%/g, '').toLowerCase();
        blogs = blogs.filter(blog => 
          blog.title.toLowerCase().includes(searchTerm) ||
          blog.titleVi.toLowerCase().includes(searchTerm) ||
          blog.content.toLowerCase().includes(searchTerm) ||
          blog.contentVi.toLowerCase().includes(searchTerm)
        );
      }
      
      // Handle status filter
      if (sql.includes('status = @status') && params.status) {
        blogs = blogs.filter(blog => blog.status === params.status);
      }
      
      // Handle count query
      if (sql.includes('COUNT')) {
        return [{ total: blogs.length }];
      }
      
      // Handle single blog by slug
      if (sql.includes('WHERE b.slug = @slug') && params.slug) {
        const blog = blogs.find(b => b.slug === params.slug);
        return blog ? [blog] : [];
      }
      
      // Apply sorting
      if (sql.includes('ORDER BY b.publishedAt DESC')) {
        blogs.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      }
      
      // Handle pagination
      if (sql.includes('OFFSET') && sql.includes('FETCH NEXT')) {
        const offset = params.offset || 0;
        const limit = params.limit || 10;
        blogs = blogs.slice(offset, offset + limit);
      }
      
      return blogs;
    }    if (sql.includes('SELECT') && sql.includes('Users')) {
      if (sql.includes('WHERE email = @email')) {
        let foundUsers = this.mockData.users.filter(u => u.email === params.email);
        
        // Handle additional conditions like isActive = 1
        if (sql.includes('AND isActive = 1')) {
          foundUsers = foundUsers.filter(u => u.isActive === true);
        }
        
        return foundUsers;
      }
      if (sql.includes('WHERE id = @userId')) {
        return this.mockData.users.filter(u => u.id === params.userId);
      }      return [...this.mockData.users];
    }

    // Handle Orders queries
    if (sql.includes('SELECT') && sql.includes('Orders')) {
      let orders = [...this.mockData.orders];
      
      // Filter by orderNumber
      if (sql.includes('WHERE o.orderNumber = @orderId') && params.orderId) {
        orders = orders.filter(o => o.orderNumber === params.orderId);
      }
      
      // Filter by userId
      if (sql.includes('AND o.userId = @userId') && params.userId) {
        orders = orders.filter(o => o.userId === params.userId);
      }
      
      // Filter by status
      if (sql.includes('AND o.status = @status') && params.status) {
        orders = orders.filter(o => o.status === params.status);
      }
      
      if (sql.includes("AND o.status = 'pending'")) {
        orders = orders.filter(o => o.status === 'pending');
      }
      
      // Join with Users table if needed
      if (sql.includes('JOIN Users u ON o.userId = u.id')) {
        orders = orders.map(order => {
          const user = this.mockData.users.find(u => u.id === order.userId);
          if (user) {
            return {
              ...order,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName
            };
          }
          return order;
        });
      }
      
      // Handle pagination if needed
      if (sql.includes('OFFSET') && sql.includes('FETCH NEXT')) {
        const offset = params.offset || 0;
        const limit = params.limit || 10;
        orders = orders.slice(offset, offset + limit);
      }
      
      return orders;
    }

    return [];
  }  async execute(sql, params = {}) {
    console.log('Mock DB Execute:', sql.substring(0, 100) + '...');
    console.log('Mock DB Execute Params:', params);

    // For SELECT queries, use the query method and wrap in recordset format
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const result = await this.query(sql, params);
      return { recordset: result };
    }
    
    if (sql.includes('INSERT INTO Users')) {
      const newUser = {
        id: this.mockData.users.length + 1,
        ...params,
        isActive: true, // Ensure user is active by default
        createdAt: new Date()
      };
      this.mockData.users.push(newUser);
      return { recordset: [newUser] };
    }

    if (sql.includes('INSERT INTO Orders')) {
      const newOrder = {
        id: this.mockData.orders.length + 1,
        ...params,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.mockData.orders.push(newOrder);
      return { recordset: [newOrder] };
    }

    if (sql.includes('UPDATE Orders')) {
      // Find and update order
      const orderIndex = this.mockData.orders.findIndex(o => 
        (params.orderId && o.orderNumber === params.orderId) ||
        (params.id && o.id === params.id)
      );
      
      if (orderIndex !== -1) {
        this.mockData.orders[orderIndex] = {
          ...this.mockData.orders[orderIndex],
          ...params,
          updatedAt: new Date()
        };
        return { recordset: [this.mockData.orders[orderIndex]], rowsAffected: [1] };
      }
      return { rowsAffected: [0] };
    }

    // Handle Users UPDATE
    if (sql.includes('UPDATE Users') && sql.includes('WHERE id = @userId')) {
      const userIndex = this.mockData.users.findIndex(u => u.id === params.userId);
      if (userIndex !== -1) {
        // Update user fields
        this.mockData.users[userIndex] = {
          ...this.mockData.users[userIndex],
          firstName: params.firstName || this.mockData.users[userIndex].firstName,
          lastName: params.lastName || this.mockData.users[userIndex].lastName,
          email: params.email || this.mockData.users[userIndex].email,
          phone: params.phone !== undefined ? params.phone : this.mockData.users[userIndex].phone,
          dateOfBirth: params.dateOfBirth !== undefined ? params.dateOfBirth : this.mockData.users[userIndex].dateOfBirth,
          gender: params.gender !== undefined ? params.gender : this.mockData.users[userIndex].gender,
          updatedAt: new Date()
        };
        console.log('✅ Mock DB: Updated user:', this.mockData.users[userIndex]);
        return { rowsAffected: [1] };
      }
      return { rowsAffected: [0] };
    }

    if (sql.includes('UPDATE Products SET views')) {
      return { rowsAffected: [1] };
    }

    if (sql.includes('UPDATE') || sql.includes('DELETE')) {
      return { rowsAffected: [1] };
    }

    return { recordset: [] };
  }

  // Helper method to check if we're in mock mode
  isMockMode() {
    return true;
  }
}

module.exports = MockDatabase;
