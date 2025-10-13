// Product Service - API Integration
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

class ProductService {
  // Get all products
  async getProducts(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.category) params.append('category', options.category);
      if (options.limit) params.append('limit', options.limit);
      if (options.page) params.append('page', options.page);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.order) params.append('order', options.order);

      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.products)}?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      return {
        success: true,
        products: data.products,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages
      };
    } catch (error) {
      console.error('Get products error:', error);
      throw new Error('Failed to fetch products');
    }
  }

  // Get product by ID
  async getProduct(id) {
    try {
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.products)}/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      return {
        success: true,
        product: data.product
      };
    } catch (error) {
      console.error('Get product error:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(query, options = {}) {
    try {
      const params = new URLSearchParams({ search: query });
      
      if (options.category) params.append('category', options.category);
      if (options.limit) params.append('limit', options.limit);
      if (options.page) params.append('page', options.page);

      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.products)}/search?${params}`);

      if (!response.ok) {
        throw new Error('Failed to search products');
      }

      const data = await response.json();
      return {
        success: true,
        products: data.products,
        total: data.total,
        searchQuery: query
      };
    } catch (error) {
      console.error('Search products error:', error);
      throw new Error('Failed to search products');
    }
  }

  // Get featured products
  async getFeaturedProducts(limit = 6) {
    try {
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.products)}/featured?limit=${limit}`);

      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }

      const data = await response.json();
      return {
        success: true,
        products: data.products
      };
    } catch (error) {
      console.error('Get featured products error:', error);
      throw new Error('Failed to fetch featured products');
    }
  }

  // Get products by category
  async getProductsByCategory(category, options = {}) {
    try {
      const params = new URLSearchParams({ category });
      
      if (options.limit) params.append('limit', options.limit);
      if (options.page) params.append('page', options.page);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.order) params.append('order', options.order);

      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.products)}/category/${category}?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products by category');
      }

      const data = await response.json();
      return {
        success: true,
        products: data.products,
        total: data.total,
        category: category
      };
    } catch (error) {
      console.error('Get products by category error:', error);
      throw new Error('Failed to fetch products by category');
    }
  }

  // Get related products
  async getRelatedProducts(productId, limit = 4) {
    try {
      const response = await fetch(`${buildApiUrl(API_ENDPOINTS.products)}/${productId}/related?limit=${limit}`);

      if (!response.ok) {
        throw new Error('Failed to fetch related products');
      }

      const data = await response.json();
      return {
        success: true,
        products: data.products
      };
    } catch (error) {
      console.error('Get related products error:', error);
      throw new Error('Failed to fetch related products');
    }
  }
}

export default new ProductService();
