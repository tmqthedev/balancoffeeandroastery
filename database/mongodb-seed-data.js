// MongoDB Seed Data for Balan Coffee & Roastery
// Sample data converted from Firestore format to MongoDB format

// Sample Categories
const SAMPLE_CATEGORIES = [
  {
    _id: 'coffee-beans',
    name: 'Coffee Beans',
    nameVi: 'Hạt Cà Phê',
    slug: 'hat-ca-phe',
    description: 'Premium coffee beans from Vietnam and around the world',
    descriptionVi: 'Hạt cà phê cao cấp từ Việt Nam và trên thế giới',
    image: '/images/categories/coffee-beans.jpg',
    icon: 'coffee-bean',
    order: 1,
    isActive: true,
    metaTitle: 'Premium Coffee Beans - Balan Coffee',
    metaTitleVi: 'Hạt Cà Phê Cao Cấp - Balan Coffee',
    metaDescription: 'Discover our selection of premium coffee beans from Vietnam and worldwide',
    metaDescriptionVi: 'Khám phá bộ sưu tập hạt cà phê cao cấp từ Việt Nam và thế giới',
    keywords: ['coffee beans', 'hạt cà phê', 'vietnamese coffee', 'premium coffee']
  },
  {
    _id: 'beverages',
    name: 'Beverages',
    nameVi: 'Đồ Uống',
    slug: 'do-uong',
    description: 'Ready-to-drink coffee and specialty beverages',
    descriptionVi: 'Cà phê pha sẵn và đồ uống đặc biệt',
    image: '/images/categories/beverages.jpg',
    icon: 'coffee-cup',
    order: 2,
    isActive: true,
    metaTitle: 'Coffee Beverages - Balan Coffee',
    metaTitleVi: 'Đồ Uống Cà Phê - Balan Coffee',
    metaDescription: 'Enjoy our ready-to-drink coffee and specialty beverages',
    metaDescriptionVi: 'Thưởng thức các loại cà phê pha sẵn và đồ uống đặc biệt',
    keywords: ['beverages', 'đồ uống', 'ready to drink', 'coffee drinks']
  },
  {
    _id: 'accessories',
    name: 'Coffee Accessories',
    nameVi: 'Phụ Kiện Cà Phê',
    slug: 'phu-kien-ca-phe',
    description: 'Essential tools and accessories for perfect coffee brewing',
    descriptionVi: 'Dụng cụ và phụ kiện thiết yếu để pha cà phê hoàn hảo',
    image: '/images/categories/accessories.jpg',
    icon: 'coffee-filter',
    order: 3,
    isActive: true,
    metaTitle: 'Coffee Accessories - Balan Coffee',
    metaTitleVi: 'Phụ Kiện Cà Phê - Balan Coffee',
    metaDescription: 'Find the perfect coffee brewing tools and accessories',
    metaDescriptionVi: 'Tìm kiếm dụng cụ pha cà phê và phụ kiện hoàn hảo',
    keywords: ['coffee accessories', 'phụ kiện cà phê', 'brewing tools', 'coffee equipment']
  }
];

