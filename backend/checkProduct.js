const mongoose = require('mongoose');
const Product = require('./models/Product');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://tmqthedev:tmqthedev@cluster0.3q9qk.mongodb.net/balancoffee?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkProduct = async () => {
  try {
    const productId = '68b2c4a67fc109797b6f219a';
    console.log('Checking product with ID:', productId);

    const product = await Product.findById(productId);
    console.log('Product found:', product);

    if (product) {
      console.log('Product details:');
      console.log('- Name:', product.name);
      console.log('- Price:', product.price);
      console.log('- Image URL:', product.image_url);
    } else {
      console.log('Product not found!');
    }

    // Also try find all products
    const allProducts = await Product.find({});
    console.log('Total products in DB:', allProducts.length);
    allProducts.forEach(p => {
      console.log(`- ${p._id}: ${p.name} (${p.price} VND)`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(checkProduct);