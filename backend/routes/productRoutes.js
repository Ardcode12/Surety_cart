// backend/routes/productRoutes.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Product = require("../models/Product");
const { protectSeller } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   Helpers
   ========================= */

// Always return a web-safe /uploads/<filename> path to the client
const toWebUploadPath = (p) => {
  if (!p) return null;
  try {
    const clean = String(p).replace(/\\/g, "/"); // fix Windows backslashes
    const filename = path.basename(clean);
    return `/uploads/${filename}`;
  } catch {
    return null;
  }
};

const normalizeProduct = (doc) => {
  const p = doc?.toObject ? doc.toObject() : doc;
  if (!p) return p;
  return {
    ...p,
    image: p.image ? toWebUploadPath(p.image) : null,
  };
};

/* =========================
   Multer (uploads)
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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

/* =========================
   Routes
   ========================= */

// GET /api/products (public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().lean();
    const shaped = products.map(normalizeProduct);
    res.json(shaped);
  } catch (error) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET /api/products/my-products (seller)
router.get("/my-products", protectSeller, async (req, res) => {
  try {
    const myProducts = await Product.find({ seller: req.seller._id }).lean();
    const shaped = myProducts.map(normalizeProduct);
    res.json(shaped);
  } catch (error) {
    console.error("Fetch My Products Error:", error);
    res.status(500).json({ message: "Failed to fetch seller products" });
  }
});

// POST /api/products (seller)
router.post("/", protectSeller, upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      title,
      price,
      description,
      originalPrice,
      discount,
      quantity,
      category,
      brand,
    } = req.body;

    const finalName = name || title;
    if (!finalName || !price || !req.file) {
      return res
        .status(400)
        .json({ message: "Name, price, and image are required" });
    }

    const saved = await Product.create({
      name: finalName,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discount: discount ? Number(discount) : 0,
      quantity: quantity ? Number(quantity) : 0,
      category,
      brand,
      description,
      image: `/uploads/${req.file.filename}`, // store web path
      seller: req.seller._id,
    });

    res.status(201).json(normalizeProduct(saved));
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// PUT /api/products/:id (seller)
router.put("/:id", protectSeller, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.seller?.toString() !== req.seller._id.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this product" });
    }

    const {
      name,
      title,
      price,
      description,
      originalPrice,
      discount,
      quantity,
      category,
      brand,
    } = req.body;

    const update = {};
    if (name || title) update.name = name || title;
    if (price !== undefined) update.price = Number(price);
    if (originalPrice !== undefined) update.originalPrice = Number(originalPrice);
    if (discount !== undefined) update.discount = Number(discount);
    if (quantity !== undefined) update.quantity = Number(quantity);
    if (category !== undefined) update.category = category;
    if (brand !== undefined) update.brand = brand;
    if (description !== undefined) update.description = description;
    if (req.file) update.image = `/uploads/${req.file.filename}`; // web path

    const updated = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    res.json(normalizeProduct(updated));
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE /api/products/:id (seller)
router.delete("/:id", protectSeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.seller?.toString() !== req.seller._id.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this product" });
    }

    await Product.findByIdAndDelete(req.params.id);

    // Remove physical file if present
    if (product.image) {
      const diskPath = path.join(
        __dirname,
        "..",
        String(product.image).replace(/^[\\/]/, "")
      );
      fs.promises.unlink(diskPath).catch(() => {});
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