// Sample Products
const SAMPLE_PRODUCTS = [
  {
    _id: 'arabica-cau-dat',
    name: 'Arabica Cau Dat Premium',
    nameVi: 'Arabica Cầu Đất Premium',
    slug: 'arabica-cau-dat-premium',
    description: 'Premium Arabica coffee beans grown in the highland region of Cau Dat, Dalat. Known for its distinctive flavor profile with notes of chocolate and citrus.',
    descriptionVi: 'Hạt cà phê Arabica cao cấp trồng tại vùng cao Cầu Đất, Đà Lạt. Nổi tiếng với hương vị đặc trưng có note socola và cam chanh.',
    shortDescription: 'Premium highland Arabica with chocolate and citrus notes',
    shortDescriptionVi: 'Arabica cao nguyên cao cấp với hương socola và cam chanh',
    price: 280000,
    originalPrice: 320000,
    costPrice: 200000,
    sku: 'ARB-CD-001',
    barcode: '8934567890123',
    category: 'coffee-beans',
    type: 'coffee_beans',
    status: 'active',
    featured: true,
    images: [
      '/images/products/arabica-cau-dat-1.jpg',
      '/images/products/arabica-cau-dat-2.jpg',
      '/images/products/arabica-cau-dat-3.jpg'
    ],
    thumbnail: '/images/products/arabica-cau-dat-thumb.jpg',
    weight: '250g',
    dimensions: {
      length: 15,
      width: 10,
      height: 5,
      unit: 'cm'
    },
    inventory: {
      quantity: 100,
      lowStockAlert: 10,
      trackQuantity: true
    },
    shipping: {
      weight: 0.3,
      requiresShipping: true,
      shippingClass: 'standard'
    },
    seo: {
      metaTitle: 'Arabica Cầu Đất Premium - Hạt Cà Phê Cao Cấp',
      metaTitleVi: 'Arabica Cầu Đất Premium - Hạt Cà Phê Cao Cấp',
      metaDescription: 'Premium Arabica coffee beans from Cau Dat region with distinctive flavor and aroma',
      metaDescriptionVi: 'Hạt cà phê Arabica cao cấp từ vùng Cầu Đất với hương vị và mùi thơm đặc trưng',
      keywords: ['arabica', 'cau dat', 'premium coffee', 'vietnamese coffee'],
      canonicalUrl: '/products/arabica-cau-dat-premium'
    },
    attributes: {
      roastLevel: 'Medium',
      origin: 'Cau Dat, Dalat, Vietnam',
      processingMethod: 'Washed',
      flavorNotes: ['Chocolate', 'Citrus', 'Floral'],
      brewingMethods: ['Pour Over', 'French Press', 'Espresso'],
      caffeine: 'Medium',
      acidity: 'Medium-High',
      body: 'Medium',
      aroma: 'Floral, Citrus'
    },
    tags: ['arabica', 'premium', 'highland', 'dalat', 'specialty'],
    relatedProducts: ['robusta-lam-dong', 'cold-brew-concentrate'],
    crossSells: ['phin-filter', 'coffee-grinder'],
    upSells: ['arabica-cau-dat-500g'],
    viewCount: 0,
    salesCount: 0,
    taxable: true,
    taxClass: 'standard'
  },
  {
    _id: 'robusta-lam-dong',
    name: 'Robusta Lam Dong Special',
    nameVi: 'Robusta Lâm Đồng Đặc Biệt',
    slug: 'robusta-lam-dong-dac-biet',
    description: 'Bold and strong Robusta coffee beans from Lam Dong province, perfect for Vietnamese traditional coffee',
    descriptionVi: 'Hạt cà phê Robusta đậm đà từ tỉnh Lâm Đồng, hoàn hảo cho cà phê truyền thống Việt Nam',
    shortDescription: 'Bold Robusta from Lam Dong for traditional Vietnamese coffee',
    shortDescriptionVi: 'Robusta đậm đà từ Lâm Đồng cho cà phê truyền thống',
    price: 220000,
    originalPrice: 250000,
    costPrice: 160000,
    sku: 'ROB-LD-001',
    barcode: '8934567890124',
    category: 'coffee-beans',
    type: 'coffee_beans',
    status: 'active',
    featured: false,
    images: [
      '/images/products/robusta-lam-dong-1.jpg',
      '/images/products/robusta-lam-dong-2.jpg'
    ],
    thumbnail: '/images/products/robusta-lam-dong-thumb.jpg',
    weight: '250g',
    dimensions: {
      length: 15,
      width: 10,
      height: 5,
      unit: 'cm'
    },
    inventory: {
      quantity: 150,
      lowStockAlert: 15,
      trackQuantity: true
    },
    shipping: {
      weight: 0.3,
      requiresShipping: true,
      shippingClass: 'standard'
    },
    seo: {
      metaTitle: 'Robusta Lâm Đồng Đặc Biệt - Cà Phê Đậm Đà',
      metaTitleVi: 'Robusta Lâm Đồng Đặc Biệt - Cà Phê Đậm Đà',
      metaDescription: 'Bold Robusta coffee beans from Lam Dong, perfect for Vietnamese traditional coffee',
      metaDescriptionVi: 'Hạt cà phê Robusta đậm đà từ Lâm Đồng, hoàn hảo cho cà phê truyền thống',
      keywords: ['robusta', 'lam dong', 'traditional coffee', 'vietnamese coffee'],
      canonicalUrl: '/products/robusta-lam-dong-dac-biet'
    },
    attributes: {
      roastLevel: 'Dark',
      origin: 'Lam Dong, Vietnam',
      processingMethod: 'Natural',
      flavorNotes: ['Chocolate', 'Nuts', 'Earthy'],
      brewingMethods: ['Phin Filter', 'French Press', 'Cold Brew'],
      caffeine: 'High',
      acidity: 'Low',
      body: 'Full',
      aroma: 'Strong, Earthy'
    },
    tags: ['robusta', 'traditional', 'vietnamese', 'strong'],
    relatedProducts: ['arabica-cau-dat', 'phin-filter'],
    crossSells: ['condensed-milk', 'phin-filter'],
    upSells: ['robusta-lam-dong-500g'],
    viewCount: 0,
    salesCount: 0,
    taxable: true,
    taxClass: 'standard'
  },
  {
    _id: 'cold-brew-concentrate',
    name: 'Cold Brew Concentrate',
    nameVi: 'Tinh Chất Cà Phê Lạnh',
    slug: 'tinh-chat-ca-phe-lanh',
    description: 'Ready-to-drink cold brew concentrate made from premium Vietnamese coffee beans',
    descriptionVi: 'Tinh chất cà phê lạnh pha sẵn từ hạt cà phê Việt Nam cao cấp',
    shortDescription: 'Premium cold brew concentrate, ready to enjoy',
    shortDescriptionVi: 'Tinh chất cà phê lạnh cao cấp, sẵn sàng thưởng thức',
    price: 120000,
    originalPrice: 140000,
    costPrice: 80000,
    sku: 'CB-CON-001',
    barcode: '8934567890125',
    category: 'beverages',
    type: 'beverages',
    status: 'active',
    featured: true,
    images: [
      '/images/products/cold-brew-1.jpg',
      '/images/products/cold-brew-2.jpg'
    ],
    thumbnail: '/images/products/cold-brew-thumb.jpg',
    weight: '330ml',
    dimensions: {
      length: 8,
      width: 8,
      height: 15,
      unit: 'cm'
    },
    inventory: {
      quantity: 80,
      lowStockAlert: 10,
      trackQuantity: true
    },
    shipping: {
      weight: 0.4,
      requiresShipping: true,
      shippingClass: 'refrigerated'
    },
    seo: {
      metaTitle: 'Tinh Chất Cà Phê Lạnh - Cold Brew Concentrate',
      metaTitleVi: 'Tinh Chất Cà Phê Lạnh - Cold Brew Concentrate',
      metaDescription: 'Ready-to-drink cold brew concentrate, premium Vietnamese coffee',
      metaDescriptionVi: 'Tinh chất cà phê lạnh pha sẵn, cà phê Việt Nam cao cấp',
      keywords: ['cold brew', 'concentrate', 'ready to drink', 'vietnamese coffee'],
      canonicalUrl: '/products/tinh-chat-ca-phe-lanh'
    },
    attributes: {
      roastLevel: 'Medium',
      origin: 'Vietnam Blend',
      processingMethod: 'Cold Brew',
      flavorNotes: ['Smooth', 'Chocolate', 'Low Acidity'],
      brewingMethods: ['Ready to Drink'],
      caffeine: 'High',
      acidity: 'Low',
      body: 'Smooth',
      aroma: 'Rich, Smooth'
    },
    tags: ['cold brew', 'ready to drink', 'concentrate', 'smooth'],
    relatedProducts: ['arabica-cau-dat', 'robusta-lam-dong'],
    crossSells: ['ice-cubes', 'milk'],
    upSells: ['cold-brew-6-pack'],
    viewCount: 0,
    salesCount: 0,
    taxable: true,
    taxClass: 'standard'
  },
  {
    _id: 'phin-filter',
    name: 'Vietnamese Phin Filter',
    nameVi: 'Phin Cà Phê Việt Nam',
    slug: 'phin-ca-phe-viet-nam',
    description: 'Traditional Vietnamese coffee filter made from high-quality stainless steel',
    descriptionVi: 'Phin cà phê truyền thống Việt Nam làm từ inox cao cấp',
    shortDescription: 'Traditional stainless steel Vietnamese coffee filter',
    shortDescriptionVi: 'Phin cà phê inox truyền thống Việt Nam',
    price: 85000,
    originalPrice: 100000,
    costPrice: 50000,
    sku: 'PHN-SS-001',
    barcode: '8934567890126',
    category: 'accessories',
    type: 'accessories',
    status: 'active',
    featured: false,
    images: [
      '/images/products/phin-filter-1.jpg',
      '/images/products/phin-filter-2.jpg',
      '/images/products/phin-filter-3.jpg'
    ],
    thumbnail: '/images/products/phin-filter-thumb.jpg',
    weight: 'Size 4',
    dimensions: {
      length: 7,
      width: 7,
      height: 6,
      unit: 'cm'
    },
    inventory: {
      quantity: 200,
      lowStockAlert: 20,
      trackQuantity: true
    },
    shipping: {
      weight: 0.2,
      requiresShipping: true,
      shippingClass: 'standard'
    },
    seo: {
      metaTitle: 'Phin Cà Phê Việt Nam - Vietnamese Coffee Filter',
      metaTitleVi: 'Phin Cà Phê Việt Nam - Vietnamese Coffee Filter',
      metaDescription: 'Traditional Vietnamese coffee filter, high-quality stainless steel',
      metaDescriptionVi: 'Phin cà phê truyền thống Việt Nam, inox cao cấp',
      keywords: ['phin', 'vietnamese filter', 'coffee accessories', 'traditional brewing'],
      canonicalUrl: '/products/phin-ca-phe-viet-nam'
    },
    attributes: {
      material: 'Stainless Steel',
      size: 'Size 4 (Medium)',
      capacity: '1-2 cups',
      dishwasherSafe: true,
      origin: 'Vietnam',
      weight: '120g'
    },
    tags: ['phin', 'filter', 'vietnamese', 'traditional', 'stainless steel'],
    relatedProducts: ['robusta-lam-dong', 'arabica-cau-dat'],
    crossSells: ['coffee-beans', 'condensed-milk'],
    upSells: ['phin-set-deluxe'],
    viewCount: 0,
    salesCount: 0,
    taxable: true,
    taxClass: 'standard'
  }
];

