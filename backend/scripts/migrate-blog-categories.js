const mongoose = require('mongoose');
require('../config/database');

const migrateBlogCategories = async () => {
  try {
    console.log('🔄 Starting blog category migration...');

    // Wait for mongoose connection
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        mongoose.connection.once('connected', resolve);
        mongoose.connection.once('error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 10000);
      });
    }

    console.log('✅ Connected to database');

    const db = mongoose.connection.db;
    const blogsCollection = db.collection('blogs');

    // Find all blogs with object categories
    const blogsWithObjectCategories = await blogsCollection.find({
      category: { $type: 'object' }
    }).toArray();

    console.log(`📊 Found ${blogsWithObjectCategories.length} blogs with object categories`);

    // Update each blog
    for (const blog of blogsWithObjectCategories) {
      let newCategory = 'Tin tức'; // Default category

      if (blog.category && blog.category.name) {
        newCategory = blog.category.name;
      }

      await blogsCollection.updateOne(
        { _id: blog._id },
        { $set: { category: newCategory } }
      );

      console.log(`✅ Updated blog: ${blog.title || blog._id} - Category: ${newCategory}`);
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
setTimeout(migrateBlogCategories, 3000);
