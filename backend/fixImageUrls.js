const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function fixImageUrls() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/balancoffee');

        console.log('Connected to MongoDB');

        // Fix image_url field
        await Product.updateMany(
            { image_url: { $regex: '^backend/' } },
            [
                {
                    $set: {
                        image_url: {
                            $substr: ['$image_url', 7, -1] // Remove 'backend' prefix
                        }
                    }
                }
            ]
        );

        // Fix thumbnail field
        await Product.updateMany(
            { thumbnail: { $regex: '^backend/' } },
            [
                {
                    $set: {
                        thumbnail: {
                            $substr: ['$thumbnail', 7, -1] // Remove 'backend' prefix
                        }
                    }
                }
            ]
        );

        // Fix images array
        const products = await Product.find({});
        for (const product of products) {
            if (product.images && product.images.length > 0) {
                const updatedImages = product.images.map(image => {
                    if (image.url && image.url.startsWith('backend/')) {
                        return {
                            ...image.toObject(),
                            url: image.url.substring(7) // Remove 'backend' prefix
                        };
                    }
                    return image;
                });
                
                await Product.updateOne(
                    { _id: product._id },
                    { $set: { images: updatedImages } }
                );
            }
        }

        console.log('Fixed image URLs');

        // Verify the fix
        const updatedProducts = await Product.find({}, 'name image_url thumbnail images');
        updatedProducts.forEach(product => {
            console.log(`\n📦 ${product.name}:`);
            console.log(`  - image_url: ${product.image_url}`);
            console.log(`  - thumbnail: ${product.thumbnail}`);
            if (product.images && product.images.length > 0) {
                console.log(`  - images[0].url: ${product.images[0].url}`);
            }
        });

        await mongoose.connection.close();
        console.log('✅ Database fix completed');

    } catch (error) {
        console.error('❌ Error fixing image URLs:', error);
        process.exit(1);
    }
}

fixImageUrls();