// Sample Blogs
const SAMPLE_BLOGS = [
  {
    _id: 'vietnamese-coffee-culture',
    title: 'The Rich Culture of Vietnamese Coffee',
    titleVi: 'Văn Hóa Cà Phê Việt Nam Phong Phú',
    slug: 'van-hoa-ca-phe-viet-nam',
    excerpt: 'Discover the fascinating history and culture behind Vietnamese coffee',
    excerptVi: 'Khám phá lịch sử và văn hóa hấp dẫn đằng sau cà phê Việt Nam',
    content: 'Vietnamese coffee culture is one of the most unique and fascinating coffee traditions in the world...',
    contentVi: 'Văn hóa cà phê Việt Nam là một trong những truyền thống cà phê độc đáo và hấp dẫn nhất thế giới...',
    featuredImage: '/images/blogs/vietnamese-coffee-culture.jpg',
    gallery: [
      '/images/blogs/vietnamese-coffee-1.jpg',
      '/images/blogs/vietnamese-coffee-2.jpg'
    ],
    category: 'Culture',
    tags: ['vietnamese coffee', 'culture', 'tradition', 'history'],
    status: 'published',
    publishedAt: new Date('2024-01-15'),
    author: {
      id: 'author-1',
      name: 'Nguyen Van A',
      email: 'author@balancoffee.com',
      avatar: '/images/authors/author-1.jpg'
    },
    seo: {
      metaTitle: 'Vietnamese Coffee Culture - Rich Traditions | Balan Coffee',
      metaTitleVi: 'Văn Hóa Cà Phê Việt Nam - Truyền Thống Phong Phú | Balan Coffee',
      metaDescription: 'Explore the rich culture and traditions of Vietnamese coffee',
      metaDescriptionVi: 'Khám phá văn hóa và truyền thống phong phú của cà phê Việt Nam',
      keywords: ['vietnamese coffee', 'coffee culture', 'traditions', 'history'],
      canonicalUrl: '/blog/van-hoa-ca-phe-viet-nam',
      focusKeyword: 'vietnamese coffee culture',
      ogImage: '/images/blogs/vietnamese-coffee-culture-og.jpg'
    },
    social: {
      facebookShares: 0,
      twitterShares: 0,
      linkedinShares: 0
    },
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    relatedPosts: ['coffee-brewing-guide'],
    relatedProducts: ['robusta-lam-dong', 'phin-filter'],
    allowComments: true,
    featured: true,
    sticky: false,
    readingTime: 5,
    wordCount: 800,
    language: 'vi',
    translations: []
  }
];

