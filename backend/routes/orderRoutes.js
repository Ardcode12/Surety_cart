// backend/routes/orderRoutes.js
const express = require("express");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { protectCustomer, protectSeller } = require("../middleware/authMiddleware");

const router = express.Router();

const computeTotals = (items, { taxRate = 0, shippingFlat = 0 } = {}) => {
  const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const shipping = shippingFlat;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;
  return { subtotal, tax, shipping, total };
};

// Create order (from cart or direct items)
router.post("/", protectCustomer, async (req, res) => {
  const { source = "cart", items: directItems = [], shippingAddress = {}, payment = {} } = req.body;
  let items = [];

  if (source === "cart") {
    const cart = await Cart.findOne({ customer: req.customer._id }).lean();
    if (!cart || !cart.items.length) return res.status(400).json({ message: "Cart is empty" });

    const products = await Product.find({ _id: { $in: cart.items.map(i => i.product) } }).lean();
    const map = Object.fromEntries(products.map((p) => [p._id.toString(), p]));

    items = cart.items.map((i) => {
      const p = map[i.product.toString()];
      return {
        product: p._id,
        seller: p.seller || null,
        name: p.name,
        price: p.price,
        qty: i.qty,
      };
    });
  } else if (source === "direct") {
    if (!Array.isArray(directItems) || !directItems.length) return res.status(400).json({ message: "No items provided" });
    const productIds = directItems.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const map = Object.fromEntries(products.map((p) => [p._id.toString(), p]));
    items = directItems.map((i) => {
      const p = map[i.productId];
      if (!p) throw new Error("Product not found: " + i.productId);
      return { product: p._id, seller: p.seller || null, name: p.name, price: p.price, qty: Number(i.qty || 1) };
    });
  } else {
    return res.status(400).json({ message: "Invalid source" });
  }

  const totals = computeTotals(items, {
    taxRate: Number(process.env.ORDER_TAX_RATE || 0),
    shippingFlat: Number(process.env.ORDER_SHIPPING_FLAT || 0),
  });

  const order = await Order.create({
    customer: req.customer._id,
    items,
    shippingAddress,
    payment: {
      method: payment.method || "cod",
      status: payment.status || "pending",
      txnId: payment.txnId,
    },
    ...totals,
    status: "pending",
  });

  if (source === "cart") {
    await Cart.findOneAndUpdate({ customer: req.customer._id }, { $set: { items: [] } });
  }

  res.status(201).json(order);
});

// Customer orders
router.get("/my", protectCustomer, async (req, res) => {
  const orders = await Order.find({ customer: req.customer._id }).sort({ createdAt: -1 }).lean();
  res.json(orders);
});

// Seller view: orders that include this seller's items
router.get("/seller", protectSeller, async (req, res) => {
  const orders = await Order.find({ "items.seller": req.seller._id }).sort({ createdAt: -1 }).lean();
  const shaped = orders.map((o) => ({
    _id: o._id,
    customer: o.customer,
    status: o.status,
    placedAt: o.placedAt,
    totals: { subtotal: o.subtotal, tax: o.tax, shipping: o.shipping, total: o.total },
    items: o.items.filter((i) => i.seller?.toString() === req.seller._id.toString()),
  }));
  res.json(shaped);
});

// Seller can update overall order status (simple policy)
router.put("/:id/status", protectSeller, async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const sellerIsInOrder = order.items.some((i) => i.seller?.toString() === req.seller._id.toString());
  if (!sellerIsInOrder) return res.status(403).json({ message: "Forbidden" });

  order.status = status;
  await order.save();
  res.json(order);
});
// CANCEL (customer) -> PUT /api/orders/:id/cancel
router.put("/:id/cancel", protectCustomer, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Must belong to current customer
    if (order.customer.toString() !== req.customer._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Cancel only if not shipped/delivered/cancelled
    const st = (order.status || "").toLowerCase();
    const cancellable = ["pending", "confirmed", "processing"];
    if (!cancellable.includes(st)) {
      return res.status(400).json({ message: `Cannot cancel order at status '${order.status}'` });
    }

    order.status = "cancelled";
    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Failed to cancel order" });
  }
});

module.exports = router;
