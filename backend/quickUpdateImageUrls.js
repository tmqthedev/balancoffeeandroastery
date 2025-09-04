const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function updateImageUrls() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/balancoffee');

        console.log('Connected to MongoDB');

        // Update all products that have src/assets/products/ in their image_url
        const result = await Product.updateMany(
            { image_url: { $regex: 'src/assets/products/' } },
            [
                {
                    $set: {
                        image_url: {
                            $concat: [
                                '/uploads/products/',
                                { $arrayElemAt: [{ $split: ['$image_url', '/'] }, -1] }
                            ]
                        }
                    }
                }
            ]
        );

        console.log(`Updated ${result.modifiedCount} products`);

        // Verify the update
        const updatedProducts = await Product.find({}, 'name image_url');
        console.log('Updated products:');
        updatedProducts.forEach(product => {
            console.log(`- ${product.name}: ${product.image_url}`);
        });

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
