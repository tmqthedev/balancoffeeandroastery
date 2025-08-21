const mongoose = require('mongoose');
const Product = require('./models/Product');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://balancoffeeandroastery:Balan00113355.@balancoffee.ah4nfkp.mongodb.net/balancoffee?retryWrites=true&w=majority&appName=balancoffee', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for weight pricing update');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Weight pricing data for each product
const weightPricingData = {
  'arabica-cau-dat': {
    '100g': 120000,
    '250g': 280000,
    '500g': 520000,
    '1kg': 980000
  },
  'robusta-lam-dong': {
    '100g': 95000,
    '250g': 220000,
    '500g': 410000,
    '1kg': 780000
  },
  'arabica-cau-dat-premium': {
    '100g': 120000,
    '250g': 280000,
    '500g': 520000,
    '1kg': 980000
  },
  'robusta-lam-dong-dac-biet': {
    '100g': 95000,
    '250g': 220000,
    '500g': 410000,
    '1kg': 780000
  }
};

const updateWeightPricing = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Starting weight pricing update...');
    
    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      console.log(`\n📝 Processing: ${product.name} (${product.slug})`);
      
      // Check if we have pricing data for this product
      if (weightPricingData[product.slug]) {
        const pricing = weightPricingData[product.slug];
        
        // Update the product with weight pricing
        await Product.findByIdAndUpdate(
          product._id,
          { 
            $set: { 
              weightPricing: pricing 
            }
          },
          { new: true }
        );
        
        console.log(`✅ Updated ${product.name} with weight pricing:`);
        console.log(`   • 100g: ${pricing['100g'].toLocaleString()}đ`);
        console.log(`   • 250g: ${pricing['250g'].toLocaleString()}đ`);
        console.log(`   • 500g: ${pricing['500g'].toLocaleString()}đ`);
        console.log(`   • 1kg: ${pricing['1kg'].toLocaleString()}đ`);
        
        updatedCount++;
      } else {
        console.log(`⚠️  No pricing data found for ${product.name}`);
        
        // Set default pricing based on current price
        const basePrice = product.price || 280000;
        const defaultPricing = {
          '100g': Math.round(basePrice * 0.43),
          '250g': basePrice,
          '500g': Math.round(basePrice * 1.86),
          '1kg': Math.round(basePrice * 3.5)
        };
        
        await Product.findByIdAndUpdate(
          product._id,
          { 
            $set: { 
              weightPricing: defaultPricing 
            }
          },
          { new: true }
        );
        
        console.log(`✅ Set default pricing for ${product.name}:`);
        console.log(`   • 100g: ${defaultPricing['100g'].toLocaleString()}đ`);
        console.log(`   • 250g: ${defaultPricing['250g'].toLocaleString()}đ`);
        console.log(`   • 500g: ${defaultPricing['500g'].toLocaleString()}đ`);
        console.log(`   • 1kg: ${defaultPricing['1kg'].toLocaleString()}đ`);
        
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Weight pricing update completed!`);
    console.log(`📊 Summary:`);
    console.log(`   • Total products: ${products.length}`);
    console.log(`   • Updated products: ${updatedCount}`);
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const updatedProducts = await Product.find({}).select('name slug weightPricing');
    
    for (const product of updatedProducts) {
      if (product.weightPricing) {
        console.log(`✓ ${product.name}: Weight pricing available`);
      } else {
        console.log(`✗ ${product.name}: No weight pricing`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating weight pricing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    process.exit(0);
  }
};

// Run the update
updateWeightPricing();
