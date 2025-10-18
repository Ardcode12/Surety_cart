const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

async function fixImageUrls() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({
      image: { $regex: /^\/uploads\// }
    });

    console.log(`Found ${products.length} products with local image paths`);

    for (const product of products) {
      // Convert local path to full URL
      const baseUrl = 'https://surety-cart.onrender.com';
      product.image = `${baseUrl}${product.image}`;
      await product.save();
      console.log(`Updated product ${product.name}: ${product.image}`);
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

fixImageUrls();