// Sample Settings
const SAMPLE_SETTINGS = [
  {
    _id: 'site-title',
    category: 'general',
    key: 'site_title',
    value: 'Balan Coffee & Roastery',
    type: 'string',
    description: 'Website title',
    descriptionVi: 'Tiêu đề website',
    isPublic: true,
    isEditable: true
  },
  {
    _id: 'site-description',
    category: 'general',
    key: 'site_description',
    value: 'Premium Vietnamese Coffee & Roastery',
    type: 'string',
    description: 'Website description',
    descriptionVi: 'Mô tả website',
    isPublic: true,
    isEditable: true
  },
  {
    _id: 'currency',
    category: 'store',
    key: 'currency',
    value: 'VND',
    type: 'string',
    description: 'Store currency',
    descriptionVi: 'Đơn vị tiền tệ',
    isPublic: true,
    isEditable: true
  },
  {
    _id: 'shipping-fee',
    category: 'shipping',
    key: 'default_shipping_fee',
    value: 30000,
    type: 'number',
    description: 'Default shipping fee',
    descriptionVi: 'Phí giao hàng mặc định',
    isPublic: true,
    isEditable: true
  },
  {
    _id: 'free-shipping-threshold',
    category: 'shipping',
    key: 'free_shipping_threshold',
    value: 500000,
    type: 'number',
    description: 'Free shipping minimum order amount',
    descriptionVi: 'Số tiền đơn hàng tối thiểu để miễn phí vận chuyển',
    isPublic: true,
    isEditable: true
  }
];

