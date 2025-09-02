// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Seller = require("../models/Seller");
const Customer = require("../models/Customer");

const JWT_SECRET = process.env.JWT_SECRET || "dev-fallback-secret-change-me";
const extractToken = (req) => req.headers.authorization?.split(" ")[1];

const protectSeller = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "Not authorized, token missing" });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "seller") return res.status(403).json({ message: "Forbidden (seller only)" });

    const seller = await Seller.findById(decoded.id);
    if (!seller) return res.status(401).json({ message: "Not authorized as seller" });

    req.seller = seller;
    req.user = { id: seller._id, role: "seller" };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const protectCustomer = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "Not authorized, token missing" });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "customer") return res.status(403).json({ message: "Forbidden (customer only)" });

    const customer = await Customer.findById(decoded.id);
    if (!customer) return res.status(401).json({ message: "Not authorized as customer" });

    req.customer = customer;
    req.user = { id: customer._id, role: "customer" };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { protectSeller, protectCustomer };
