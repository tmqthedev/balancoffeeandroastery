// Mock database for development when real MSSQL is not available
class MockDatabase {
  constructor() {
    this.connected = true;
    this.mockData = {
      users: [
        {
          id: 1,
          email: 'admin@balancoffee.com',
          password: '$2b$12$gj6BTGElLp/Vz8IMSlLUAeIVZKUE54j5qdYdg4eoJx4exMFVxm.2q', // hashed 'admin123'
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: 1,
          createdAt: new Date()
        },
        {
          id: 2,
          email: 'customer@test.com',
          password: '$2b$12$gj6BTGElLp/Vz8IMSlLUAeIVZKUE54j5qdYdg4eoJx4exMFVxm.2q', // hashed 'customer123'
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer',
          isActive: 1,
          createdAt: new Date()
        }
      ],
      products: [
        {
          id: 1,
          name: 'Arabica Cầu Đất',
          nameVi: 'Cà phê Arabica Cầu Đất',
          slug: 'arabica-cau-dat',
          description: 'Premium Arabica coffee from Cau Dat',
          descriptionVi: 'Cà phê Arabica cao cấp từ Cầu Đất',
          price: 250000,
          weight: 500,
          stockQuantity: 100,
          isActive: 1,
          createdAt: new Date()
        }
      ],
      categories: [
        {
          id: 1,
          name: 'Arabica Coffee',
          nameVi: 'Cà phê Arabica',
          slug: 'arabica-coffee',
          description: 'Premium Arabica coffee beans',
          descriptionVi: 'Hạt cà phê Arabica cao cấp',
          isActive: 1,
          createdAt: new Date()
        }
      ],
      blogs: [
        {
          id: 1,
          title: 'The Art of Coffee Roasting',
          titleVi: 'Nghệ thuật rang cà phê',
          slug: 'art-of-coffee-roasting',
          content: 'Coffee roasting is both an art and a science...',
          contentVi: 'Rang cà phê vừa là nghệ thuật vừa là khoa học...',
          status: 'published',
          isActive: 1,
          createdAt: new Date()
        }
      ],
      contacts: [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '0123456789',
          subject: 'Product Inquiry',
          message: 'I would like to know more about your coffee products.',
          status: 'new',
          createdAt: new Date()
        }
      ],
      newsletter: [
        {
          id: 1,
          email: 'subscriber@example.com',
          status: 'active',
          createdAt: new Date()
        }
      ]
    };
  }
  async query(sql, params = {}) {
    console.log('Mock DB Query:', sql.substring(0, 100) + '...');
    console.log('Mock DB Params:', params);
      // Simple mock responses based on SQL patterns
    if (sql.includes('SELECT') && sql.includes('Users')) {
      if (sql.includes('WHERE email = @email')) {
        const result = this.mockData.users.filter(u => u.email === params.email);
        // Return deep copies to prevent mutation
        const deepCopy = JSON.parse(JSON.stringify(result));
        console.log('Mock DB User Result:', deepCopy);
        return deepCopy;
      }
      if (sql.includes('WHERE id = @userId')) {
        const result = this.mockData.users.filter(u => u.id === params.userId);
        return JSON.parse(JSON.stringify(result));
      }
      return JSON.parse(JSON.stringify(this.mockData.users));
    }

    if (sql.includes('SELECT') && sql.includes('Products')) {
      return this.mockData.products;
    }

    if (sql.includes('SELECT') && sql.includes('Categories')) {
      return this.mockData.categories;
    }

    if (sql.includes('SELECT') && sql.includes('Blogs')) {
      return this.mockData.blogs;
    }

    if (sql.includes('SELECT') && sql.includes('Contacts')) {
      return this.mockData.contacts;
    }

    if (sql.includes('newsletter')) {
      return this.mockData.newsletter;
    }

    return [];
  }

  async execute(sql, params = {}) {
    console.log('Mock DB Execute:', sql.substring(0, 100) + '...');
    
    if (sql.includes('INSERT INTO Users')) {
      const newUser = {
        id: this.mockData.users.length + 1,
        ...params,
        createdAt: new Date()
      };
      this.mockData.users.push(newUser);
      return { recordset: [newUser] };
    }

    if (sql.includes('INSERT INTO Contacts')) {
      const newContact = {
        id: this.mockData.contacts.length + 1,
        ...params,
        createdAt: new Date()
      };
      this.mockData.contacts.push(newContact);
      return { recordset: [newContact] };
    }

    if (sql.includes('INSERT INTO Blogs')) {
      const newBlog = {
        id: this.mockData.blogs.length + 1,
        ...params,
        createdAt: new Date()
      };
      this.mockData.blogs.push(newBlog);
      return { recordset: [newBlog] };
    }

    if (sql.includes('UPDATE')) {
      console.log('Mock update operation completed');
      return { rowsAffected: [1] };
    }

    if (sql.includes('DELETE')) {
      console.log('Mock delete operation completed');
      return { rowsAffected: [1] };
    }

    return { recordset: [] };
  }

  async close() {
    console.log('Mock database connection closed');
    this.connected = false;
  }
}

module.exports = MockDatabase;
