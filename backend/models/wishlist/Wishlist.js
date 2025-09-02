// backend/models/wishlist/Wishlist.js
const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const wishlistSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", unique: true, required: true },
    items: { type: [wishlistItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema, "Wishlist");
