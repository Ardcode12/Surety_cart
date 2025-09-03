// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'] },
    price: { type: Number, required: [true, 'Price is required'] },
    originalPrice: { type: Number },
    discount: { type: Number, default: 0 }, // percent
    quantity: { type: Number, default: 0 },
    category: { type: String },
    brand: { type: String },
    description: { type: String },
    image: { type: String, required: [true, 'Image is required'] },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