// Sample Shipping Zones
const SAMPLE_SHIPPING_ZONES = [
  {
    _id: 'vietnam-nationwide',
    name: 'Vietnam Nationwide',
    nameVi: 'Toàn Quốc Việt Nam',
    description: 'Shipping to all provinces in Vietnam',
    descriptionVi: 'Giao hàng toàn quốc Việt Nam',
    countries: ['VN'],
    provinces: ['*'], // All provinces
    cities: [],
    postalCodes: [],
    methods: [
      {
        id: 'standard',
        name: 'Standard Shipping',
        nameVi: 'Giao Hàng Tiêu Chuẩn',
        description: '3-5 business days',
        descriptionVi: '3-5 ngày làm việc',
        type: 'flat_rate',
        cost: 30000,
        minOrder: 0,
        maxWeight: 10,
        estimatedDays: { min: 3, max: 5 },
        isActive: true
      },
      {
        id: 'express',
        name: 'Express Shipping',
        nameVi: 'Giao Hàng Nhanh',
        description: '1-2 business days',
        descriptionVi: '1-2 ngày làm việc',
        type: 'flat_rate',
        cost: 50000,
        minOrder: 0,
        maxWeight: 5,
        estimatedDays: { min: 1, max: 2 },
        isActive: true
      },
      {
        id: 'free',
        name: 'Free Shipping',
        nameVi: 'Miễn Phí Vận Chuyển',
        description: 'Free shipping for orders over 500,000 VND',
        descriptionVi: 'Miễn phí vận chuyển cho đơn hàng trên 500,000 VND',
        type: 'free_shipping',
        cost: 0,
        minOrder: 500000,
        maxWeight: 10,
        estimatedDays: { min: 3, max: 7 },
        isActive: true
      }
    ],
    isActive: true,
    priority: 1,
    restrictions: {
      minOrderValue: 0,
      maxOrderValue: null,
      maxWeight: 20,
      maxDimensions: {
        length: 100,
        width: 100,
        height: 100
      },
      excludedProductTypes: [],
      excludedProducts: []
    }
  }
];

module.exports = {
  SAMPLE_CATEGORIES,
  SAMPLE_PRODUCTS,
  SAMPLE_BLOGS,
  SAMPLE_SETTINGS,
  SAMPLE_SHIPPING_ZONES
};

// Export default object for easy importing
module.exports.default = {
  SAMPLE_CATEGORIES,
  SAMPLE_PRODUCTS,
  SAMPLE_BLOGS,
  SAMPLE_SETTINGS,
  SAMPLE_SHIPPING_ZONES
};
