const express = require("express");
const multer = require("multer");

const router = express.Router();

// =====================================================
// ITEM CONTROLLER
// =====================================================

const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  syncDefaultItems,
  searchFoodOnline,
} = require("../controllers/itemController");

// =====================================================
// AUTH MIDDLEWARE
// IMPORTANT:
// File name = authMiddleware.js
// =====================================================

const {
  verifyToken,
  adminOnly,
} = require("../middleware/authMiddleware");

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 4,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only PNG, JPG, JPEG and WEBP images are allowed"
        )
      );
    }
  },
});

// =====================================================
// SEARCH FOOD FROM INTERNET
// ADMIN ONLY
//
// Example:
// GET /api/items/search-food?q=biryani
// =====================================================

router.get(
  "/search-food",
  verifyToken,
  adminOnly,
  searchFoodOnline
);

// =====================================================
// SYNC DEFAULT ITEMS
// ADMIN ONLY
// =====================================================

router.post(
  "/sync-defaults",
  verifyToken,
  adminOnly,
  syncDefaultItems
);

// =====================================================
// GET ALL ITEMS
// PUBLIC
// =====================================================

router.get("/", getItems);

// =====================================================
// GET SINGLE ITEM
// PUBLIC
// =====================================================

router.get("/:id", getItemById);

// =====================================================
// CREATE ITEM
// ADMIN ONLY
// =====================================================

router.post(
  "/",
  verifyToken,
  adminOnly,
  upload.array("images", 4),
  createItem
);

// =====================================================
// UPDATE ITEM
// ADMIN ONLY
// =====================================================

router.put(
  "/:id",
  verifyToken,
  adminOnly,
  upload.array("images", 4),
  updateItem
);

// =====================================================
// DELETE ITEM
// ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  verifyToken,
  adminOnly,
  deleteItem
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;