// Setup sample data for Firebase
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

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

// Collections
const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  BLOGS: 'blogs',
  CONTACTS: 'contacts',
  SUBSCRIPTIONS: 'subscriptions',
  SETTINGS: 'settings'
};

class FirebaseSetup {
  // Setup categories
  async setupCategories() {
    console.log('Setting up categories...');
    
    const categories = [
      {
        id: 'arabica',
        name: 'Arabica',
        nameVi: 'Arabica',
        slug: 'arabica',
        description: 'Premium Arabica coffee beans',
        descriptionVi: 'Hạt cà phê Arabica cao cấp',
        isActive: true,
        createdAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'robusta',
        name: 'Robusta',
        nameVi: 'Robusta',
        slug: 'robusta',
        description: 'Strong Robusta coffee beans',
        descriptionVi: 'Hạt cà phê Robusta đậm đà',
        isActive: true,
        createdAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'blends',
        name: 'Blends',
        nameVi: 'Pha trộn',
        slug: 'blends',
        description: 'Expertly crafted coffee blends',
        descriptionVi: 'Hỗn hợp cà phê được pha chế chuyên nghiệp',
        isActive: true,
        createdAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'single-origin',
        name: 'Single Origin',
        nameVi: 'Nguồn gốc đơn',
        slug: 'single-origin',
        description: 'Single origin specialty coffee',
        descriptionVi: 'Cà phê đặc sản nguồn gốc đơn',
        isActive: true,
        createdAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'beverages',
        name: 'Beverages',
        nameVi: 'Thức uống',
        slug: 'beverages',
        description: 'Ready-to-drink coffee beverages',
        descriptionVi: 'Thức uống cà phê pha sẵn',
        isActive: true,
        createdAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'equipment',
        name: 'Equipment',
        nameVi: 'Thiết bị',
        slug: 'equipment',
        description: 'Coffee brewing equipment and accessories',
        descriptionVi: 'Thiết bị pha cà phê và phụ kiện',
        isActive: true,
        createdAt: admin.firestore.Timestamp.now()
      }
    ];

    for (const category of categories) {
      await db.collection(COLLECTIONS.CATEGORIES).doc(category.id).set(category);
      console.log(`Created category: ${category.name}`);
    }
  }

