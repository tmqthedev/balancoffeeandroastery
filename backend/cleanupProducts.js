const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function cleanupAndUpdateProducts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/balancoffee');

        console.log('Connected to MongoDB');

        // Get all products
        const products = await Product.find({});
        console.log(`Found ${products.length} products to update`);

        for (const product of products) {
            let updated = false;
            const updates = {};

            // 1. Update image_url if needed (already done but double check)
            if (product.image_url && product.image_url.includes('src/assets/products/')) {
                const filename = product.image_url.split('/').pop();
                updates.image_url = `/uploads/products/${filename}`;
                updated = true;
                console.log(`Updating image_url for ${product.name}: ${updates.image_url}`);
            }

            // 2. Update thumbnail
            if (product.thumbnail && product.thumbnail.includes('src/assets/products/')) {
                const filename = product.thumbnail.split('/').pop();
                updates.thumbnail = `/uploads/products/${filename}`;
                updated = true;
                console.log(`Updating thumbnail for ${product.name}: ${updates.thumbnail}`);
            }

            // 3. Update images array URLs
            if (product.images && product.images.length > 0) {
                const updatedImages = product.images.map(image => {
                    if (image.url && image.url.includes('src/assets/products/')) {
                        const filename = image.url.split('/').pop();
                        return {
                            ...image.toObject(),
                            url: `/uploads/products/${filename}`
                        };
                    }
                    return image;
                });
                updates.images = updatedImages;
                updated = true;
                console.log(`Updating images array for ${product.name}`);
            }

            // 4. Remove unnecessary fields for cleaner data
            const fieldsToUnset = {};

            // Remove old price field if it's weight-based pricing
            if (product.pricingType === 'weight-based' && product.price !== undefined) {
                fieldsToUnset.price = "";
                console.log(`Removing redundant price field for weight-based product: ${product.name}`);
            }

            // Remove stockQuantity for weight-based products (stock is in weightPricing)
            if (product.pricingType === 'weight-based' && product.stockQuantity !== undefined) {
                fieldsToUnset.stockQuantity = "";
                console.log(`Removing redundant stockQuantity for weight-based product: ${product.name}`);
            }

            // Apply updates
            if (updated || Object.keys(fieldsToUnset).length > 0) {
                const updateOperation = {};
                if (Object.keys(updates).length > 0) {
                    updateOperation.$set = updates;
                }
                if (Object.keys(fieldsToUnset).length > 0) {
                    updateOperation.$unset = fieldsToUnset;
                }

                await Product.updateOne({ _id: product._id }, updateOperation);
                console.log(`✅ Updated product: ${product.name}`);
            }
        }

        // Verify the updates
        console.log('\n📋 Verification - Updated products:');
        const updatedProducts = await Product.find({}, 'name image_url thumbnail images pricingType price stockQuantity');
        
        updatedProducts.forEach(product => {
            console.log(`\n📦 ${product.name}:`);
            console.log(`  - image_url: ${product.image_url}`);
            console.log(`  - thumbnail: ${product.thumbnail}`);
            if (product.images && product.images.length > 0) {
                console.log(`  - images[0].url: ${product.images[0].url}`);
            }
            console.log(`  - pricingType: ${product.pricingType}`);
            if (product.pricingType === 'weight-based') {
                console.log(`  - price: ${product.price} (should be undefined)`);
                console.log(`  - stockQuantity: ${product.stockQuantity} (should be undefined)`);
            }
        });

        // Close connection
        await mongoose.connection.close();
        console.log('\n✅ Database cleanup completed');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

// Run the cleanup
cleanupAndUpdateProducts();
