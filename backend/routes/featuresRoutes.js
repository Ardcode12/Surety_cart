// backend/routes/featuresRoutes.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Wishlist = require("../models/wishlist/Wishlist");
const SellerProfile = require("../models/seller/SellerProfile");
const { protectCustomer, protectSeller } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   Helpers
   ========================= */

// Normalize any stored image path to a web-safe path like: /uploads/<filename>
const toWebUploadPath = (p) => {
  if (!p) return null;
  try {
    const clean = String(p).replace(/\\/g, "/"); // fix Windows backslashes
    const filename = path.basename(clean); // just the file name
    return `/uploads/${filename}`;
  } catch {
    return null;
  }
};

const shapeProduct = (p) => ({
  _id: p._id,
  name: p.name,
  price: p.price,
  image: toWebUploadPath(p.image), // always normalize to /uploads/<file>
  seller: p.seller || null,
});

/* =========================
   Multer for profile logo
   ========================= */
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `image-${Date.now()}${ext || ".jpg"}`);
  },
});
const upload = multer({ storage });

/* =========================
   CART
   ========================= */

// GET /api/features/cart
router.get("/cart", protectCustomer, async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.customer._id }).lean();
    if (!cart || !cart.items.length) return res.json([]);

    const ids = cart.items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: ids } }).lean();
    const map = Object.fromEntries(products.map((p) => [p._id.toString(), shapeProduct(p)]));

    const items = cart.items
      .filter((i) => map[i.product.toString()])
      .map((i) => ({
        product: map[i.product.toString()],
        quantity: i.qty,
      }));

    res.json(items);
  } catch (err) {
    console.error("GET /cart error:", err);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

// POST /api/features/cart  { productId, quantity }
router.post("/cart", protectCustomer, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: "productId is required" });

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ customer: req.customer._id });
    if (!cart) cart = new Cart({ customer: req.customer._id, items: [] });

    const idx = cart.items.findIndex((i) => i.product.toString() === productId);
    if (idx > -1) {
      cart.items[idx].qty += Number(quantity);
    } else {
      cart.items.push({ product: product._id, qty: Number(quantity) });
    }

    await cart.save();
    res.status(201).json({ message: "Added to cart" });
  } catch (err) {
    console.error("POST /cart error:", err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

// DELETE /api/features/cart/:productId
router.delete("/cart/:productId", protectCustomer, async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ customer: req.customer._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error("DELETE /cart/:productId error:", err);
    res.status(500).json({ message: "Failed to remove item" });
  }
});

// DELETE /api/features/cart  (clear entire cart)
router.delete("/cart", protectCustomer, async (req, res) => {
  try {
    await Cart.updateOne(
      { customer: req.customer._id },
      {
        $set: { items: [] },
        $setOnInsert: { customer: req.customer._id },
      },
      { upsert: true }
    );
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("DELETE /cart (clear) error:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

/* =========================
   WISHLIST
   ========================= */

// GET /api/features/wishlist
router.get("/wishlist", protectCustomer, async (req, res) => {
  try {
    const wl = await Wishlist.findOne({ customer: req.customer._id }).lean();
    if (!wl || !wl.items.length) return res.json([]);

    const ids = wl.items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: ids } }).lean();

    const list = products.map((p) => {
      const addedAt =
        wl.items.find((i) => i.product.toString() === p._id.toString())?.addedAt ||
        new Date();
      return {
        _id: p._id,
        name: p.name,
        price: p.price,
        image: toWebUploadPath(p.image),
        seller: p.seller || null,
        inStock: true,
        dateAdded: addedAt,
      };
    });

    res.json(list);
  } catch (err) {
    console.error("GET /wishlist error:", err);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});

// POST /api/features/wishlist  { productId }
router.post("/wishlist", protectCustomer, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: "productId is required" });

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    let wl = await Wishlist.findOne({ customer: req.customer._id });
    if (!wl) wl = new Wishlist({ customer: req.customer._id, items: [] });

    const exists = wl.items.some((i) => i.product.toString() === productId);
    if (!exists) wl.items.push({ product: product._id });

    await wl.save();
    res.status(201).json({ message: "Added to wishlist" });
  } catch (err) {
    console.error("POST /wishlist error:", err);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

// DELETE /api/features/wishlist/:productId
router.delete("/wishlist/:productId", protectCustomer, async (req, res) => {
  try {
    const { productId } = req.params;
    const wl = await Wishlist.findOne({ customer: req.customer._id });
    if (!wl) return res.status(404).json({ message: "Wishlist not found" });

    wl.items = wl.items.filter((i) => i.product.toString() !== productId);
    await wl.save();
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    console.error("DELETE /wishlist/:productId error:", err);
    res.status(500).json({ message: "Failed to remove item" });
  }
});

/* =========================
   SELLER PROFILE (with logo upload)
   ========================= */

// GET /api/features/seller-profile
router.get("/seller-profile", protectSeller, async (req, res) => {
  try {
    // Use lean to get plain object, then normalize image paths
    let profile = await SellerProfile.findOne({ seller: req.seller._id }).lean();

    if (!profile) {
      const created = await SellerProfile.create({
        seller: req.seller._id,
        storeName: req.seller.businessName,
      });
      profile = created.toObject();
    }

    // Normalize logo path for frontend
    if (profile.logo) {
      profile.logo = toWebUploadPath(profile.logo);
    }

    res.json(profile);
  } catch (err) {
    console.error("GET /seller-profile error:", err);
    res.status(500).json({ message: "Failed to fetch seller profile" });
  }
});

// POST /api/features/seller-profile
router.post("/seller-profile", protectSeller, async (req, res) => {
  try {
    const update = req.body || {};
    const updatedDoc = await SellerProfile.findOneAndUpdate(
      { seller: req.seller._id },
      { $set: update },
      { new: true, upsert: true }
    ).lean();

    // Normalize logo if present
    if (updatedDoc.logo) {
      updatedDoc.logo = toWebUploadPath(updatedDoc.logo);
    }

    res.json(updatedDoc);
  } catch (err) {
    console.error("POST /seller-profile error:", err);
    res.status(500).json({ message: "Failed to update seller profile" });
  }
});

// POST /api/features/seller-profile/logo  (upload logo)
router.post("/seller-profile/logo", protectSeller, upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Logo file is required" });

    const logoPath = `/uploads/${req.file.filename}`;
    const updated = await SellerProfile.findOneAndUpdate(
      { seller: req.seller._id },
      { $set: { logo: logoPath } },
      { new: true, upsert: true }
    ).lean();

    updated.logo = toWebUploadPath(updated.logo);
    res.json(updated);
  } catch (err) {
    console.error("POST /seller-profile/logo error:", err);
    res.status(500).json({ message: "Failed to upload logo" });
  }
});

module.exports = router;
