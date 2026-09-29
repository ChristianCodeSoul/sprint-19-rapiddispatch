const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const {
  calculateOrderTotal,
  buildOrderItems,
  validateCartItems,
} = require("../utils/orderUtils");

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate("items.product");

    res.status(200).json({
      success: true, count: orders.length, data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false, message: "Failed to fetch orders",
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId, }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty", });
    }
    const validation = validateCartItems(cart.items);

    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message, });
    }

    const orderItems = buildOrderItems(cart.items);
    const totalAmount = calculateOrderTotal(cart.items);

    const order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      totalAmount,
      status: "confirmed",
      paymentStatus: "pending",
    });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

module.exports = {
  getOrders,
  createOrder,
};