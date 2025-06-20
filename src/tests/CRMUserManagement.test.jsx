/* eslint-env vitest */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CRMUserManagement from '../pages/admin/CRMUserManagement.jsx';
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

describe('CRM User Management Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders user management interface', async () => {
    const mockUsers = [
      {
        id: 1,
        username: 'user1',
        email: 'user1@test.com',
        role: 'customer',
        status: 'active',
        created_at: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        username: 'user2',
        email: 'user2@test.com',
        role: 'admin',
        status: 'active',
        created_at: '2024-01-02T00:00:00.000Z'
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { users: mockUsers, total: 2 }
      })
    });

    renderWithContext(<CRMUserManagement />);

    expect(screen.getByText('Quản lý người dùng')).toBeInTheDocument();
    expect(screen.getByText('Thêm người dùng mới')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('user1@test.com')).toBeInTheDocument();
      expect(screen.getByText('user2@test.com')).toBeInTheDocument();
    });
  });

  it('can search users', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { users: [], total: 0 }
      })
    });

    renderWithContext(<CRMUserManagement />);

    const searchInput = screen.getByPlaceholderText('Tìm kiếm theo email, tên...');
    fireEvent.change(searchInput, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/crm/users?'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      );
    });
  });

  it('shows create user form when add button is clicked', () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { users: [], total: 0 }
      })
    });

    renderWithContext(<CRMUserManagement />);

    const addButton = screen.getByText('Thêm người dùng mới');
    fireEvent.click(addButton);

    expect(screen.getByText('Tạo người dùng mới')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithContext(<CRMUserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Lỗi khi tải dữ liệu người dùng')).toBeInTheDocument();
    });
  });
});
