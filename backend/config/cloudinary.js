const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Debug: Check if env vars are loaded
console.log('=== CLOUDINARY CONFIG LOADING ===');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage with more explicit settings
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'surety-cart',
      format: 'jpg', // Convert all to jpg
      public_id: `product-${Date.now()}`, // Custom filename
      transformation: [{ quality: 'auto:good', fetch_format: 'auto' }]
    };
  },
});

// Fallback to disk storage if Cloudinary fails
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, 'image-' + Date.now() + path.extname(file.originalname))
  }
});

// Create upload middleware - use Cloudinary if configured, else disk
const upload = process.env.CLOUDINARY_CLOUD_NAME 
  ? multer({ storage: storage })
  : multer({ storage: diskStorage });

console.log('Using storage:', process.env.CLOUDINARY_CLOUD_NAME ? 'Cloudinary' : 'Disk');

module.exports = { cloudinary, upload };
