import api from './apiClient';

class OrderService {
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    const order = response.data.order || response.data.data || response.data;

    return {
      success: true,
      orderId: order.id || order._id,
      orderNumber: order.orderNumber,
      order
    };
  }

  async getOrderById(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return {
      success: true,
      order: response.data.order || response.data.data
    };
  }

  async getOrderByNumber(orderNumber) {
    const response = await api.get(`/orders/${orderNumber}`);
    return {
      success: true,
      order: response.data.order || response.data.data
    };
  }

  async getUserOrders(_userId, options = {}) {
    const params = new URLSearchParams();
    if (options.limitCount) params.append('limit', options.limitCount);
    if (options.status) params.append('status', options.status);

    const response = await api.get(`/orders?${params}`);
    return {
      success: true,
      orders: response.data.data?.orders || response.data.orders || []
    };
  }

  async getAllOrders(options = {}) {
    const params = new URLSearchParams();
    if (options.limitCount) params.append('limit', options.limitCount);
    if (options.status) params.append('status', options.status);
    if (options.paymentStatus) params.append('paymentStatus', options.paymentStatus);
    if (options.startDate) params.append('startDate', options.startDate.toISOString());
    if (options.endDate) params.append('endDate', options.endDate.toISOString());

    const response = await api.get(`/orders?${params}`);
    return {
      success: true,
      orders: response.data.data?.orders || response.data.orders || [],
      total: response.data.data?.pagination?.total || response.data.total
    };
  }

  async updateOrderStatus(orderId, status, notes = '') {
    await api.put(`/orders/${orderId}/status`, { status, notes });
    return { success: true };
  }

  async updatePaymentStatus(orderId, paymentStatus, paymentData = {}) {
    await api.put(`/orders/${orderId}/payment`, { paymentStatus, ...paymentData });
    return { success: true };
  }

  async cancelOrder(orderId, reason = '') {
    await api.put(`/orders/${orderId}/cancel`, { reason });
    return { success: true };
  }

  async getOrderStatistics(period = 'month') {
    const response = await api.get(`/orders/statistics?period=${period}`);
    return {
      success: true,
      statistics: response.data.statistics
    };
  }

  async searchOrders(searchTerm) {
    const params = new URLSearchParams({ search: searchTerm });
    const response = await api.get(`/orders/search?${params}`);
    return {
      success: true,
      orders: response.data.orders || []
    };
  }
}

export default new OrderService();
