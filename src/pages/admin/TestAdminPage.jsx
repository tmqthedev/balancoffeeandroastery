import React from 'react';

const TestAdminPage = () => {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1>🎉 Admin Route Test - SUCCESS!</h1>
      <p>Nếu bạn thấy trang này, có nghĩa là admin routing đã hoạt động!</p>
      
      <div style={{ marginTop: '20px', padding: '15px', background: 'white', border: '1px solid #ddd' }}>
        <h2>📋 Test Status:</h2>
        <ul>
          <li>✅ AdminRoutes được mount thành công</li>
          <li>✅ AdminLayout đang hoạt động</li>
          <li>✅ Import paths đã được sửa</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>🔗 CRM Links to Test:</h2>
        <ul>
          <li><a href="/admin/crm">CRM Dashboard</a></li>
          <li><a href="/admin/crm/users">User Management</a></li>
          <li><a href="/admin/crm/customers">Customer Management</a></li>
          <li><a href="/admin/crm/sales">Sales Management</a></li>
          <li><a href="/admin/crm/system">System Config</a></li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', border: '1px solid #ffeaa7' }}>
        <h3>📝 Next Steps:</h3>
        <p>1. Đăng nhập với admin account (nếu chưa)</p>
        <p>2. Test từng CRM link ở trên</p>
        <p>3. Kiểm tra sidebar CRM menu</p>
      </div>
    </div>
  );
};

export default TestAdminPage;
