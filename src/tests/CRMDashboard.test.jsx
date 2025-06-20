/* eslint-env vitest */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CRMDashboard from '../pages/admin/CRMDashboard.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

// Mock fetch API
globalThis.fetch = vi.fn();

const mockAuthContext = {
  user: {
    id: 1,
    username: 'admin',
    email: 'admin@test.com',
    role: 'admin'
  },
  isAuthenticated: true,
  token: 'mock-token'
};

const renderWithContext = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('CRM Dashboard Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders dashboard title', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          totalUsers: 100,
          totalCustomers: 50,
          totalOrders: 200,
          totalRevenue: 1000000,
          newCustomersToday: 5,
          ordersToday: 10,
          revenueToday: 50000,
          activeTickets: 3
        }
      })
    });

    renderWithContext(<CRMDashboard />);
    
    expect(screen.getByText('CRM Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tổng quan hệ thống quản lý khách hàng')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithContext(<CRMDashboard />);
    
    expect(screen.getByText('Đang tải...')).toBeInTheDocument();
  });

  it('displays metrics when data is loaded', async () => {
    const mockData = {
      totalUsers: 100,
      totalCustomers: 50,
      totalOrders: 200,
      totalRevenue: 1000000,
      newCustomersToday: 5,
      ordersToday: 10,
      revenueToday: 50000,
      activeTickets: 3
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockData
      })
    });

    renderWithContext(<CRMDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Tổng người dùng')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Tổng khách hàng')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'));

    renderWithContext(<CRMDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Lỗi khi tải dữ liệu')).toBeInTheDocument();
    });
  });
});
