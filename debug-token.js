// DEBUG TOKEN UTILITY
// Paste this in browser console on Orders page to check token

console.log('=== TOKEN DEBUG ===');

const token = localStorage.getItem('authToken');
console.log('1. Token exists:', !!token);

if (token) {
  console.log('2. Token length:', token.length);
  
  // Decode JWT (without verification)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('3. Token payload:', payload);
      console.log('4. User ID:', payload.userId);
      console.log('5. Email:', payload.email);
      console.log('6. Issued at:', new Date(payload.iat * 1000).toLocaleString());
      console.log('7. Expires at:', new Date(payload.exp * 1000).toLocaleString());
      console.log('8. Is expired:', Date.now() > payload.exp * 1000);
    } else {
      console.log('❌ Invalid token format');
    }
  } catch (e) {
    console.log('❌ Error decoding token:', e.message);
  }
} else {
  console.log('❌ No token found - please login');
}

// Test API call
console.log('\n=== TESTING API CALL ===');
fetch('/api/orders', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => {
    console.log('API Response status:', res.status);
    return res.json();
  })
  .then(data => console.log('API Response data:', data))
  .catch(err => console.log('API Error:', err));
