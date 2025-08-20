const { firestoreService } = require('./config/database');

// Sample categories data
const categories = [
  {
    id: 'ca-phe-hat',
    name: 'Coffee Beans',
    nameVi: 'Cà Phê Hạt',
    slug: 'ca-phe-hat',
    description: 'Premium coffee beans from Vietnam',
    descriptionVi: 'Hạt cà phê cao cấp từ Việt Nam',
    status: 'active',
    sort_order: 1,
    icon: '☕',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'do-uong',
    name: 'Beverages', 
    nameVi: 'Đồ Uống',
    slug: 'do-uong',
    description: 'Ready-to-drink coffee beverages',
    descriptionVi: 'Đồ uống cà phê pha sẵn',
    status: 'active',
    sort_order: 2,
    icon: '🥤',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 'dich-vu',
    name: 'Services',
    nameVi: 'Dịch Vụ',
    slug: 'dich-vu',
    description: 'Coffee related services',
    descriptionVi: 'Các dịch vụ liên quan đến cà phê',
    status: 'active',
    sort_order: 3,
    icon: '🛎️',
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Sample products data
const products = [
  {
    id: 'arabica-cau-dat-honey',
    name: 'Arabica Cầu Đất Honey Process',
    nameVi: 'Arabica Cầu Đất Honey Process',
    slug: 'arabica-cau-dat-honey',
    sku: 'ACH-500',
    description: 'Premium Arabica coffee from Cầu Đất plateau, processed using honey method for unique sweetness',
    descriptionVi: 'Cà phê Arabica cao cấp từ cao nguyên Cầu Đất, chế biến theo phương pháp honey tạo vị ngọt độc đáo',
    short_description: 'Premium honey-processed Arabica with natural sweetness',
    short_descriptionVi: 'Arabica chế biến honey với vị ngọt tự nhiên',
    price: 380000,
    sale_price: null,
    category_id: 'ca-phe-hat',
    category_name: 'Cà Phê Hạt',
    category_slug: 'ca-phe-hat',
    weight: 500,
    weight_unit: 'g',
    origin: 'Cầu Đất, Đà Lạt',
    altitude: '1200-1500m',
    process_method: 'Honey Process',
    roast_level: 'Medium',
    flavor_notes: ['Chocolate', 'Caramel', 'Orange'],
    flavor_notesVi: ['Sô-cô-la', 'Caramel', 'Cam'],
    brewing_methods: ['Pour Over', 'French Press', 'Espresso'],
    brewing_methodsVi: ['Pour Over', 'French Press', 'Espresso'],
    stock_quantity: 50,
    is_featured: true,
    featured_order: 1,
    status: 'active',
    meta_title: 'Arabica Cầu Đất Honey Process - Premium Coffee Beans',
    meta_description: 'Premium Arabica coffee from Cầu Đất plateau, honey processed for unique sweetness. Order now!',
    tags: ['arabica', 'honey-process', 'premium', 'cau-dat'],
    created_at: new Date(),
    updated_at: new Date(),
    images: {
      variants: {
        main: {
          thumbnail: { url: '/images/products/arabica-cau-dat-thumbnail.webp', width: 150, height: 150 },
          small: { url: '/images/products/arabica-cau-dat-small.webp', width: 400, height: 400 },
          medium: { url: '/images/products/arabica-cau-dat-medium.webp', width: 800, height: 800 },
          large: { url: '/images/products/arabica-cau-dat-large.webp', width: 1200, height: 1200 }
        }
      },
      mainImage: { url: '/images/products/arabica-cau-dat-large.webp', width: 1200, height: 1200 }
    }
  },
  {
    id: 'robusta-lam-dong-washed',
    name: 'Robusta Lâm Đồng Washed',
    nameVi: 'Robusta Lâm Đồng Washed',
    slug: 'robusta-lam-dong-washed',
    sku: 'RLW-500',
    description: 'Strong and bold Robusta from Lâm Đồng province, washed process for clean taste',
    descriptionVi: 'Robusta mạnh mẽ từ tỉnh Lâm Đồng, chế biến tươi cho hương vị trong sạch',
    short_description: 'Strong washed Robusta with bold flavor',
    short_descriptionVi: 'Robusta washed với hương vị đậm đà',
    price: 280000,
    sale_price: 250000,
    category_id: 'ca-phe-hat',
    category_name: 'Cà Phê Hạt',
    category_slug: 'ca-phe-hat',
    weight: 500,
    weight_unit: 'g',
    origin: 'Lâm Đồng',
    altitude: '800-1200m',
    process_method: 'Washed',
    roast_level: 'Dark',
    flavor_notes: ['Chocolate', 'Nutty', 'Earthy'],
    flavor_notesVi: ['Sô-cô-la', 'Hạt', 'Đất'],
    brewing_methods: ['Espresso', 'Moka Pot', 'Vietnamese Drip'],
    brewing_methodsVi: ['Espresso', 'Moka Pot', 'Phin Việt Nam'],
    stock_quantity: 75,
    is_featured: true,
    featured_order: 2,
    status: 'active',
    meta_title: 'Robusta Lâm Đồng Washed - Bold Coffee Beans',
    meta_description: 'Strong and bold Robusta coffee from Lâm Đồng, washed for clean taste. Perfect for espresso!',
    tags: ['robusta', 'washed', 'bold', 'lam-dong'],
    created_at: new Date(),
    updated_at: new Date(),
    images: {
      variants: {
        main: {
          thumbnail: { url: '/images/products/robusta-lam-dong-thumbnail.webp', width: 150, height: 150 },
          small: { url: '/images/products/robusta-lam-dong-small.webp', width: 400, height: 400 },
          medium: { url: '/images/products/robusta-lam-dong-medium.webp', width: 800, height: 800 },
          large: { url: '/images/products/robusta-lam-dong-large.webp', width: 1200, height: 1200 }
        }
      },
      mainImage: { url: '/images/products/robusta-lam-dong-large.webp', width: 1200, height: 1200 }
    }
  },
  {
    id: 'arabica-typica-kongo',
    name: 'Arabica Typica Kongo',
    nameVi: 'Arabica Typica Kongo',
    slug: 'arabica-typica-kongo',
    sku: 'ATK-500',
    description: 'Heritage Typica variety from Kongo region, natural process highlighting fruity notes',
    descriptionVi: 'Giống Typica truyền thống từ vùng Kongo, chế biến khô tự nhiên nổi bật hương trái cây',
    short_description: 'Heritage Typica with fruity natural process',
    short_descriptionVi: 'Typica truyền thống với quy trình tự nhiên',
    price: 420000,
    sale_price: null,
    category_id: 'ca-phe-hat',
    category_name: 'Cà Phê Hạt',
    category_slug: 'ca-phe-hat',
    weight: 500,
    weight_unit: 'g',
    origin: 'Kongo, Đà Lạt',
    altitude: '1400-1600m',
    process_method: 'Natural',
    roast_level: 'Light-Medium',
    flavor_notes: ['Berry', 'Floral', 'Wine'],
    flavor_notesVi: ['Quả mọng', 'Hoa', 'Rượu vang'],
    brewing_methods: ['Pour Over', 'AeroPress', 'Cold Brew'],
    brewing_methodsVi: ['Pour Over', 'AeroPress', 'Cold Brew'],
    stock_quantity: 30,
    is_featured: true,
    featured_order: 3,
    status: 'active',
    meta_title: 'Arabica Typica Kongo - Heritage Coffee Beans',
    meta_description: 'Heritage Typica variety from Kongo region, natural process with fruity notes. Limited edition!',
    tags: ['arabica', 'typica', 'natural-process', 'heritage', 'kongo'],
    created_at: new Date(),
    updated_at: new Date(),
    images: {
      variants: {
        main: {
          thumbnail: { url: '/images/products/arabica-typica-thumbnail.webp', width: 150, height: 150 },
          small: { url: '/images/products/arabica-typica-small.webp', width: 400, height: 400 },
          medium: { url: '/images/products/arabica-typica-medium.webp', width: 800, height: 800 },
          large: { url: '/images/products/arabica-typica-large.webp', width: 1200, height: 1200 }
        }
      },
      mainImage: { url: '/images/products/arabica-typica-large.webp', width: 1200, height: 1200 }
    }
  },
  {
    id: 'ca-phe-sua-da',
    name: 'Iced Milk Coffee',
    nameVi: 'Cà Phê Sữa Đá',
    slug: 'ca-phe-sua-da',
    sku: 'CFSD-1',
    description: 'Traditional Vietnamese iced coffee with condensed milk',
    descriptionVi: 'Cà phê sữa đá truyền thống Việt Nam với sữa đặc',
    short_description: 'Traditional Vietnamese iced coffee',
    short_descriptionVi: 'Cà phê sữa đá truyền thống',
    price: 35000,
    sale_price: null,
    category_id: 'do-uong',
    category_name: 'Đồ Uống',
    category_slug: 'do-uong',
    weight: null,
    weight_unit: 'cup',
    origin: null,
    altitude: null,
    process_method: null,
    roast_level: null,
    flavor_notes: ['Sweet', 'Creamy', 'Strong'],
    flavor_notesVi: ['Ngọt', 'Béo', 'Đậm đà'],
    brewing_methods: ['Vietnamese Drip'],
    brewing_methodsVi: ['Phin Việt Nam'],
    stock_quantity: 100,
    is_featured: false,
    featured_order: null,
    status: 'active',
    meta_title: 'Cà Phê Sữa Đá - Traditional Vietnamese Iced Coffee',
    meta_description: 'Authentic Vietnamese iced coffee with condensed milk. A perfect refreshing drink!',
    tags: ['vietnamese-coffee', 'iced-coffee', 'milk-coffee', 'traditional'],
    created_at: new Date(),
    updated_at: new Date(),
    images: {
      variants: {
        main: {
          thumbnail: { url: '/images/products/ca-phe-sua-da-thumbnail.webp', width: 150, height: 150 },
          small: { url: '/images/products/ca-phe-sua-da-small.webp', width: 400, height: 400 },
          medium: { url: '/images/products/ca-phe-sua-da-medium.webp', width: 800, height: 800 },
          large: { url: '/images/products/ca-phe-sua-da-large.webp', width: 1200, height: 1200 }
        }
      },
      mainImage: { url: '/images/products/ca-phe-sua-da-large.webp', width: 1200, height: 1200 }
    }
  },
  {
    id: 'espresso-shot',
    name: 'Espresso Shot',
    nameVi: 'Espresso Shot',
    slug: 'espresso-shot',
    sku: 'ESP-1',
    description: 'Pure espresso shot made from premium blend',
    descriptionVi: 'Espresso nguyên chất từ blend cao cấp',
    short_description: 'Pure espresso shot',
    short_descriptionVi: 'Espresso nguyên chất',
    price: 25000,
    sale_price: null,
    category_id: 'do-uong',
    category_name: 'Đồ Uống',
    category_slug: 'do-uong',
    weight: null,
    weight_unit: 'shot',
    origin: null,
    altitude: null,
    process_method: null,
    roast_level: null,
    flavor_notes: ['Intense', 'Rich', 'Aromatic'],
    flavor_notesVi: ['Đậm đặc', 'Phong phú', 'Thơm'],
    brewing_methods: ['Espresso Machine'],
    brewing_methodsVi: ['Máy Espresso'],
    stock_quantity: 100,
    is_featured: false,
    featured_order: null,
    status: 'active',
    meta_title: 'Espresso Shot - Pure Coffee Experience',
    meta_description: 'Pure espresso shot made from premium coffee blend. Intense and aromatic!',
    tags: ['espresso', 'pure-coffee', 'intense', 'premium'],
    created_at: new Date(),
    updated_at: new Date(),
    images: {
      variants: {
        main: {
          thumbnail: { url: '/images/products/espresso-shot-thumbnail.webp', width: 150, height: 150 },
          small: { url: '/images/products/espresso-shot-small.webp', width: 400, height: 400 },
          medium: { url: '/images/products/espresso-shot-medium.webp', width: 800, height: 800 },
          large: { url: '/images/products/espresso-shot-large.webp', width: 1200, height: 1200 }
        }
      },
      mainImage: { url: '/images/products/espresso-shot-large.webp', width: 1200, height: 1200 }
    }
  },
  {
    id: 'coffee-cupping-service',
    name: 'Coffee Cupping Experience',
    nameVi: 'Trải Nghiệm Coffee Cupping',
    slug: 'coffee-cupping-service',
    sku: 'CCS-1',
    description: 'Professional coffee cupping session to explore different flavors and origins',
    descriptionVi: 'Buổi thử cà phê chuyên nghiệp để khám phá các hương vị và nguồn gốc khác nhau',
    short_description: 'Professional coffee tasting experience',
    short_descriptionVi: 'Trải nghiệm thử cà phê chuyên nghiệp',
    price: 150000,
    sale_price: null,
    category_id: 'dich-vu',
    category_name: 'Dịch Vụ',
    category_slug: 'dich-vu',
    weight: null,
    weight_unit: 'session',
    origin: null,
    altitude: null,
    process_method: null,
    roast_level: null,
    flavor_notes: ['Educational', 'Interactive', 'Professional'],
    flavor_notesVi: ['Giáo dục', 'Tương tác', 'Chuyên nghiệp'],
    brewing_methods: ['Cupping'],
    brewing_methodsVi: ['Cupping'],
    stock_quantity: 20,
    is_featured: false,
    featured_order: null,
    status: 'active',
    meta_title: 'Coffee Cupping Experience - Learn About Coffee',
    meta_description: 'Professional coffee cupping session. Learn about different coffee flavors and origins!',
    tags: ['cupping', 'education', 'experience', 'professional'],
    created_at: new Date(),
    updated_at: new Date(),
    images: {
      variants: {
        main: {
          thumbnail: { url: '/images/products/coffee-cupping-thumbnail.webp', width: 150, height: 150 },
          small: { url: '/images/products/coffee-cupping-small.webp', width: 400, height: 400 },
          medium: { url: '/images/products/coffee-cupping-medium.webp', width: 800, height: 800 },
          large: { url: '/images/products/coffee-cupping-large.webp', width: 1200, height: 1200 }
        }
      },
      mainImage: { url: '/images/products/coffee-cupping-large.webp', width: 1200, height: 1200 }
    }
  }
];

// Sample blog posts
const blogs = [
  {
    id: 'huong-dan-pha-ca-phe-phin',
    title: 'Hướng Dẫn Pha Cà Phê Phin Truyền Thống',
    slug: 'huong-dan-pha-ca-phe-phin',
    excerpt: 'Khám phá nghệ thuật pha cà phê phin Việt Nam với những bí quyết từ chuyên gia',
    content: `Cà phê phin là một trong những nét văn hóa đặc trưng của Việt Nam. Để pha được một ly cà phê phin ngon, bạn cần chú ý đến những yếu tố sau...`,
    author: 'Balanco Coffee Team',
    category: 'brewing-guide',
    categoryVi: 'Hướng Dẫn Pha Chế',
    tags: ['phin', 'vietnamese-coffee', 'brewing', 'traditional'],
    featured_image: '/images/blogs/phin-coffee-guide.webp',
    published: true,
    views: 1250,
    meta_title: 'Hướng Dẫn Pha Cà Phê Phin Truyền Thống Việt Nam',
    meta_description: 'Khám phá nghệ thuật pha cà phê phin Việt Nam với những bí quyết từ chuyên gia. Hướng dẫn chi tiết từng bước.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'ca-phe-arabica-vs-robusta',
    title: 'Arabica vs Robusta: Sự Khác Biệt và Cách Chọn',
    slug: 'ca-phe-arabica-vs-robusta',
    excerpt: 'Tìm hiểu sự khác biệt giữa hai loại cà phê phổ biến nhất thế giới và cách chọn phù hợp với sở thích',
    content: `Arabica và Robusta là hai loại cà phê chính được trồng trên toàn thế giới. Mỗi loại có những đặc điểm riêng biệt...`,
    author: 'Balanco Coffee Team',
    category: 'coffee-knowledge',
    categoryVi: 'Kiến Thức Cà Phê',
    tags: ['arabica', 'robusta', 'coffee-types', 'comparison'],
    featured_image: '/images/blogs/arabica-vs-robusta.webp',
    published: true,
    views: 890,
    meta_title: 'Arabica vs Robusta: Sự Khác Biệt và Cách Chọn Cà Phê',
    meta_description: 'Tìm hiểu sự khác biệt giữa Arabica và Robusta, hai loại cà phê phổ biến nhất. Hướng dẫn chọn cà phê phù hợp.',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  }
];

// Sample admin user
const adminUser = {
  id: 'admin-001',
  email: 'admin@balanco.coffee',
  firstName: 'Admin',
  lastName: 'Balanco',
  password: '$2b$10$example.hash.password', // Remember to hash properly
  role: 'admin',
  status: 'active',
  phone: '+84901234567',
  address: {
    street: '123 Coffee Street',
    city: 'Ho Chi Minh City',
    state: 'Ho Chi Minh',
    zipCode: '70000',
    country: 'Vietnam'
  },
  created_at: new Date(),
  updated_at: new Date(),
  last_login: null,
  email_verified: true,
  phone_verified: false
};

// Seed function
async function seedFirestoreData() {
  try {
    console.log('🌱 Starting Firestore data seeding...');

    // Initialize Firestore service
    console.log('🔄 Initializing Firestore service...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for initialization

    // Seed categories
    console.log('📂 Seeding categories...');
    for (const category of categories) {
      try {
        await firestoreService.createCategory(category);
        console.log(`✅ Created category: ${category.nameVi}`);
      } catch (error) {
        console.log(`⚠️ Category ${category.nameVi} might already exist or error occurred:`, error.message);
      }
    }

    // Seed products
    console.log('📦 Seeding products...');
    for (const product of products) {
      try {
        await firestoreService.createProduct(product);
        console.log(`✅ Created product: ${product.nameVi}`);
      } catch (error) {
        console.log(`⚠️ Product ${product.nameVi} might already exist or error occurred:`, error.message);
      }
    }

    // Seed blogs
    console.log('📝 Seeding blogs...');
    for (const blog of blogs) {
      try {
        await firestoreService.createBlog(blog);
        console.log(`✅ Created blog: ${blog.title}`);
      } catch (error) {
        console.log(`⚠️ Blog ${blog.title} might already exist or error occurred:`, error.message);
      }
    }

    // Seed admin user
    console.log('👤 Seeding admin user...');
    try {
      await firestoreService.createUser(adminUser);
      console.log(`✅ Created admin user: ${adminUser.email}`);
    } catch (error) {
      console.log(`⚠️ Admin user might already exist or error occurred:`, error.message);
    }

    console.log('🎉 Firestore data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Blogs: ${blogs.length}`);
    console.log(`   - Users: 1 admin`);

  } catch (error) {
    console.error('❌ Error seeding Firestore data:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedFirestoreData()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedFirestoreData,
  categories,
  products,
  blogs,
  adminUser
};
