// Migration script from SQL Server to Firebase
const admin = require('firebase-admin');
const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // No storageBucket for free plan
  });
}

const db = admin.firestore();
const auth = admin.auth();
const storage = null; // Not using Firebase Storage for free plan

// SQL Server configuration
const sqlConfig = {
  user: process.env.DB_USER || 'your_username',
  password: process.env.DB_PASSWORD || 'your_password',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'BalanCoffeeDB',
  options: {
    encrypt: true,
    enableArithAbort: true,
    trustServerCertificate: true
  }
};

// Collections mapping
const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  BLOGS: 'blogs',
  CONTACTS: 'contacts',
  SUBSCRIPTIONS: 'subscriptions',
  CART_ITEMS: 'cartItems',
  SETTINGS: 'settings'
};

class DataMigration {
  constructor() {
    this.logFile = path.join(__dirname, 'migration.log');
    this.errorFile = path.join(__dirname, 'migration-errors.log');
  }

  // Log messages
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(this.logFile, logMessage);
  }

  // Log errors
  logError(error) {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ERROR: ${error.message}\n${error.stack}\n\n`;
    console.error(error);
    fs.appendFileSync(this.errorFile, errorMessage);
  }

  // Connect to SQL Server
  async connectSQL() {
    try {
      await sql.connect(sqlConfig);
      this.log('Connected to SQL Server');
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  // Migrate Users
  async migrateUsers() {
    try {
      this.log('Starting users migration...');
      
      const result = await sql.query('SELECT * FROM Users');
      const users = result.recordset;

      for (const user of users) {
        try {
          const userData = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || '',
            postalCode: user.postalCode || '',
            role: user.role,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            facebookId: user.facebookId || '',
            profileImage: user.profileImage || '',
            createdAt: admin.firestore.Timestamp.fromDate(user.createdAt),
            updatedAt: admin.firestore.Timestamp.fromDate(user.updatedAt)
          };

          // Use SQL ID as document ID for consistency
          await db.collection(COLLECTIONS.USERS).doc(user.id.toString()).set(userData);
          this.log(`Migrated user: ${user.email}`);
        } catch (error) {
          this.logError(new Error(`Failed to migrate user ${user.email}: ${error.message}`));
        }
      }

      this.log(`Users migration completed. Migrated ${users.length} users.`);
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  // Migrate Categories
  async migrateCategories() {
    try {
      this.log('Starting categories migration...');
      
      const result = await sql.query('SELECT * FROM Categories');
      const categories = result.recordset;

      for (const category of categories) {
        try {
          const categoryData = {
            name: category.name,
            nameVi: category.nameVi,
            slug: category.slug,
            description: category.description || '',
            descriptionVi: category.descriptionVi || '',
            isActive: category.isActive,
            createdAt: admin.firestore.Timestamp.fromDate(category.createdAt)
          };

          await db.collection(COLLECTIONS.CATEGORIES).doc(category.id.toString()).set(categoryData);
          this.log(`Migrated category: ${category.name}`);
        } catch (error) {
          this.logError(new Error(`Failed to migrate category ${category.name}: ${error.message}`));
        }
      }

      this.log(`Categories migration completed. Migrated ${categories.length} categories.`);
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  // Migrate Products
  async migrateProducts() {
    try {
      this.log('Starting products migration...');
      
      // Get products with their categories
      const result = await sql.query(`
        SELECT p.*, 
               STRING_AGG(pc.categoryId, ',') as categoryIds
        FROM Products p
        LEFT JOIN ProductCategories pc ON p.id = pc.productId
        GROUP BY p.id, p.name, p.nameVi, p.slug, p.description, p.descriptionVi, 
                 p.shortDescription, p.shortDescriptionVi, p.price, p.comparePrice, 
                 p.sku, p.stockQuantity, p.weight, p.roastLevel, p.origin, 
                 p.processingMethod, p.images, p.isActive, p.isFeatured, 
                 p.metaTitle, p.metaTitleVi, p.metaDescription, p.metaDescriptionVi, 
                 p.createdAt, p.updatedAt
      `);
      
      const products = result.recordset;

      for (const product of products) {
        try {
          // Parse categories
          const categories = product.categoryIds ? 
            product.categoryIds.split(',').map(id => id.toString()) : [];

          // Parse images (assuming JSON format)
          let images = [];
          try {
            images = product.images ? JSON.parse(product.images) : [];
          } catch (e) {
            images = product.images ? [product.images] : [];
          }

          const productData = {
            name: product.name,
            nameVi: product.nameVi,
            slug: product.slug,
            description: product.description || '',
            descriptionVi: product.descriptionVi || '',
            shortDescription: product.shortDescription || '',
            shortDescriptionVi: product.shortDescriptionVi || '',
            price: parseFloat(product.price),
            comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
            sku: product.sku,
            stockQuantity: parseInt(product.stockQuantity),
            weight: product.weight ? parseFloat(product.weight) : null,
            roastLevel: product.roastLevel || '',
            origin: product.origin || '',
            processingMethod: product.processingMethod || '',
            images: images,
            categories: categories,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            metaTitle: product.metaTitle || '',
            metaTitleVi: product.metaTitleVi || '',
            metaDescription: product.metaDescription || '',
            metaDescriptionVi: product.metaDescriptionVi || '',
            createdAt: admin.firestore.Timestamp.fromDate(product.createdAt),
            updatedAt: admin.firestore.Timestamp.fromDate(product.updatedAt)
          };

          await db.collection(COLLECTIONS.PRODUCTS).doc(product.id.toString()).set(productData);
          this.log(`Migrated product: ${product.name}`);
        } catch (error) {
          this.logError(new Error(`Failed to migrate product ${product.name}: ${error.message}`));
        }
      }

      this.log(`Products migration completed. Migrated ${products.length} products.`);
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  // Migrate Orders
  async migrateOrders() {
    try {
      this.log('Starting orders migration...');
      
      // Get orders with their items
      const result = await sql.query(`
        SELECT o.*,
               op.id as itemId, op.productId, op.quantity, op.price as itemPrice,
               op.productName, op.productSku
        FROM Orders o
        LEFT JOIN OrderProducts op ON o.id = op.orderId
        ORDER BY o.id
      `);
      
      const rows = result.recordset;
      const ordersMap = new Map();

      // Group order items by order
      for (const row of rows) {
        if (!ordersMap.has(row.id)) {
          ordersMap.set(row.id, {
            order: {
              orderNumber: row.orderNumber,
              userId: row.userId ? row.userId.toString() : null,
              customerEmail: row.customerEmail,
              customerName: row.customerName,
              customerPhone: row.customerPhone || '',
              shippingAddress: row.shippingAddress,
              shippingCity: row.shippingCity,
              shippingPostalCode: row.shippingPostalCode || '',
              shippingProvince: row.shippingProvince || '',
              billingAddress: row.billingAddress || '',
              billingCity: row.billingCity || '',
              billingPostalCode: row.billingPostalCode || '',
              billingProvince: row.billingProvince || '',
              subtotal: parseFloat(row.subtotal),
              shippingFee: parseFloat(row.shippingFee || 0),
              tax: parseFloat(row.tax || 0),
              discount: parseFloat(row.discount || 0),
              total: parseFloat(row.total),
              status: row.status,
              paymentMethod: row.paymentMethod,
              paymentStatus: row.paymentStatus,
              paymentId: row.paymentId || '',
              transactionId: row.transactionId || '',
              qrCode: row.qrCode || '',
              qrCodeUrl: row.qrCodeUrl || '',
              paymentUrl: row.paymentUrl || '',
              paidAt: row.paidAt ? admin.firestore.Timestamp.fromDate(row.paidAt) : null,
              expiresAt: row.expiresAt ? admin.firestore.Timestamp.fromDate(row.expiresAt) : null,
              notes: row.notes || '',
              createdAt: admin.firestore.Timestamp.fromDate(row.createdAt),
              updatedAt: admin.firestore.Timestamp.fromDate(row.updatedAt)
            },
            items: []
          });
        }

        // Add item if exists
        if (row.itemId) {
          ordersMap.get(row.id).items.push({
            productId: row.productId.toString(),
            productName: row.productName,
            productSku: row.productSku,
            quantity: parseInt(row.quantity),
            price: parseFloat(row.itemPrice)
          });
        }
      }

      // Save orders to Firestore
      for (const [orderId, orderData] of ordersMap) {
        try {
          const completeOrder = {
            ...orderData.order,
            items: orderData.items
          };

          await db.collection(COLLECTIONS.ORDERS).doc(orderId.toString()).set(completeOrder);
          this.log(`Migrated order: ${orderData.order.orderNumber}`);
        } catch (error) {
          this.logError(new Error(`Failed to migrate order ${orderData.order.orderNumber}: ${error.message}`));
        }
      }

      this.log(`Orders migration completed. Migrated ${ordersMap.size} orders.`);
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  // Migrate Blogs
  async migrateBlogs() {
    try {
      this.log('Starting blogs migration...');
      
      const result = await sql.query('SELECT * FROM Blogs');
      const blogs = result.recordset;

      for (const blog of blogs) {
        try {
          // Parse tags
          const tags = blog.tags ? blog.tags.split(',').map(tag => tag.trim()) : [];

          const blogData = {
            title: blog.title,
            titleVi: blog.titleVi,
            slug: blog.slug,
            excerpt: blog.excerpt || '',
            excerptVi: blog.excerptVi || '',
            content: blog.content,
            contentVi: blog.contentVi,
            featuredImage: blog.featuredImage || '',
            authorId: blog.authorId.toString(),
            status: blog.status,
            publishedAt: blog.publishedAt ? admin.firestore.Timestamp.fromDate(blog.publishedAt) : null,
            metaTitle: blog.metaTitle || '',
            metaTitleVi: blog.metaTitleVi || '',
            metaDescription: blog.metaDescription || '',
            metaDescriptionVi: blog.metaDescriptionVi || '',
            tags: tags,
            viewCount: parseInt(blog.viewCount || 0),
            createdAt: admin.firestore.Timestamp.fromDate(blog.createdAt),
            updatedAt: admin.firestore.Timestamp.fromDate(blog.updatedAt)
          };

          await db.collection(COLLECTIONS.BLOGS).doc(blog.id.toString()).set(blogData);
          this.log(`Migrated blog: ${blog.title}`);
        } catch (error) {
          this.logError(new Error(`Failed to migrate blog ${blog.title}: ${error.message}`));
        }
      }

      this.log(`Blogs migration completed. Migrated ${blogs.length} blogs.`);
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  // Migrate other collections (contacts, subscriptions, settings, etc.)
  async migrateOtherCollections() {
    try {
      // Migrate Contacts
      this.log('Migrating contacts...');
      const contactsResult = await sql.query('SELECT * FROM Contacts');
      for (const contact of contactsResult.recordset) {
        const contactData = {
          name: contact.name,
          email: contact.email,
          phone: contact.phone || '',
          subject: contact.subject,
          message: contact.message,
          status: contact.status,
          createdAt: admin.firestore.Timestamp.fromDate(contact.createdAt),
          repliedAt: contact.repliedAt ? admin.firestore.Timestamp.fromDate(contact.repliedAt) : null
        };
        await db.collection(COLLECTIONS.CONTACTS).doc(contact.id.toString()).set(contactData);
      }

      // Migrate Subscriptions
      this.log('Migrating subscriptions...');
      const subsResult = await sql.query('SELECT * FROM Subscriptions');
      for (const sub of subsResult.recordset) {
        const subData = {
          email: sub.email,
          isActive: sub.isActive,
          createdAt: admin.firestore.Timestamp.fromDate(sub.createdAt)
        };
        await db.collection(COLLECTIONS.SUBSCRIPTIONS).doc(sub.id.toString()).set(subData);
      }

      // Migrate Settings
      this.log('Migrating settings...');
      const settingsResult = await sql.query('SELECT * FROM Settings');
      for (const setting of settingsResult.recordset) {
        let settingValue = setting.settingValue;
        
        // Parse value based on type
        if (setting.settingType === 'number') {
          settingValue = parseFloat(settingValue);
        } else if (setting.settingType === 'boolean') {
          settingValue = settingValue === 'true' || settingValue === '1';
        } else if (setting.settingType === 'json') {
          try {
            settingValue = JSON.parse(settingValue);
          } catch (e) {
            // Keep as string if parsing fails
          }
        }

        const settingData = {
          settingKey: setting.settingKey,
          settingValue: settingValue,
          settingType: setting.settingType,
          description: setting.description || '',
          updatedAt: admin.firestore.Timestamp.fromDate(setting.updatedAt)
        };
        await db.collection(COLLECTIONS.SETTINGS).doc(setting.id.toString()).set(settingData);
      }

      this.log('Other collections migration completed.');
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  // Run complete migration
  async runMigration() {
    try {
      this.log('Starting complete database migration from SQL Server to Firebase...');
      
      await this.connectSQL();
      
      await this.migrateCategories();
      await this.migrateUsers();
      await this.migrateProducts();
      await this.migrateOrders();
      await this.migrateBlogs();
      await this.migrateOtherCollections();
      
      this.log('Migration completed successfully!');
    } catch (error) {
      this.logError(error);
      throw error;
    } finally {
      await sql.close();
    }
  }

  // Verify migration
  async verifyMigration() {
    try {
      this.log('Starting migration verification...');
      
      // Count documents in each collection
      const collections = Object.values(COLLECTIONS);
      
      for (const collectionName of collections) {
        const snapshot = await db.collection(collectionName).get();
        this.log(`${collectionName}: ${snapshot.size} documents`);
      }
      
      this.log('Migration verification completed.');
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  const migration = new DataMigration();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate';
  
  switch (command) {
    case 'migrate':
      migration.runMigration()
        .then(() => {
          console.log('Migration completed successfully!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('Migration failed:', error);
          process.exit(1);
        });
      break;
      
    case 'verify':
      migration.verifyMigration()
        .then(() => {
          console.log('Verification completed!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('Verification failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node migrate-to-firebase.js [migrate|verify]');
      process.exit(1);
  }
}

module.exports = DataMigration;
