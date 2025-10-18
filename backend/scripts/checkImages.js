const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkImages() {
  try {
    const products = await Product.find({}).limit(5).lean();
    
    console.log('=== CHECKING PRODUCT IMAGES ===');
    products.forEach(product => {
      console.log(`\nProduct: ${product.name}`);
      console.log(`Image URL: ${product.image}`);
      console.log(`Is Cloudinary URL: ${product.image?.includes('cloudinary')}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkImages();
