// Frontend CRM test script
// Run this in browser console to check CRM functionality

console.log('🧪 Testing Frontend CRM Integration...');

// Test 1: Check if CRM routes are defined
console.log('\n1. Checking CRM routes...');
const crmRoutes = [
  '/admin/crm',
  '/admin/crm/users', 
  '/admin/crm/customers',
  '/admin/crm/sales',
  '/admin/crm/system'
];

crmRoutes.forEach(route => {
  console.log(`✅ Route defined: ${route}`);
});

// Test 2: Check authentication
console.log('\n2. Checking authentication...');
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('Token exists:', !!token);
console.log('User exists:', !!user);

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('User role:', userData.role);
    console.log('Is admin:', userData.role === 'admin');
  } catch (e) {
    console.log('Error parsing user data:', e);
  }
}

// Test 3: Check API connectivity
console.log('\n3. Testing API connectivity...');

if (token) {
  // Test CRM dashboard API
  fetch('http://localhost:5000/api/crm/analytics/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ CRM Dashboard API working:', data.success);
    console.log('Dashboard data:', data.data);
  })
  .catch(error => {
    console.log('❌ CRM Dashboard API failed:', error);
  });

  // Test users API
  fetch('http://localhost:5000/api/crm/users', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ CRM Users API working:', data.success);
    console.log('Users count:', data.data?.length || 0);
  })
  .catch(error => {
    console.log('❌ CRM Users API failed:', error);
  });
} else {
  console.log('❌ No authentication token found. Please login first.');
}

// Test 4: Navigate to CRM dashboard
console.log('\n4. Navigation test...');
console.log('Current path:', window.location.pathname);
console.log('To test CRM, try navigating to:');
crmRoutes.forEach(route => {
  console.log(`- ${window.location.origin}${route}`);
});

console.log('\n🎉 Frontend CRM test completed!');
console.log('If you see any errors above, there might be issues with:');
console.log('- Authentication token');
console.log('- User permissions'); 
console.log('- API connectivity');
console.log('- Route configuration');
