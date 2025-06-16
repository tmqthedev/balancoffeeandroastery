import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

const AdminDebugInfo = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const info = {
      isAuthenticated,
      user: user ? {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      } : null,
      currentPath: window.location.pathname,
      localStorage: {
        token: localStorage.getItem('token') ? 'exists' : 'missing',
        user: localStorage.getItem('user') ? 'exists' : 'missing'
      }
    };
    
    setDebugInfo(JSON.stringify(info, null, 2));
  }, [user, isAuthenticated]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md z-50">
      <div className="font-bold">Admin Debug Info:</div>
      <pre className="text-xs mt-2 overflow-auto max-h-40">
        {debugInfo}
      </pre>
      <div className="mt-2 text-sm">
        <p><strong>CRM Links:</strong></p>
        <ul className="list-disc ml-4">
          <li><a href="/admin/crm" className="text-blue-600 hover:underline">CRM Dashboard</a></li>
          <li><a href="/admin/crm/users" className="text-blue-600 hover:underline">User Management</a></li>
          <li><a href="/admin/crm/customers" className="text-blue-600 hover:underline">Customer Management</a></li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDebugInfo;
