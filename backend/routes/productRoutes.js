const express = require("express");
const Product = require("../models/Product");
const { protectSeller } = require("../middleware/authMiddleware");
const { upload, cloudinary } = require("../config/cloudinary");

const router = express.Router();

// Debug middleware
const debugUpload = (req, res, next) => {
  console.error("=== UPLOAD MIDDLEWARE DEBUG ===");
  console.error("Content-Type:", req.headers['content-type']);
  console.error("Body:", req.body);
  console.error("File before multer:", req.file);
  next();
};

// Helper to normalize product data
const normalizeProduct = (product) => {
  const p = product?.toObject ? product.toObject() : product;
  return p;
};

// GET /api/products (public) - Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name').lean();
    res.json(products);
  } catch (error) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Test route to check Cloudinary configuration
router.get("/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    
    res.json({
      success: true,
      message: "Cloudinary is connected!",
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      testResult: result,
      env: {
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cloudinary connection failed",
      error: error.message,
      env: {
        hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
      }
    });
  }
});

// Add this route for debugging
router.get("/debug-products", async (req, res) => {
  try {
    const products = await Product.find().select('name image imagePublicId').limit(5);
    res.json({
      count: products.length,
      products: products.map(p => ({
        name: p.name,
        image: p.image,
        imagePublicId: p.imagePublicId,
        isCloudinary: p.image?.includes('cloudinary')
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/my-products (seller) - Get seller's products
router.get("/my-products", protectSeller, async (req, res) => {
  try {
    const myProducts = await Product.find({ seller: req.seller._id }).lean();
    res.json(myProducts);
  } catch (error) {
    console.error("Fetch My Products Error:", error);
    res.status(500).json({ message: "Failed to fetch seller products" });
  }
});

// POST /api/products (seller) - Add new product with enhanced debugging
router.post("/", protectSeller, debugUpload, upload.single("image"), async (req, res) => {
  try {
    // Use console.error for critical debug info
    console.error("=== PRODUCT CREATION DEBUG ===");
    console.error("Request received at:", new Date().toISOString());
    console.error("Seller ID:", req.seller._id);
    console.error("File exists:", !!req.file);
    
    if (req.file) {
      console.error("=== FILE DETAILS ===");
      console.error(JSON.stringify({
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        filename: req.file.filename,
        public_id: req.file.public_id,
        secure_url: req.file.secure_url,
        url: req.file.url,
        resource_type: req.file.resource_type,
        format: req.file.format,
        // Additional fields that might exist
        asset_id: req.file.asset_id,
        version_id: req.file.version_id,
        created_at: req.file.created_at,
        bytes: req.file.bytes,
        width: req.file.width,
        height: req.file.height
      }, null, 2));
      console.error("Is Cloudinary URL?", req.file.path?.includes('cloudinary'));
    } else {
      console.error("NO FILE UPLOADED!");
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

    console.error("=== REQUEST BODY ===");
    console.error(JSON.stringify({
      name,
      title,
      price,
      description,
      originalPrice,
      discount,
      quantity,
      category,
      brand
    }, null, 2));

    const finalName = name || title;
    
    if (!finalName || !price || !req.file) {
      // Delete uploaded image if validation fails
      if (req.file && req.file.public_id) {
        await cloudinary.uploader.destroy(req.file.public_id).catch(() => {});
      }
      return res.status(400).json({ 
        message: "Name, price, and image are required",
        fileReceived: !!req.file,
        debug: {
          hasFile: !!req.file,
          fileName: req.file?.originalname,
          filePath: req.file?.path
        }
      });
    }

    // Use the correct URL field - check multiple possible fields
    const imageUrl = req.file.secure_url || req.file.url || req.file.path;
    
    console.error("=== IMAGE URL SELECTION ===");
    console.error("secure_url:", req.file.secure_url);
    console.error("url:", req.file.url);
    console.error("path:", req.file.path);
    console.error("Selected imageUrl:", imageUrl);

    const saved = await Product.create({
      name: finalName,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discount: discount ? Number(discount) : 0,
      quantity: quantity ? Number(quantity) : 0,
      category,
      brand,
      description,
      image: imageUrl,
      imagePublicId: req.file.public_id || null,
      seller: req.seller._id,
    });

    // After saving
    console.error("=== PRODUCT SAVED ===");
    console.error("Product ID:", saved._id);
    console.error("Image URL:", saved.image);
    console.error("Public ID:", saved.imagePublicId);

    const populated = await Product.findById(saved._id).populate('seller', 'name');
    res.status(201).json(populated);
  } catch (error) {
    console.error("=== PRODUCT CREATION ERROR ===", error);
    // Clean up uploaded image if product creation fails
    if (req.file && req.file.public_id) {
      await cloudinary.uploader.destroy(req.file.public_id).catch(() => {});
    }
    res.status(500).json({ 
      message: "Failed to add product",
      error: error.message 
    });
  }
});

// PUT /api/products/:id (seller) - Update product
router.put("/:id", protectSeller, upload.single("image"), async (req, res) => {
  try {
    console.error("=== PRODUCT UPDATE DEBUG ===");
    console.error("Product ID:", req.params.id);
    console.error("Has new image:", !!req.file);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller?.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ 
        message: "Forbidden: You do not own this product" 
      });
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

    // Handle image update
    if (req.file) {
      console.error("=== UPDATE FILE DETAILS ===");
      console.error(JSON.stringify({
        path: req.file.path,
        secure_url: req.file.secure_url,
        public_id: req.file.public_id,
        filename: req.file.filename
      }, null, 2));

      // Delete old image from Cloudinary
      if (product.imagePublicId) {
        await cloudinary.uploader.destroy(product.imagePublicId).catch(() => {});
      }
      // Use the correct URL field
      const imageUrl = req.file.secure_url || req.file.url || req.file.path;
      update.image = imageUrl;
      update.imagePublicId = req.file.public_id || null;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id, 
      update, 
      { new: true }
    ).populate('seller', 'name');
    
    console.error("=== PRODUCT UPDATED ===");
    console.error("Updated image URL:", updated.image);

    res.json(updated);
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE /api/products/:id (seller) - Delete product
router.delete("/:id", protectSeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller?.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ 
        message: "Forbidden: You do not own this product" 
      });
    }

    // Delete image from Cloudinary
    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId).catch((err) => {
        console.error("Failed to delete image from Cloudinary:", err);
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
