// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Seller = require("../models/Seller");

const JWT_SECRET = process.env.JWT_SECRET || "dev-fallback-secret-change-me";

const protectSeller = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized, token missing" });

    const decoded = jwt.verify(token, JWT_SECRET);

    const seller = await Seller.findById(decoded.id);
    if (!seller) return res.status(401).json({ message: "Not authorized as seller" });

    req.seller = seller;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { protectSeller };
