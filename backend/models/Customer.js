const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String }, // Add this line
  password: { type: String, required: true }
}, { collection: "Customer", timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
