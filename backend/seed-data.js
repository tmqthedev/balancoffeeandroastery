// MongoDB Seed Data for Balan Coffee & Roastery
// Sample data in CommonJS format for backend

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
    name: 'Arabica Cau Dat Premium',
    slug: 'arabica-cau-dat-premium',
    description: 'Premium Arabica coffee beans grown in the highland region of Cau Dat, Dalat. Known for its distinctive flavor profile with notes of chocolate and citrus.',
    price: 280000,
    comparePrice: 320000,
    stockQuantity: 100,
    weight: 250,
    image_url: '/images/products/arabica-cau-dat.jpg',
    images: [
      '/images/products/arabica-cau-dat-1.jpg',
      '/images/products/arabica-cau-dat-2.jpg'
    ],
    categoryId: 'coffee-beans',
    category: {
      name: 'Coffee Beans',
      slug: 'hat-ca-phe'
    },
    origin: 'Cau Dat, Dalat, Vietnam',
    roast_level: 'Medium',
    flavor_profile: ['Chocolate', 'Citrus', 'Floral'],
    brewing_methods: ['Pour Over', 'French Press', 'Espresso'],
    isFeatured: true,
    isActive: true,
    rating: {
      average: 4.8,
      count: 15
    }
  },
  {
    name: 'Robusta Lam Dong Special',
    slug: 'robusta-lam-dong-special',
    description: 'Bold and strong Robusta coffee beans from Lam Dong province, perfect for Vietnamese traditional coffee',
    price: 220000,
    comparePrice: 250000,
    stockQuantity: 150,
    weight: 250,
    image_url: '/images/products/robusta-lam-dong.jpg',
    images: [
      '/images/products/robusta-lam-dong-1.jpg',
      '/images/products/robusta-lam-dong-2.jpg'
    ],
    categoryId: 'coffee-beans',
    category: {
      name: 'Coffee Beans',
      slug: 'hat-ca-phe'
    },
    origin: 'Lam Dong, Vietnam',
    roast_level: 'Dark',
    flavor_profile: ['Chocolate', 'Nuts', 'Earthy'],
    brewing_methods: ['Phin Filter', 'French Press', 'Cold Brew'],
    isFeatured: false,
    isActive: true,
    rating: {
      average: 4.5,
      count: 23
    }
  },
  {
    name: 'Cold Brew Concentrate',
    slug: 'cold-brew-concentrate',
    description: 'Ready-to-drink cold brew concentrate made from premium Vietnamese coffee beans',
    price: 120000,
    comparePrice: 140000,
    stockQuantity: 80,
    weight: 330,
    image_url: '/images/products/cold-brew.jpg',
    images: [
      '/images/products/cold-brew-1.jpg',
      '/images/products/cold-brew-2.jpg'
    ],
    categoryId: 'beverages',
    category: {
      name: 'Beverages',
      slug: 'do-uong'
    },
    origin: 'Vietnam Blend',
    roast_level: 'Medium',
    flavor_profile: ['Smooth', 'Chocolate', 'Low Acidity'],
    brewing_methods: ['Ready to Drink'],
    isFeatured: true,
    isActive: true,
    rating: {
      average: 4.7,
      count: 8
    }
  },
  {
    name: 'Vietnamese Phin Filter',
    slug: 'vietnamese-phin-filter',
    description: 'Traditional Vietnamese coffee filter made from high-quality stainless steel',
    price: 85000,
    comparePrice: 100000,
    stockQuantity: 200,
    weight: 120,
    image_url: '/images/products/phin-filter.jpg',
    images: [
      '/images/products/phin-filter-1.jpg',
      '/images/products/phin-filter-2.jpg'
    ],
    categoryId: 'accessories',
    category: {
      name: 'Coffee Accessories',
      slug: 'phu-kien-ca-phe'
    },
    origin: 'Vietnam',
    isFeatured: false,
    isActive: true,
    rating: {
      average: 4.9,
      count: 31
    }
  }
];

// Sample Blogs
const SAMPLE_BLOGS = [
  {
    title: 'Cách pha cà phê phin truyền thống Việt Nam',
    slug: 'cach-pha-ca-phe-phin-truyen-thong',
    excerpt: 'Hướng dẫn chi tiết cách pha cà phê phin để có ly cà phê đậm đà, thơm ngon đúng chuẩn Việt Nam.',
    content: 'Cà phê phin là một phần không thể thiếu trong văn hóa Việt Nam. Để pha được ly cà phê phin ngon, bạn cần có những kỹ thuật nhất định...',
    featuredImage: '/images/blogs/ca-phe-phin.jpg',
    category: 'Hướng dẫn',
    status: 'published',
    publishedAt: new Date('2024-01-15'),
    author: {
      name: 'Nguyễn Văn A',
      email: 'author@balancoffee.com'
    },
    readingTime: 5,
    viewCount: 0
  },
  {
    title: 'Tìm hiểu về Arabica Cầu Đất - Đặc sản cà phê Đà Lạt',
    slug: 'arabica-cau-dat-dac-san-ca-phe-da-lat',
    excerpt: 'Arabica Cầu Đất được trồng tại vùng cao nguyên Đà Lạt với hương vị đặc trưng, nổi tiếng toàn quốc.',
    content: 'Arabica Cầu Đất là giống cà phê cao cấp được trồng tại vùng cao nguyên Đà Lạt. Với điều kiện khí hậu lý tưởng...',
    featuredImage: '/images/blogs/arabica-cau-dat.jpg',
    category: 'Kiến thức',
    status: 'published',
    publishedAt: new Date('2024-01-10'),
    author: {
      name: 'Trần Thị B',
      email: 'author2@balancoffee.com'
    },
    readingTime: 7,
    viewCount: 0
  },
  {
    title: 'Cold Brew - Xu hướng cà phê lạnh hiện đại',
    slug: 'cold-brew-xu-huong-ca-phe-lanh-hien-dai',
    excerpt: 'Cold Brew đang trở thành xu hướng yêu thích của giới trẻ với hương vị mềm mại, ít acid.',
    content: 'Cold Brew hay cà phê pha lạnh là phương pháp pha cà phê bằng nước lạnh trong thời gian dài. Phương pháp này tạo ra hương vị...',
    featuredImage: '/images/blogs/cold-brew.jpg',
    category: 'Xu hướng',
    status: 'published',
    publishedAt: new Date('2024-01-05'),
    author: {
      name: 'Lê Văn C',
      email: 'author3@balancoffee.com'
    },
    readingTime: 4,
    viewCount: 0
  }
];

module.exports = {
  SAMPLE_CATEGORIES,
  SAMPLE_PRODUCTS,
  SAMPLE_BLOGS
};
