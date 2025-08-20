const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

console.log('🛒 Products Firebase router loading...');

// Mock products data for development
const mockProducts = [
  {
    id: '1',
    name: 'Arabica Cầu Đất',
    nameVi: 'Arabica Cầu Đất',
    description: 'Hạt cà phê Arabica cao cấp từ vùng Cầu Đất, Đà Lạt',
    price: 350000,
    originalPrice: 400000,
    discountPercent: 12.5,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    category: 'coffee-beans',
    categoryName: 'Hạt Cà Phê',
    inStock: true,
    stockQuantity: 50,
    weight: '250g',
    origin: 'Đà Lạt, Việt Nam',
    roastLevel: 'Medium',
    flavor: 'Hương vị mạnh mẽ với hậu vị ngọt nhẹ',
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Robusta Lâm Đồng',
    nameVi: 'Robusta Lâm Đồng',
    description: 'Hạt cà phê Robusta chất lượng cao từ Lâm Đồng',
    price: 280000,
    originalPrice: 320000,
    discountPercent: 12.5,
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400',
    category: 'coffee-beans',
    categoryName: 'Hạt Cà Phê',
    inStock: true,
    stockQuantity: 30,
    weight: '250g',
    origin: 'Lâm Đồng, Việt Nam',
    roastLevel: 'Dark',
    flavor: 'Đắng đậm đà, thơm nồng',
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Arabica Typica Kongo',
    nameVi: 'Arabica Typica Kongo',
    description: 'Hạt cà phê Arabica giống Typica Kongo đặc biệt',
    price: 450000,
    originalPrice: 500000,
    discountPercent: 10,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
    category: 'coffee-beans',
    categoryName: 'Hạt Cà Phê',
    inStock: true,
    stockQuantity: 25,
    weight: '250g',
    origin: 'Đà Lạt, Việt Nam',
    roastLevel: 'Light',
    flavor: 'Chua nhẹ, hương thơm phức tạp',
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Cà Phê Phin Filter',
    nameVi: 'Cà Phê Phin Filter',
    description: 'Blend cà phê đặc biệt cho phin truyền thống',
    price: 180000,
    originalPrice: 200000,
    discountPercent: 10,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    category: 'ground-coffee',
    categoryName: 'Cà Phê Xay',
    inStock: true,
    stockQuantity: 40,
    weight: '250g',
    origin: 'Việt Nam',
    roastLevel: 'Medium-Dark',
    flavor: 'Cân bằng, phù hợp phin truyền thống',
    isActive: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Espresso Blend',
    nameVi: 'Espresso Blend',
    description: 'Blend cà phê chuyên dụng cho máy pha espresso',
    price: 320000,
    originalPrice: 360000,
    discountPercent: 11.1,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    category: 'ground-coffee',
    categoryName: 'Cà Phê Xay',
    inStock: true,
    stockQuantity: 35,
    weight: '250g',
    origin: 'Blend Việt Nam',
    roastLevel: 'Dark',
    flavor: 'Đậm đà, crema dày, phù hợp espresso',
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Cold Brew Blend',
    nameVi: 'Cold Brew Blend',
    description: 'Blend cà phê chuyên dụng pha lạnh',
    price: 250000,
    originalPrice: 280000,
    discountPercent: 10.7,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    category: 'ground-coffee',
    categoryName: 'Cà Phê Xay',
    inStock: true,
    stockQuantity: 28,
    weight: '250g',
    origin: 'Việt Nam',
    roastLevel: 'Medium',
    flavor: 'Ngọt nhẹ, không chua, phù hợp pha lạnh',
    isActive: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Search suggestions endpoint
router.get('/search-suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Filter mock products for development
    const searchTerm = q.toLowerCase();
    const suggestions = mockProducts
      .filter(product => 
        product.isActive && 
        (product.name.toLowerCase().includes(searchTerm) || 
         product.nameVi.toLowerCase().includes(searchTerm))
      )
      .slice(0, 8)
      .map(product => ({
        id: product.id,
        name: product.nameVi || product.name,
        category: product.categoryName
      }));

    res.json({ 
      success: true,
      suggestions 
    });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi tải gợi ý tìm kiếm',
      suggestions: [] 
    });
  }
});

// Get all products with filters, pagination, and sorting
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Products Firebase API called with query:', req.query);
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      inStock,
      search,
      sortBy = 'newest'
    } = req.query;

    let filteredProducts = [...mockProducts];

    // Apply filters
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
      console.log('🏷️ Category filter applied:', category);
    }

    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseInt(minPrice));
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseInt(maxPrice));
    }

    if (inStock === 'true') {
      filteredProducts = filteredProducts.filter(p => p.inStock && p.stockQuantity > 0);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.nameVi.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filteredProducts.sort((a, b) => a.nameVi.localeCompare(b.nameVi));
        break;
      case 'price_asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    // Apply pagination
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const offset = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(offset, offset + parseInt(limit));

    // Format response
    const formattedProducts = paginatedProducts.map(product => ({
      id: product.id,
      name: product.nameVi || product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercent: product.discountPercent,
      image: product.image,
      category: product.category,
      categoryName: product.categoryName,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      weight: product.weight,
      origin: product.origin,
      roastLevel: product.roastLevel,
      flavor: product.flavor,
      isFeatured: product.isFeatured
    }));

    console.log(`✅ Returning ${formattedProducts.length} products (page ${page}/${totalPages})`);

    res.json({
      success: true,
      products: formattedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      filters: {
        category,
        minPrice,
        maxPrice,
        inStock,
        search,
        sortBy
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải sản phẩm',
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = mockProducts
      .filter(p => p.isActive && p.isFeatured)
      .slice(0, 8)
      .map(product => ({
        id: product.id,
        name: product.nameVi || product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        discountPercent: product.discountPercent,
        image: product.image,
        category: product.category,
        categoryName: product.categoryName,
        isFeatured: product.isFeatured
      }));

    console.log(`✅ Returning ${featuredProducts.length} featured products`);

    res.json({
      success: true,
      products: featuredProducts
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải sản phẩm nổi bật',
      products: []
    });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Fetching product with ID:', id);

    const product = mockProducts.find(p => p.id === id && p.isActive);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    const formattedProduct = {
      id: product.id,
      name: product.nameVi || product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercent: product.discountPercent,
      image: product.image,
      category: product.category,
      categoryName: product.categoryName,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      weight: product.weight,
      origin: product.origin,
      roastLevel: product.roastLevel,
      flavor: product.flavor,
      isFeatured: product.isFeatured
    };

    console.log('✅ Product found:', formattedProduct.name);

    res.json({
      success: true,
      product: formattedProduct
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải thông tin sản phẩm'
    });
  }
});

// Get product categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = [
      {
        id: '1',
        name: 'Hạt Cà Phê',
        slug: 'coffee-beans',
        description: 'Hạt cà phê nguyên chất cao cấp',
        isActive: true
      },
      {
        id: '2',
        name: 'Cà Phê Xay',
        slug: 'ground-coffee',
        description: 'Cà phê đã xay sẵn tiện lợi',
        isActive: true
      },
      {
        id: '3',
        name: 'Đồ Uống',
        slug: 'beverages',
        description: 'Các loại đồ uống cà phê pha sẵn',
        isActive: true
      },
      {
        id: '4',
        name: 'Dụng Cụ',
        slug: 'equipment',
        description: 'Dụng cụ pha chế cà phê',
        isActive: true
      }
    ];

    console.log('✅ Returning product categories');

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh mục sản phẩm',
      categories: []
    });
  }
});

console.log('✅ Products Firebase router loaded successfully');

module.exports = router;
