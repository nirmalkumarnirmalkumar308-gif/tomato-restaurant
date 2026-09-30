const express = require("express");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrder,
} = require("../controllers/categoryController");

const {
  verifyToken,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCategories);

router.post(
  "/",
  verifyToken,
  adminOnly,
  createCategory
);

router.put(
  "/order",
  verifyToken,
  adminOnly,
  updateCategoryOrder
);

router.put(
  "/:id",
  verifyToken,
  adminOnly,
  updateCategory
);

router.delete(
  "/:id",
  verifyToken,
  adminOnly,
  deleteCategory
);

module.exports = router;