// backend/models/seller/SellerProfile.js
const mongoose = require("mongoose");

const sellerProfileSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", unique: true, required: true },
    storeName: String,
    logo: String,
    bio: String,
    policies: {
      returnPolicy: String,
      shippingPolicy: String,
      supportEmail: String,
    },
    shippingOptions: [
      { name: String, cost: Number, estimatedDays: Number, active: { type: Boolean, default: true } }
    ],
    notificationPrefs: {
      orderEmails: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },
    payout: {
      method: { type: String, enum: ["bank", "paypal", "stripe"], default: "bank" },
      accountHolder: String,
      accountNumber: String,
      ifscOrSwift: String,
      paypalEmail: String,
      stripeAccountId: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellerProfile", sellerProfileSchema, "SellerProfile");
