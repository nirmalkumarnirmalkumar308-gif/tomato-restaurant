const express = require("express");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/OrderController");

const {
  verifyToken,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createOrder);

router.get(
  "/",
  verifyToken,
  adminOnly,
  getOrders
);

router.get(
  "/:id",
  verifyToken,
  adminOnly,
  getOrderById
);

router.put(
  "/:id/status",
  verifyToken,
  adminOnly,
  updateOrderStatus
);

module.exports = router;