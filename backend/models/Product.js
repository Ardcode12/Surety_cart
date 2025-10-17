const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'] },
    price: { type: Number, required: [true, 'Price is required'] },
    originalPrice: { type: Number },
    discount: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    category: { type: String },
    brand: { type: String },
    description: { type: String },
    image: { type: String, required: [true, 'Image is required'] },
    imagePublicId: { type: String }, // Cloudinary public_id for deletion
    seller: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Seller', 
      required: true 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
