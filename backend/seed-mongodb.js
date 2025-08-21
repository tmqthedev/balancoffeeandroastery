const mongoose = require('mongoose');
const path = require('path');

// Import models
const Category = require('../backend/models/Category');
const Product = require('../backend/models/Product');
const Blog = require('../backend/models/Blog');
const Setting = require('../backend/models/Setting');
const { ShippingZone } = require('../backend/models/Setting');

// Import seed data
const {
  SAMPLE_CATEGORIES,
  SAMPLE_PRODUCTS,
  SAMPLE_BLOGS,
  SAMPLE_SETTINGS,
  SAMPLE_SHIPPING_ZONES
} = require('./mongodb-seed-data.js');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/balancoffee');
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

async function seedMongoDB() {
  try {
    console.log('🌱 Starting MongoDB seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Blog.deleteMany({});
    await Setting.deleteMany({});
    await ShippingZone.deleteMany({});
    console.log('✅ Existing data cleared');

    // Seed Categories
    console.log('📁 Seeding categories...');
    await Category.insertMany(SAMPLE_CATEGORIES);
    console.log(`✅ Seeded ${SAMPLE_CATEGORIES.length} categories`);

    // Seed Products
    console.log('📦 Seeding products...');
    await Product.insertMany(SAMPLE_PRODUCTS);
    console.log(`✅ Seeded ${SAMPLE_PRODUCTS.length} products`);

    // Seed Blogs
    console.log('📝 Seeding blogs...');
    await Blog.insertMany(SAMPLE_BLOGS);
    console.log(`✅ Seeded ${SAMPLE_BLOGS.length} blog posts`);

    // Seed Settings
    console.log('⚙️ Seeding settings...');
    await Setting.insertMany(SAMPLE_SETTINGS);
    console.log(`✅ Seeded ${SAMPLE_SETTINGS.length} settings`);

    // Seed Shipping Zones
    console.log('🚚 Seeding shipping zones...');
    await ShippingZone.insertMany(SAMPLE_SHIPPING_ZONES);
    console.log(`✅ Seeded ${SAMPLE_SHIPPING_ZONES.length} shipping zones`);

    console.log('🎉 MongoDB seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Categories: ${SAMPLE_CATEGORIES.length}`);
    console.log(`- Products: ${SAMPLE_PRODUCTS.length}`);
    console.log(`- Blog posts: ${SAMPLE_BLOGS.length}`);
    console.log(`- Settings: ${SAMPLE_SETTINGS.length}`);
    console.log(`- Shipping zones: ${SAMPLE_SHIPPING_ZONES.length}`);

  } catch (error) {
    console.error('❌ Error seeding MongoDB:', error);
    process.exit(1);
  }
}

// Run the seeding function if this file is executed directly
if (require.main === module) {
  connectDB()
    .then(() => seedMongoDB())
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedMongoDB, connectDB };
