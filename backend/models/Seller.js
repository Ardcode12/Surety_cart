const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false }, // Add this field
  address: { type: String }, // Optional
  description: { type: String }, // Optional
}, { collection: "Seller", timestamps: true });

module.exports = mongoose.model("Seller", sellerSchema);
