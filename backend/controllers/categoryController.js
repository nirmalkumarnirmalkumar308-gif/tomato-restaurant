const Category = require("../models/Category");

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [
        ["sort_order", "ASC"],
        ["id", "ASC"],
      ],
    });

    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      message: "Failed to fetch categories",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const category = await Category.create({
      name,
      sort_order: Number(sort_order) || 0,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);

    res.status(500).json({
      message: "Failed to create category",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sort_order } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    await category.update({
      name: name ?? category.name,
      sort_order:
        sort_order !== undefined
          ? Number(sort_order)
          : category.sort_order,
    });

    res.json(category);
  } catch (error) {
    console.error("Update category error:", error);

    res.status(500).json({
      message: "Failed to update category",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    await category.destroy();

    res.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

const updateCategoryOrder = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        message: "Invalid category order",
      });
    }

    for (const category of categories) {
      await Category.update(
        {
          sort_order: Number(category.sort_order),
        },
        {
          where: {
            id: category.id,
          },
        }
      );
    }

    res.json({
      message: "Category order updated successfully",
    });
  } catch (error) {
    console.error("Update category order error:", error);

    res.status(500).json({
      message: "Failed to update category order",
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrder,
};