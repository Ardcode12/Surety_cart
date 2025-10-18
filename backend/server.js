const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

// Load environment variables FIRST
dotenv.config();

// Verify env vars are loaded
console.log('=== SERVER STARTUP ===');
console.log('MongoDB URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('Cloudinary Config:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET');

// Routes - Import AFTER dotenv
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const featuresRoutes = require("./routes/featuresRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Failed:', err));

// Initialize app
const app = express();

// Configure CORS
const allowedOrigins = [
  "https://surety-cart.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin like mobile apps or curl requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder (fallback for local images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/features", featuresRoutes);
app.use("/api/orders", orderRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Listen on port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
