// Test script to verify blog API endpoints
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

async function testBlogAPIs() {
  console.log('🧪 Testing Blog API endpoints...\n');

  try {
    // Test 1: Blog Categories
    console.log('1. Testing /api/blogs/categories');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/api/blogs/categories`);
    console.log('✅ Categories API:', JSON.stringify(categoriesResponse.data, null, 2));
    console.log(`   Found ${categoriesResponse.data.length} categories\n`);

    // Test 2: Blog List
    console.log('2. Testing /api/blogs (list)');
    const blogsResponse = await axios.get(`${API_BASE_URL}/api/blogs?limit=3&lang=vi`);
    console.log('✅ Blogs API:', JSON.stringify(blogsResponse.data, null, 2));
    console.log(`   Found ${blogsResponse.data.blogs?.length || 0} blogs`);
    console.log(`   Total pages: ${blogsResponse.data.pagination?.totalPages || 0}\n`);

    // Test 3: Blog by Slug (if blogs exist)
    if (blogsResponse.data.blogs && blogsResponse.data.blogs.length > 0) {
      const firstBlogSlug = blogsResponse.data.blogs[0].slug;
      console.log(`3. Testing /api/blogs/${firstBlogSlug} (single blog)`);
      
      try {
        const singleBlogResponse = await axios.get(`${API_BASE_URL}/api/blogs/${firstBlogSlug}?lang=vi`);
        console.log('✅ Single Blog API:', {
          id: singleBlogResponse.data.id,
          title: singleBlogResponse.data.title,
          slug: singleBlogResponse.data.slug,
          hasContent: !!singleBlogResponse.data.content,
          relatedPostsCount: singleBlogResponse.data.relatedPosts?.length || 0
        });
      } catch (error) {
        console.log('⚠️ Single Blog API error:', error.response?.data?.error || error.message);
      }
    }

    console.log('\n🎉 All Blog API tests completed successfully!');
  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
  }
}

testBlogAPIs();
