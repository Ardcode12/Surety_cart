const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

async function updateProductImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    for (const product of products) {
      console.log(`\nProduct: ${product.name}`);
      console.log(`Current image: ${product.image}`);
      
      // Check if it's a Cloudinary URL
      if (product.image && product.image.includes('cloudinary')) {
        console.log('✓ Already using Cloudinary');
      } else {
        console.log('✗ Using local path - needs update');
        // You might need to re-upload to Cloudinary here
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

updateProductImages();
