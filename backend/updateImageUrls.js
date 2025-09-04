const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function updateImageUrls() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/balancoffee', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Find all products with image_url
        const products = await Product.find({ image_url: { $exists: true, $ne: null } });

        console.log(`Found ${products.length} products with images`);

        for (const product of products) {
            let newImageUrl = product.image_url;

            // If image_url contains src/assets/products, update to /uploads/products
            if (product.image_url.includes('src/assets/products/') ||
                product.image_url.includes('/assets/products/') ||
                product.image_url.includes('/uploads/products/')) {

                const filename = product.image_url.split('/').pop();
                newImageUrl = `/uploads/products/${filename}`;

                console.log(`Updating ${product.name}: ${product.image_url} -> ${newImageUrl}`);
            }
            // If image_url is just filename, add full path
            else if (!product.image_url.startsWith('/uploads/') &&
                     !product.image_url.startsWith('http')) {

                const filename = product.image_url.split('/').pop();
                newImageUrl = `/uploads/products/${filename}`;

                console.log(`Updating ${product.name}: ${product.image_url} -> ${newImageUrl}`);
            }

            // Update the product
            if (newImageUrl !== product.image_url) {
                await Product.updateOne(
                    { _id: product._id },
                    { $set: { image_url: newImageUrl } }
                );
            }
        }

        console.log('Image URL update completed');

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');

    } catch (error) {
        console.error('Error updating image URLs:', error);
        process.exit(1);
    }
}

// Run the update
updateImageUrls();
