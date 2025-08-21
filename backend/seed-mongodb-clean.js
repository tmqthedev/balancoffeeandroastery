const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Category = require('./models/Category');
const Product = require('./models/Product');

// Import seed data
const { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } = require('./seed-data.js');

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://tmqthedev:TmqthedevDB123456789@balancoffee.ah4nfkp.mongodb.net/balancoffee?retryWrites=true&w=majority';
    await mongoose.connect(mongoURI);
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
    console.log('✅ Existing data cleared');

    // Seed Categories
    console.log('📁 Seeding categories...');
    await Category.insertMany(SAMPLE_CATEGORIES);
    console.log(`✅ Seeded ${SAMPLE_CATEGORIES.length} categories`);

    // Seed Products
    console.log('📦 Seeding products...');
    await Product.insertMany(SAMPLE_PRODUCTS);
    console.log(`✅ Seeded ${SAMPLE_PRODUCTS.length} products`);

    console.log('🎉 MongoDB seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Categories: ${SAMPLE_CATEGORIES.length}`);
    console.log(`- Products: ${SAMPLE_PRODUCTS.length}`);

  } catch (error) {
    console.error('❌ Error seeding MongoDB:', error);
    throw error;
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

module.exports = { connectDB, seedMongoDB };
