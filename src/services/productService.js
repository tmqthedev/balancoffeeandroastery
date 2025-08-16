// Firebase Products Service
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  or,
  and
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../../database/firestore-schema';

class ProductService {
  // Get all products with pagination and filters
  async getProducts(options = {}) {
    try {
      const {
        page = 1,
        pageSize = 12,
        category = null,
        search = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        isActive = true,
        isFeatured = null,
        lastDoc = null
      } = options;

      let q = collection(db, COLLECTIONS.PRODUCTS);
      const constraints = [];

      // Filter by active status
      if (isActive !== null) {
        constraints.push(where('isActive', '==', isActive));
      }

      // Filter by featured status
      if (isFeatured !== null) {
        constraints.push(where('isFeatured', '==', isFeatured));
      }

      // Filter by category
      if (category) {
        constraints.push(where('categories', 'array-contains', category));
      }

      // Search functionality
      if (search) {
        // Firebase doesn't support full-text search, so we'll search by name
        // For production, consider using Algolia or similar service
        const searchLower = search.toLowerCase();
        constraints.push(
          or(
            and(
              where('name', '>=', searchLower),
              where('name', '<=', searchLower + '\uf8ff')
            ),
            and(
              where('nameVi', '>=', searchLower),
              where('nameVi', '<=', searchLower + '\uf8ff')
            )
          )
        );
      }

      // Add ordering
      constraints.push(orderBy(sortBy, sortOrder));

      // Add pagination
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }
      constraints.push(limit(pageSize));

      q = query(q, ...constraints);
      const snapshot = await getDocs(q);

      const products = [];
      snapshot.forEach(doc => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      return {
        success: true,
        products,
        hasMore: snapshot.docs.length === pageSize,
        lastDoc: lastVisible,
        total: snapshot.size
      };
    } catch (error) {
      console.error('Get products error:', error);
      throw new Error('Failed to fetch products');
    }
  }

  // Get product by ID
  async getProductById(productId) {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Product not found');
      }

      return {
        success: true,
        product: {
          id: docSnap.id,
          ...docSnap.data()
        }
      };
    } catch (error) {
      console.error('Get product error:', error);
      throw new Error('Failed to fetch product');
    }
  }

  // Get product by slug
  async getProductBySlug(slug) {
    try {
      const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('slug', '==', slug),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Product not found');
      }

      const doc = snapshot.docs[0];
      return {
        success: true,
        product: {
          id: doc.id,
          ...doc.data()
        }
      };
    } catch (error) {
      console.error('Get product by slug error:', error);
      throw new Error('Failed to fetch product');
    }
  }

  // Get featured products
  async getFeaturedProducts(limitCount = 8) {
    try {
      const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('isActive', '==', true),
        where('isFeatured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const products = [];

      snapshot.forEach(doc => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        products
      };
    } catch (error) {
      console.error('Get featured products error:', error);
      throw new Error('Failed to fetch featured products');
    }
  }

  // Get products by category
  async getProductsByCategory(categoryId, limitCount = 12) {
    try {
      const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('isActive', '==', true),
        where('categories', 'array-contains', categoryId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const products = [];

      snapshot.forEach(doc => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        products
      };
    } catch (error) {
      console.error('Get products by category error:', error);
      throw new Error('Failed to fetch products by category');
    }
  }

  // Search products
  async searchProducts(searchTerm, options = {}) {
    try {
      const { limitCount = 20 } = options;
      
      // For basic search, we'll search in name and nameVi fields
      // For advanced search functionality, consider using Algolia
      const searchLower = searchTerm.toLowerCase();
      
      const queries = [
        query(
          collection(db, COLLECTIONS.PRODUCTS),
          where('isActive', '==', true),
          where('name', '>=', searchLower),
          where('name', '<=', searchLower + '\uf8ff'),
          limit(limitCount)
        ),
        query(
          collection(db, COLLECTIONS.PRODUCTS),
          where('isActive', '==', true),
          where('nameVi', '>=', searchLower),
          where('nameVi', '<=', searchLower + '\uf8ff'),
          limit(limitCount)
        )
      ];

      const results = await Promise.all(queries.map(q => getDocs(q)));
      const productsMap = new Map();

      results.forEach(snapshot => {
        snapshot.forEach(doc => {
          productsMap.set(doc.id, {
            id: doc.id,
            ...doc.data()
          });
        });
      });

      const products = Array.from(productsMap.values());

      return {
        success: true,
        products,
        total: products.length
      };
    } catch (error) {
      console.error('Search products error:', error);
      throw new Error('Failed to search products');
    }
  }

  // Create product (Admin only)
  async createProduct(productData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        success: true,
        productId: docRef.id
      };
    } catch (error) {
      console.error('Create product error:', error);
      throw new Error('Failed to create product');
    }
  }

  // Update product (Admin only)
  async updateProduct(productId, productData) {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
      
      await updateDoc(docRef, {
        ...productData,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Update product error:', error);
      throw new Error('Failed to update product');
    }
  }

  // Delete product (Admin only)
  async deleteProduct(productId) {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
      await deleteDoc(docRef);

      return { success: true };
    } catch (error) {
      console.error('Delete product error:', error);
      throw new Error('Failed to delete product');
    }
  }

  // Update stock quantity
  async updateStock(productId, quantity) {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
      
      await updateDoc(docRef, {
        stockQuantity: quantity,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Update stock error:', error);
      throw new Error('Failed to update stock');
    }
  }

  // Get low stock products (Admin only)
  async getLowStockProducts(threshold = 10) {
    try {
      const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('isActive', '==', true),
        where('stockQuantity', '<=', threshold),
        orderBy('stockQuantity', 'asc')
      );

      const snapshot = await getDocs(q);
      const products = [];

      snapshot.forEach(doc => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        products
      };
    } catch (error) {
      console.error('Get low stock products error:', error);
      throw new Error('Failed to fetch low stock products');
    }
  }
}

export default new ProductService();