  // Setup admin user
  async setupAdminUser() {
    console.log('Setting up admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = {
      email: 'admin@balancoffee.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+84 123 456 789',
      address: '123 Coffee Street',
      city: 'Ho Chi Minh City',
      postalCode: '70000',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      facebookId: '',
      profileImage: '',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    await db.collection(COLLECTIONS.USERS).doc('admin').set(adminUser);
    console.log('Created admin user: admin@balancoffee.com');
  }

  // Setup sample products
  async setupProducts() {
    console.log('Setting up sample products...');
    
    const products = [
      {
        id: 'arabica-cau-dat',
        name: 'Arabica Cầu Đất Premium',
        nameVi: 'Arabica Cầu Đất Premium',
        slug: 'arabica-cau-dat-premium',
        description: 'Premium Arabica coffee beans from Cầu Đất region, known for their exceptional quality and unique flavor profile.',
        descriptionVi: 'Hạt cà phê Arabica cao cấp từ vùng Cầu Đất, nổi tiếng với chất lượng vượt trội và hương vị độc đáo.',
        shortDescription: 'Premium Arabica from Cầu Đất with exceptional quality',
        shortDescriptionVi: 'Arabica cao cấp từ Cầu Đất với chất lượng vượt trội',
        price: 250000,
        comparePrice: 300000,
        sku: 'BC-ACD-001',
        stockQuantity: 50,
        weight: 500,
        roastLevel: 'Medium',
        origin: 'Cầu Đất, Đà Lạt',
        processingMethod: 'Washed',
        images: ['/images/products/arabica-cau-dat-1.jpg', '/images/products/arabica-cau-dat-2.jpg'],
        categories: ['arabica', 'single-origin'],
        isActive: true,
        isFeatured: true,
        metaTitle: 'Arabica Cầu Đất Premium - Balan Coffee',
        metaTitleVi: 'Arabica Cầu Đất Premium - Balan Coffee',
        metaDescription: 'Premium Arabica coffee beans from Cầu Đất region with exceptional quality',
        metaDescriptionVi: 'Hạt cà phê Arabica cao cấp từ vùng Cầu Đất với chất lượng vượt trội',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'robusta-lam-dong',
        name: 'Robusta Lâm Đồng Special',
        nameVi: 'Robusta Lâm Đồng Đặc Biệt',
        slug: 'robusta-lam-dong-special',
        description: 'Strong and bold Robusta coffee beans from Lâm Đồng province, perfect for Vietnamese coffee lovers.',
        descriptionVi: 'Hạt cà phê Robusta đậm đà từ tỉnh Lâm Đồng, hoàn hảo cho những người yêu cà phê Việt Nam.',
        shortDescription: 'Strong Robusta from Lâm Đồng province',
        shortDescriptionVi: 'Robusta đậm đà từ tỉnh Lâm Đồng',
        price: 180000,
        comparePrice: 220000,
        sku: 'BC-RLD-001',
        stockQuantity: 75,
        weight: 500,
        roastLevel: 'Dark',
        origin: 'Lâm Đồng',
        processingMethod: 'Natural',
        images: ['/images/products/robusta-lam-dong-1.jpg', '/images/products/robusta-lam-dong-2.jpg'],
        categories: ['robusta', 'single-origin'],
        isActive: true,
        isFeatured: true,
        metaTitle: 'Robusta Lâm Đồng Special - Balan Coffee',
        metaTitleVi: 'Robusta Lâm Đồng Đặc Biệt - Balan Coffee',
        metaDescription: 'Strong Robusta coffee beans from Lâm Đồng province',
        metaDescriptionVi: 'Hạt cà phê Robusta đậm đà từ tỉnh Lâm Đồng',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'house-blend',
        name: 'Balan House Blend',
        nameVi: 'Hỗn Hợp Đặc Trưng Balan',
        slug: 'balan-house-blend',
        description: 'Our signature house blend combining the best of Arabica and Robusta for a perfectly balanced cup.',
        descriptionVi: 'Hỗn hợp đặc trưng của chúng tôi kết hợp tinh hoa của Arabica và Robusta cho một tách cà phê cân bằng hoàn hảo.',
        shortDescription: 'Signature blend of Arabica and Robusta',
        shortDescriptionVi: 'Hỗn hợp đặc trưng của Arabica và Robusta',
        price: 200000,
        comparePrice: null,
        sku: 'BC-HB-001',
        stockQuantity: 100,
        weight: 500,
        roastLevel: 'Medium-Dark',
        origin: 'Vietnam Blend',
        processingMethod: 'Mixed',
        images: ['/images/products/house-blend-1.jpg', '/images/products/house-blend-2.jpg'],
        categories: ['blends'],
        isActive: true,
        isFeatured: true,
        metaTitle: 'Balan House Blend - Signature Coffee',
        metaTitleVi: 'Hỗn Hợp Đặc Trưng Balan - Cà Phê Đặc Trưng',
        metaDescription: 'Signature house blend combining Arabica and Robusta',
        metaDescriptionVi: 'Hỗn hợp đặc trưng kết hợp Arabica và Robusta',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'cold-brew-concentrate',
        name: 'Cold Brew Concentrate',
        nameVi: 'Tinh Chất Cà Phê Pha Lạnh',
        slug: 'cold-brew-concentrate',
        description: 'Ready-to-drink cold brew concentrate. Just add water or milk for a refreshing coffee experience.',
        descriptionVi: 'Tinh chất cà phê pha lạnh sẵn sàng thưởng thức. Chỉ cần thêm nước hoặc sữa để có trải nghiệm cà phê sảng khoái.',
        shortDescription: 'Ready-to-drink cold brew concentrate',
        shortDescriptionVi: 'Tinh chất cà phê pha lạnh sẵn sàng thưởng thức',
        price: 120000,
        comparePrice: null,
        sku: 'BC-CBC-001',
        stockQuantity: 30,
        weight: 250,
        roastLevel: 'Medium',
        origin: 'House Blend',
        processingMethod: 'Cold Brew',
        images: ['/images/products/cold-brew-1.jpg', '/images/products/cold-brew-2.jpg'],
        categories: ['beverages'],
        isActive: true,
        isFeatured: false,
        metaTitle: 'Cold Brew Concentrate - Balan Coffee',
        metaTitleVi: 'Tinh Chất Cà Phê Pha Lạnh - Balan Coffee',
        metaDescription: 'Ready-to-drink cold brew concentrate',
        metaDescriptionVi: 'Tinh chất cà phê pha lạnh sẵn sàng thưởng thức',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'vietnamese-drip-set',
        name: 'Vietnamese Drip Coffee Set',
        nameVi: 'Bộ Phin Cà Phê Việt Nam',
        slug: 'vietnamese-drip-coffee-set',
        description: 'Traditional Vietnamese drip coffee set including phin filter and cup for authentic Vietnamese coffee experience.',
        descriptionVi: 'Bộ phin cà phê Việt Nam truyền thống bao gồm phin và tách để có trải nghiệm cà phê Việt Nam chính thống.',
        shortDescription: 'Traditional Vietnamese coffee brewing set',
        shortDescriptionVi: 'Bộ pha cà phê Việt Nam truyền thống',
        price: 150000,
        comparePrice: null,
        sku: 'BC-VDS-001',
        stockQuantity: 25,
        weight: 200,
        roastLevel: null,
        origin: 'Vietnam',
        processingMethod: null,
        images: ['/images/products/drip-set-1.jpg', '/images/products/drip-set-2.jpg'],
        categories: ['equipment'],
        isActive: true,
        isFeatured: false,
        metaTitle: 'Vietnamese Drip Coffee Set - Balan Coffee',
        metaTitleVi: 'Bộ Phin Cà Phê Việt Nam - Balan Coffee',
        metaDescription: 'Traditional Vietnamese drip coffee set',
        metaDescriptionVi: 'Bộ phin cà phê Việt Nam truyền thống',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      }
    ];

    for (const product of products) {
      await db.collection(COLLECTIONS.PRODUCTS).doc(product.id).set(product);
      console.log(`Created product: ${product.name}`);
    }
  }

  // Setup website settings
  async setupSettings() {
    console.log('Setting up website settings...');
    
    const settings = [
      {
        id: 'site-name',
        settingKey: 'site_name',
        settingValue: 'Balan Coffee & Roastery',
        settingType: 'text',
        description: 'Website name',
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'site-description',
        settingKey: 'site_description',
        settingValue: 'Premium Vietnamese coffee beans and expert roasting',
        settingType: 'text',
        description: 'Website description',
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'contact-email',
        settingKey: 'contact_email',
        settingValue: 'info@balancoffee.com',
        settingType: 'text',
        description: 'Contact email',
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'contact-phone',
        settingKey: 'contact_phone',
        settingValue: '+84 123 456 789',
        settingType: 'text',
        description: 'Contact phone',
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'store-address',
        settingKey: 'store_address',
        settingValue: '123 Coffee Street, District 1, Ho Chi Minh City',
        settingType: 'text',
        description: 'Store address',
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'shipping-fee',
        settingKey: 'shipping_fee',
        settingValue: 30000,
        settingType: 'number',
        description: 'Default shipping fee in VND',
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'free-shipping-threshold',
        settingKey: 'free_shipping_threshold',
        settingValue: 500000,
        settingType: 'number',
        description: 'Free shipping threshold in VND',
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'currency',
        settingKey: 'currency',
        settingValue: 'VND',
        settingType: 'text',
        description: 'Default currency',
        updatedAt: admin.firestore.Timestamp.now()
      }
    ];

    for (const setting of settings) {
      await db.collection(COLLECTIONS.SETTINGS).doc(setting.id).set(setting);
      console.log(`Created setting: ${setting.settingKey}`);
    }
  }

  // Setup sample blog posts
  async setupBlogs() {
    console.log('Setting up sample blog posts...');
    
    const blogs = [
      {
        id: 'guide-to-vietnamese-coffee',
        title: 'The Ultimate Guide to Vietnamese Coffee',
        titleVi: 'Hướng Dẫn Toàn Diện Về Cà Phê Việt Nam',
        slug: 'guide-to-vietnamese-coffee',
        excerpt: 'Discover the rich history and unique brewing methods of Vietnamese coffee.',
        excerptVi: 'Khám phá lịch sử phong phú và phương pháp pha chế độc đáo của cà phê Việt Nam.',
        content: 'Vietnamese coffee has a rich history dating back to the French colonial period...',
        contentVi: 'Cà phê Việt Nam có lịch sử phong phú từ thời kỳ thực dân Pháp...',
        featuredImage: '/images/blogs/vietnamese-coffee-guide.jpg',
        authorId: 'admin',
        status: 'published',
        publishedAt: admin.firestore.Timestamp.now(),
        metaTitle: 'Ultimate Guide to Vietnamese Coffee - Balan Coffee',
        metaTitleVi: 'Hướng Dẫn Toàn Diện Về Cà Phê Việt Nam - Balan Coffee',
        metaDescription: 'Discover Vietnamese coffee history and brewing methods',
        metaDescriptionVi: 'Khám phá lịch sử và phương pháp pha cà phê Việt Nam',
        tags: ['vietnamese coffee', 'brewing', 'history'],
        viewCount: 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'arabica-vs-robusta',
        title: 'Arabica vs Robusta: Understanding the Differences',
        titleVi: 'Arabica vs Robusta: Hiểu Rõ Sự Khác Biệt',
        slug: 'arabica-vs-robusta-differences',
        excerpt: 'Learn about the key differences between Arabica and Robusta coffee beans.',
        excerptVi: 'Tìm hiểu về những khác biệt chính giữa hạt cà phê Arabica và Robusta.',
        content: 'Coffee lovers often debate the merits of Arabica versus Robusta beans...',
        contentVi: 'Những người yêu cà phê thường tranh luận về ưu điểm của hạt Arabica và Robusta...',
        featuredImage: '/images/blogs/arabica-vs-robusta.jpg',
        authorId: 'admin',
        status: 'published',
        publishedAt: admin.firestore.Timestamp.now(),
        metaTitle: 'Arabica vs Robusta Differences - Balan Coffee',
        metaTitleVi: 'Khác Biệt Arabica vs Robusta - Balan Coffee',
        metaDescription: 'Understanding the differences between Arabica and Robusta coffee',
        metaDescriptionVi: 'Hiểu rõ sự khác biệt giữa cà phê Arabica và Robusta',
        tags: ['arabica', 'robusta', 'coffee types'],
        viewCount: 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      }
    ];

    for (const blog of blogs) {
      await db.collection(COLLECTIONS.BLOGS).doc(blog.id).set(blog);
      console.log(`Created blog: ${blog.title}`);
    }
  }

  // Run complete setup
  async runSetup() {
    try {
      console.log('Starting Firebase setup...');
      
      await this.setupCategories();
      await this.setupAdminUser();
      await this.setupProducts();
      await this.setupSettings();
      await this.setupBlogs();
      
      console.log('Firebase setup completed successfully!');
      console.log('\nAdmin credentials:');
      console.log('Email: admin@balancoffee.com');
      console.log('Password: admin123');
      console.log('\nPlease change the admin password after first login!');
      
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new FirebaseSetup();
  
  setup.runSetup()
    .then(() => {
      console.log('\nSetup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = FirebaseSetup;
