const express = require("express");

const router = express.Router();

const {
  createSubCategory,
  getSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  updateSubCategory,
  updateSubCategoryOrder,
  deleteSubCategory,
} = require("../controllers/subCategoryController");

const {
  verifyToken,
  adminOnly,
} = require("../middleware/authMiddleware");

// =====================================================
// PUBLIC ROUTES
// =====================================================

// Get all subcategories
// /api/subcategories
// /api/subcategories?category_id=12

router.get(
  "/",
  getSubCategories
);

// Get subcategories by category
// /api/subcategories/category/12

router.get(
  "/category/:categoryId",
  getSubCategoriesByCategory
);

// Get one subcategory
// /api/subcategories/57

router.get(
  "/:id",
  getSubCategoryById
);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Create subcategory

router.post(
  "/",
  verifyToken,
  adminOnly,
  createSubCategory
);

// Reorder subcategories
// IMPORTANT: must come before /:id

router.put(
  "/order",
  verifyToken,
  adminOnly,
  updateSubCategoryOrder
);

// Update subcategory

router.put(
  "/:id",
  verifyToken,
  adminOnly,
  updateSubCategory
);

// Delete subcategory

router.delete(
  "/:id",
  verifyToken,
  adminOnly,
  deleteSubCategory
);

module.exports = router;