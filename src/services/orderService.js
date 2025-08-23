// Order Service - API Integration
const API_BASE_URL = '/api';

class OrderService {
  // Create new order
  async createOrder(orderData) {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const data = await response.json();
      return {
        success: true,
        orderId: data.order.id,
        orderNumber: data.order.orderNumber,
        order: data.order
      };
    } catch (error) {
      console.error('Create order error:', error);
      throw new Error(error.message || 'Failed to create order');
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Order not found');
      }

      const data = await response.json();
      return {
        success: true,
        order: data.order
      };
    } catch (error) {
      console.error('Get order error:', error);
      throw new Error(error.message || 'Failed to fetch order');
    }
  }

  // Get order by order number
  async getOrderByNumber(orderNumber) {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/orders/number/${orderNumber}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Order not found');
      }

      const data = await response.json();
      return {
        success: true,
        order: data.order
      };
    } catch (error) {
      console.error('Get order by number error:', error);
      throw new Error(error.message || 'Failed to fetch order');
    }
  }

  // Get user orders
  async getUserOrders(userId, options = {}) {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      if (options.limitCount) params.append('limit', options.limitCount);
      if (options.status) params.append('status', options.status);

      const response = await fetch(`${API_BASE_URL}/orders/user/${userId}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user orders');
      }

      const data = await response.json();
      return {
        success: true,
        orders: data.orders
      };
    } catch (error) {
      console.error('Get user orders error:', error);
      throw new Error(error.message || 'Failed to fetch user orders');
    }
  }

  // Get all orders (Admin only)
  async getAllOrders(options = {}) {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      if (options.limitCount) params.append('limit', options.limitCount);
      if (options.status) params.append('status', options.status);
      if (options.paymentStatus) params.append('paymentStatus', options.paymentStatus);
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());

      const response = await fetch(`${API_BASE_URL}/orders?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch orders');
      }

      const data = await response.json();
      return {
        success: true,
        orders: data.orders,
        total: data.total
      };
    } catch (error) {
      console.error('Get all orders error:', error);
      throw new Error(error.message || 'Failed to fetch orders');
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status');
      }

      return { success: true };
    } catch (error) {
      console.error('Update order status error:', error);
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId, paymentStatus, paymentData = {}) {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus, ...paymentData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update payment status');
      }

      return { success: true };
    } catch (error) {
      console.error('Update payment status error:', error);
      throw new Error(error.message || 'Failed to update payment status');
    }
  }

  // Cancel order
  async cancelOrder(orderId, reason = '') {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }

      return { success: true };
    } catch (error) {
      console.error('Cancel order error:', error);
      throw new Error(error.message || 'Failed to cancel order');
    }
  }

  // Get order statistics (Admin only)
  async getOrderStatistics(period = 'month') {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/orders/statistics?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch order statistics');
      }

      const data = await response.json();
      return {
        success: true,
        statistics: data.statistics
      };
    } catch (error) {
      console.error('Get order statistics error:', error);
      throw new Error(error.message || 'Failed to fetch order statistics');
    }
  }

  // Search orders by customer email or order number
  async searchOrders(searchTerm) {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams({ search: searchTerm });

      const response = await fetch(`${API_BASE_URL}/orders/search?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search orders');
      }

      const data = await response.json();
      return {
        success: true,
        orders: data.orders
      };
    } catch (error) {
      console.error('Search orders error:', error);
      throw new Error(error.message || 'Failed to search orders');
    }
  }
}

export default new OrderService();
