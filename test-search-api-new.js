import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Test functions
async function testSearchSuggestions() {
    console.log('🔍 Testing Search Suggestions API...');
    
    try {
        const response = await axios.get(`${API_BASE_URL}/api/products/search-suggestions`, {
            params: { q: 'arabica' }
        });
        
        console.log('✅ Search Suggestions Response:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Search Suggestions Error:', error.message);
        return false;
    }
}

async function testProductsSearch() {
    console.log('📦 Testing Products Search API...');
    
    try {
        const response = await axios.get(`${API_BASE_URL}/api/products`, {
            params: { 
                search: 'arabica',
                sortBy: 'relevance',
                page: 1,
                limit: 12
            }
        });
        
        console.log('✅ Products Search Response:', {
            total: response.data.total,
            productsCount: response.data.products?.length,
            firstProduct: response.data.products?.[0]?.name
        });
        return true;
    } catch (error) {
        console.error('❌ Products Search Error:', error.message);
        return false;
    }
}

async function testHealthCheck() {
    console.log('🏥 Testing Server Health...');
    
    try {
        await axios.get(`${API_BASE_URL}/`);
        console.log('✅ Server responding');
        return true;
    } catch (error) {
        console.error('❌ Server Health Error:', error.message);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting API Tests for Search Features\n');
    
    const results = {};
    
    results.health = await testHealthCheck();
    console.log('');
    
    if (results.health) {
        results.suggestions = await testSearchSuggestions();
        console.log('');
        
        results.search = await testProductsSearch();
        console.log('');
    }
    
    // Summary
    console.log('📊 Test Results Summary:');
    console.log('========================');
    console.log(`Server Health: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Search Suggestions: ${results.suggestions ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Products Search: ${results.search ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = Object.values(results).every(Boolean);
    console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
        console.log('\n🎉 Search features are working correctly!');
        console.log('You can now test the frontend at: http://localhost:3000/products');
    } else {
        console.log('\n🔧 Please check the backend server and database connection.');
    }
}

// Run tests
runTests().catch(console.error);
