const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");

// =====================================================
// GET ALL SUB CATEGORIES
// GET /api/subcategories
// =====================================================

const getSubCategories = async (req, res) => {
  try {
    const { category_id } = req.query;

    const where = {};

    if (
      category_id !== undefined &&
      category_id !== ""
    ) {
      const categoryId = Number(category_id);

      if (!Number.isInteger(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category_id",
        });
      }

      where.category_id = categoryId;
    }

    const subCategories = await SubCategory.findAll({
      where,
      order: [
        ["sort_order", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.status(200).json({
      success: true,
      subcategories: subCategories,
    });
  } catch (error) {
    console.error(
      "GET SUB CATEGORIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sub categories",
      error: error.message,
    });
  }
};

// =====================================================
// GET SUB CATEGORIES BY CATEGORY
// GET /api/subcategories/category/:categoryId
// =====================================================

const getSubCategoriesByCategory = async (
  req,
  res
) => {
  try {
    const { categoryId } = req.params;

    const categoryID = Number(categoryId);

    if (!Number.isInteger(categoryID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await Category.findByPk(
      categoryID
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const subCategories = await SubCategory.findAll({
      where: {
        category_id: categoryID,
      },
      order: [
        ["sort_order", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.status(200).json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
      },
      subcategories: subCategories,
    });
  } catch (error) {
    console.error(
      "GET SUB CATEGORIES BY CATEGORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch sub categories by category",
      error: error.message,
    });
  }
};

// =====================================================
// GET SUB CATEGORY BY ID
// GET /api/subcategories/:id
// =====================================================

const getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory =
      await SubCategory.findByPk(id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    return res.status(200).json({
      success: true,
      subcategory: subCategory,
    });
  } catch (error) {
    console.error(
      "GET SUB CATEGORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sub category",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE SUB CATEGORY
// POST /api/subcategories
// =====================================================

const createSubCategory = async (req, res) => {
  try {
    const {
      category_id,
      name,
      sort_order,
    } = req.body;

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Sub category name is required",
      });
    }

    const category = await Category.findByPk(
      Number(category_id)
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const existing =
      await SubCategory.findOne({
        where: {
          category_id: Number(category_id),
          name: name.trim(),
        },
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "Sub category already exists",
      });
    }

    const subCategory =
      await SubCategory.create({
        category_id: Number(category_id),
        name: name.trim(),
        sort_order:
          sort_order !== undefined
            ? Number(sort_order)
            : 1,
      });

    return res.status(201).json({
      success: true,
      message:
        "Sub category created successfully",
      subcategory: subCategory,
    });
  } catch (error) {
    console.error(
      "CREATE SUB CATEGORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create sub category",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE SUB CATEGORY
// PUT /api/subcategories/:id
// =====================================================

const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      category_id,
      name,
      sort_order,
    } = req.body;

    const subCategory =
      await SubCategory.findByPk(id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    if (category_id !== undefined) {
      const category =
        await Category.findByPk(
          Number(category_id)
        );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      subCategory.category_id =
        Number(category_id);
    }

    if (
      name !== undefined &&
      name.trim()
    ) {
      subCategory.name =
        name.trim();
    }

    if (
      sort_order !== undefined
    ) {
      subCategory.sort_order =
        Number(sort_order);
    }

    await subCategory.save();

    return res.status(200).json({
      success: true,
      message:
        "Sub category updated successfully",
      subcategory: subCategory,
    });
  } catch (error) {
    console.error(
      "UPDATE SUB CATEGORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update sub category",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE SUB CATEGORY ORDER
// PUT /api/subcategories/order
// =====================================================

const updateSubCategoryOrder = async (
  req,
  res
) => {
  try {
    const { subcategories } = req.body;

    if (!Array.isArray(subcategories)) {
      return res.status(400).json({
        success: false,
        message:
          "subcategories must be an array",
      });
    }

    for (let i = 0; i < subcategories.length; i++) {
      const item = subcategories[i];

      if (!item.id) {
        continue;
      }

      await SubCategory.update(
        {
          sort_order:
            item.sort_order !== undefined
              ? Number(item.sort_order)
              : i + 1,
        },
        {
          where: {
            id: Number(item.id),
          },
        }
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Sub category order updated successfully",
    });
  } catch (error) {
    console.error(
      "UPDATE SUB CATEGORY ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update sub category order",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE SUB CATEGORY
// DELETE /api/subcategories/:id
// =====================================================

const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subCategory =
      await SubCategory.findByPk(id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    await subCategory.destroy();

    return res.status(200).json({
      success: true,
      message:
        "Sub category deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE SUB CATEGORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete sub category",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  updateSubCategoryOrder,
  deleteSubCategory,
};