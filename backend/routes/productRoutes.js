const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Product = require("../models/Product");
const { protectSeller } = require("../middleware/authMiddleware");

const router = express.Router();

// --- Multer Config ---
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


// =================================================================
// ROUTES
// =================================================================

// ✅ GET /api/products -> PUBLIC: For anyone to view all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().lean();
    const withFullImage = products.map((p) => ({
      ...p,
      image: p.image ? `/uploads/${path.basename(p.image)}` : null,
    }));
    res.json(withFullImage);
  } catch (error) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// ✅ GET /api/products/my-products -> SECURED: Get products for the logged-in seller
router.get("/my-products", protectSeller, async (req, res) => {
  try {
    // Find products where the 'seller' field matches the authenticated seller's ID
    const myProducts = await Product.find({ seller: req.seller._id }).lean();

    const withFullImage = myProducts.map((p) => ({
      ...p,
      image: p.image ? `/uploads/${path.basename(p.image)}` : null,
    }));
    res.json(withFullImage);
  } catch (error) {
    console.error("Fetch My Products Error:", error);
    res.status(500).json({ message: "Failed to fetch seller products" });
  }
});


// ✅ POST /api/products -> SECURED: Only a logged-in seller can create a product
router.post("/", protectSeller, upload.single("image"), async (req, res) => {
  try {
    const { name, title, price, description } = req.body;

    const finalName = name || title;
    if (!finalName || !price || !req.file) {
      return res.status(400).json({ message: "Name, price, and image are required" });
    }

    const saved = await Product.create({
      name: finalName,
      price: Number(price),
      description,
      image: `/uploads/${req.file.filename}`,
      seller: req.seller._id, // Get seller ID securely from token
    });

    res.status(201).json(saved);
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// ✅ PUT /api/products/:id -> SECURED: Only the product's owner can update it
router.put("/:id", protectSeller, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Ownership Check
    if (product.seller.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this product" });
    }

    const { name, title, price, description } = req.body;
    const update = {};
    if (name || title) update.name = name || title;
    if (price !== undefined) update.price = Number(price);
    if (description !== undefined) update.description = description;
    if (req.file) update.image = `/uploads/${req.file.filename}`;

    const updated = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// ✅ DELETE /api/products/:id -> SECURED: Only the product's owner can delete it
router.delete("/:id", protectSeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Ownership Check
    if (product.seller.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You do not own this product" });
    }

    await Product.findByIdAndDelete(req.params.id);

    if (product.image) {
      const diskPath = path.join(__dirname, "..", product.image.replace(/^\//, ""));
      fs.promises.unlink(diskPath).catch(() => {});
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});


module.exports = router;