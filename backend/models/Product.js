const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: false,  // 👈 Changed from true → false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
