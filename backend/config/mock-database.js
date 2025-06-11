// Mock database for development when real MSSQL is not available
class MockDatabase {
  constructor() {
    this.mockData = {
      users: [        {
          id: 1,
          email: 'admin@balancoffee.com',
          password: '$2b$12$v.Asbvx1DxwYFel57uUu.eUFA3GuowvuNVyfdPV194acvto6woacu', // password123
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
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
          isActive: true,
          emailVerified: true,
          createdAt: new Date('2024-01-15')
        }
      ],
      products: [
        {
          id: 1,
          name: 'Arabica Cầu Đất Premium',
          nameVi: 'Arabica Cầu Đất Cao Cấp',
          description: 'Premium Arabica coffee beans from Cau Dat plateau, known for its rich flavor and aromatic profile.',
          descriptionVi: 'Hạt cà phê Arabica cao cấp từ cao nguyên Cầu Đất, nổi tiếng với hương vị đậm đà và thơm ngon.',
          price: 25.99,
          comparePrice: 29.99,
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
          price: 18.99,
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
          price: 22.50,
          comparePrice: 25.00,
          stockQuantity: 30,
          image_url: '/images/specialty-blend.jpg',
          isFeatured: false,
          isActive: true,
          views: 85,
          createdAt: new Date('2024-01-10')
        },
        {
          id: 4,
          name: 'Dark Roast Supreme',
          nameVi: 'Rang Đậm Cao Cấp',
          description: 'Intense dark roast coffee with rich, smoky flavors and low acidity.',
          descriptionVi: 'Cà phê rang đậm đặc với hương vị đậm đà, khói và độ axit thấp.',
          price: 24.99,
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
          price: 21.99,
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
      orders: []
    };
  }

  async query(sql, params = {}) {
    console.log('Mock DB Query:', sql.substring(0, 100) + '...');
    console.log('Mock DB Params:', params);

    if (sql.includes('SELECT') && sql.includes('Products')) {
      // Handle product filtering and pagination
      let products = [...this.mockData.products];
      
      // Apply filters
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
      }
      return [...this.mockData.users];
    }

    return [];
  }  async execute(sql, params = {}) {
    console.log('Mock DB Execute:', sql.substring(0, 100) + '...');
    
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

    if (sql.includes('UPDATE Products SET views')) {
      return { rowsAffected: [1] };
    }

    if (sql.includes('UPDATE') || sql.includes('DELETE')) {
      return { rowsAffected: [1] };
    }

    return { recordset: [] };  }
}

module.exports = MockDatabase;
