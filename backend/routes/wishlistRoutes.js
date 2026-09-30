const express = require("express");

const router = express.Router();

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWishlist,
} = require("../controllers/wishlistController");

const {
  verifyToken,
} = require("../middleware/authMiddleware");

// =====================================================
// WISHLIST ROUTES
// =====================================================

// GET USER WISHLIST
router.get(
  "/",
  verifyToken,
  getWishlist
);

// ADD FOOD TO WISHLIST
router.post(
  "/",
  verifyToken,
  addToWishlist
);

// CHECK WHETHER FOOD IS WISHLISTED
router.get(
  "/check/:itemId",
  verifyToken,
  checkWishlist
);

// REMOVE FOOD FROM WISHLIST
router.delete(
  "/:itemId",
  verifyToken,
  removeFromWishlist
);

module.exports = router;