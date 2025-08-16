// Firebase Orders Service
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../../database/firestore-schema';

class OrderService {
  // Create new order
  async createOrder(orderData) {
    try {
      // Generate order number
      const orderNumber = this.generateOrderNumber();
      
      const order = {
        orderNumber,
        ...orderData,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), order);

      return {
        success: true,
        orderId: docRef.id,
        orderNumber,
        order: {
          id: docRef.id,
          ...order
        }
      };
    } catch (error) {
      console.error('Create order error:', error);
      throw new Error('Failed to create order');
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        order: {
          id: docSnap.id,
          ...docSnap.data()
        }
      };
    } catch (error) {
      console.error('Get order error:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Get order by order number
  async getOrderByNumber(orderNumber) {
    try {
      const q = query(
        collection(db, COLLECTIONS.ORDERS),
        where('orderNumber', '==', orderNumber)
      );
      
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Order not found');
      }

      const doc = snapshot.docs[0];
      return {
        success: true,
        order: {
          id: doc.id,
          ...doc.data()
        }
      };
    } catch (error) {
      console.error('Get order by number error:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Get user orders
  async getUserOrders(userId, options = {}) {
    try {
      const { limitCount = 10, status = null } = options;
      
      const constraints = [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      ];

      if (status) {
        constraints.push(where('status', '==', status));
      }

      constraints.push(limit(limitCount));

      const q = query(collection(db, COLLECTIONS.ORDERS), ...constraints);
      const snapshot = await getDocs(q);
      
      const orders = [];
      snapshot.forEach(doc => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        orders
      };
    } catch (error) {
      console.error('Get user orders error:', error);
      throw new Error('Failed to fetch user orders');
    }
  }

  // Get all orders (Admin only)
  async getAllOrders(options = {}) {
    try {
      const { 
        limitCount = 50, 
        status = null, 
        paymentStatus = null,
        startDate = null,
        endDate = null
      } = options;
      
      const constraints = [orderBy('createdAt', 'desc')];

      if (status) {
        constraints.push(where('status', '==', status));
      }

      if (paymentStatus) {
        constraints.push(where('paymentStatus', '==', paymentStatus));
      }

      if (startDate) {
        constraints.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
      }

      if (endDate) {
        constraints.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
      }

      constraints.push(limit(limitCount));

      const q = query(collection(db, COLLECTIONS.ORDERS), ...constraints);
      const snapshot = await getDocs(q);
      
      const orders = [];
      snapshot.forEach(doc => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        orders,
        total: snapshot.size
      };
    } catch (error) {
      console.error('Get all orders error:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      
      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (notes) {
        updateData.notes = notes;
      }

      await updateDoc(docRef, updateData);

      return { success: true };
    } catch (error) {
      console.error('Update order status error:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId, paymentStatus, paymentData = {}) {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      
      const updateData = {
        paymentStatus,
        updatedAt: new Date(),
        ...paymentData
      };

      if (paymentStatus === 'completed') {
        updateData.paidAt = new Date();
      }

      await updateDoc(docRef, updateData);

      return { success: true };
    } catch (error) {
      console.error('Update payment status error:', error);
      throw new Error('Failed to update payment status');
    }
  }

  // Cancel order
  async cancelOrder(orderId, reason = '') {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      
      await updateDoc(docRef, {
        status: 'cancelled',
        notes: reason,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      console.error('Cancel order error:', error);
      throw new Error('Failed to cancel order');
    }
  }

  // Get order statistics (Admin only)
  async getOrderStatistics(period = 'month') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const q = query(
        collection(db, COLLECTIONS.ORDERS),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      
      let totalOrders = 0;
      let totalRevenue = 0;
      let completedOrders = 0;
      let pendingOrders = 0;
      let cancelledOrders = 0;

      snapshot.forEach(doc => {
        const order = doc.data();
        totalOrders++;
        
        if (order.paymentStatus === 'completed') {
          totalRevenue += order.total || 0;
          completedOrders++;
        }
        
        if (order.status === 'pending') {
          pendingOrders++;
        } else if (order.status === 'cancelled') {
          cancelledOrders++;
        }
      });

      return {
        success: true,
        statistics: {
          totalOrders,
          totalRevenue,
          completedOrders,
          pendingOrders,
          cancelledOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / completedOrders : 0
        }
      };
    } catch (error) {
      console.error('Get order statistics error:', error);
      throw new Error('Failed to fetch order statistics');
    }
  }

  // Generate order number
  generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `BC${year}${month}${day}${random}`;
  }

  // Search orders by customer email or order number
  async searchOrders(searchTerm) {
    try {
      const searchLower = searchTerm.toLowerCase();
      
      // Search by order number
      const orderNumberQuery = query(
        collection(db, COLLECTIONS.ORDERS),
        where('orderNumber', '>=', searchTerm.toUpperCase()),
        where('orderNumber', '<=', searchTerm.toUpperCase() + '\uf8ff'),
        limit(10)
      );

      // Search by customer email
      const emailQuery = query(
        collection(db, COLLECTIONS.ORDERS),
        where('customerEmail', '>=', searchLower),
        where('customerEmail', '<=', searchLower + '\uf8ff'),
        limit(10)
      );

      const [orderNumberSnapshot, emailSnapshot] = await Promise.all([
        getDocs(orderNumberQuery),
        getDocs(emailQuery)
      ]);

      const ordersMap = new Map();

      orderNumberSnapshot.forEach(doc => {
        ordersMap.set(doc.id, {
          id: doc.id,
          ...doc.data()
        });
      });

      emailSnapshot.forEach(doc => {
        ordersMap.set(doc.id, {
          id: doc.id,
          ...doc.data()
        });
      });

      const orders = Array.from(ordersMap.values());

      return {
        success: true,
        orders
      };
    } catch (error) {
      console.error('Search orders error:', error);
      throw new Error('Failed to search orders');
    }
  }
}

export default new OrderService();
