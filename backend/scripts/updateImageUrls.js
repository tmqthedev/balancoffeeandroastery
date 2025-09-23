const mongoose = require('mongoose');
require('dotenv').config();

async function updateImageUrls() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Product = require('../models/Product');

    // Update all products with /assets/ paths to /images/ paths
    const products = await Product.find({ image_url: { $regex: '^/assets/' } });

    console.log('📦 Found', products.length, 'products to update');

    for (const product of products) {
      product.image_url = product.image_url.replace('/assets/', '/images/');
      await product.save();
    }

    console.log('✅ Updated', products.length, 'product image URLs');

    // Also update images array if it exists
    const productsWithImages = await Product.find({ 'images.url': { $regex: '^/assets/' } });

    for (const product of productsWithImages) {
      if (product.images && product.images.length > 0) {
        product.images = product.images.map(img => ({
          ...img,
          url: img.url.replace('/assets/', '/images/')
        }));
        await product.save();
      }
    }

    console.log('✅ Updated', productsWithImages.length, 'product images array URLs');

    // Check a sample product
    const sampleProduct = await Product.findOne().select('name image_url images');
    if (sampleProduct) {
      console.log('📦 Sample product:', {
        name: sampleProduct.name,
        image_url: sampleProduct.image_url,
        images: sampleProduct.images?.slice(0, 1)
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

updateImageUrls();