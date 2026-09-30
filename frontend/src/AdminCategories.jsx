import React, { useEffect, useState } from "react";

import {
  HiChevronUp,
  HiChevronDown,
  HiPencil,
  HiTrash,
  HiPlus,
  HiArrowPath,
} from "react-icons/hi2";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrder,
} from "./api";

import "./AdminCategories.css";
import AdminBackButton from "./AdminBackButton";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [categoryName, setCategoryName] = useState("");
  const [saving, setSaving] = useState(false);

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  const loadCategories = async () => {
    try {
      setLoading(true);

      const response = await getCategories();

      if (Array.isArray(response)) {
        const sorted = [...response].sort(
          (a, b) =>
            Number(a.sort_order || 0) -
            Number(b.sort_order || 0)
        );

        setCategories(sorted);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Load categories error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to load categories"
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadCategories();
  }, []);

  // ==========================================
  // ADD CATEGORY
  // ==========================================

  const handleAdd = () => {
    setEditingCategory(null);
    setCategoryName("");
    setShowForm(true);
  };

  // ==========================================
  // EDIT CATEGORY
  // ==========================================

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setShowForm(true);
  };

  // ==========================================
  // CANCEL FORM
  // ==========================================

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  // ==========================================
  // SAVE CATEGORY
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: categoryName.trim(),
          sort_order: editingCategory.sort_order,
        });

        alert("Category updated successfully");
      } else {
        let nextSortOrder = 1;

        if (categories.length > 0) {
          nextSortOrder =
            Math.max(
              ...categories.map((category) =>
                Number(category.sort_order || 0)
              )
            ) + 1;
        }

        await createCategory({
          name: categoryName.trim(),
          sort_order: nextSortOrder,
        });

        alert("Category added successfully");
      }

      handleCancel();

      await loadCategories();
    } catch (error) {
      console.error("Save category error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to save category"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCategory(id);

      alert("Category deleted successfully");

      await loadCategories();
    } catch (error) {
      console.error("Delete category error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete category"
      );
    }
  };

  // ==========================================
  // MOVE CATEGORY UP / DOWN
  // ==========================================

  const moveCategory = async (index, direction) => {
    const newIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      newIndex < 0 ||
      newIndex >= categories.length
    ) {
      return;
    }

    const updatedCategories = [...categories];

    // Swap categories
    const temp = updatedCategories[index];

    updatedCategories[index] =
      updatedCategories[newIndex];

    updatedCategories[newIndex] = temp;

    // Re-create sort order
    const reorderedCategories =
      updatedCategories.map((category, i) => ({
        ...category,
        sort_order: i + 1,
      }));

    // Update UI immediately
    setCategories(reorderedCategories);

    try {
      const orderData =
        reorderedCategories.map((category) => ({
          id: category.id,
          sort_order: category.sort_order,
        }));

      await updateCategoryOrder(orderData);

      console.log(
        "Category order updated successfully"
      );
    } catch (error) {
      console.error(
        "Update category order error:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to update category order"
      );

      await loadCategories();
    }
  };

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = () => {
    loadCategories();
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="admin-categories-page">

      {/* ======================================
          BACK TO DASHBOARD
      ====================================== */}

      <AdminBackButton />

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="categories-header">

        <div className="categories-title">

          <h1>
            Category Management
          </h1>

          <p>
            Manage categories and their display order
          </p>

        </div>

        <div className="header-actions">

          {/* REFRESH */}

          <button
            type="button"
            className="refresh-btn"
            onClick={handleRefresh}
          >
            <HiArrowPath />
            Refresh
          </button>

          {/* ADD CATEGORY */}

          <button
            type="button"
            className="add-category-btn"
            onClick={handleAdd}
          >
            <HiPlus />
            Add Category
          </button>

        </div>

      </div>

      {/* ======================================
          TOTAL
      ====================================== */}

      <div className="category-stat-card">

        <div className="stat-number">
          {categories.length}
        </div>

        <div className="stat-label">
          Total Categories
        </div>

      </div>

      {/* ======================================
          ADD / EDIT FORM
      ====================================== */}

      {showForm && (
        <div className="category-form-card">

          <div className="form-title">

            <h2>
              {editingCategory
                ? "Edit Category"
                : "Add Category"}
            </h2>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>
                Category Name
              </label>

              <input
                type="text"
                value={categoryName}
                onChange={(e) =>
                  setCategoryName(e.target.value)
                }
                placeholder="Enter category name"
                autoFocus
              />

            </div>

            <div className="form-buttons">

              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingCategory
                  ? "Update Category"
                  : "Add Category"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ======================================
          TABLE
      ====================================== */}

      <div className="category-table-card">

        <div className="table-header">

          <div>

            <h2>
              Categories
            </h2>

            <p>
              Categories are displayed according to
              sort order
            </p>

          </div>

          <div className="items-count">
            {categories.length} Items
          </div>

        </div>

        {loading ? (

          <div className="loading-box">
            Loading categories...
          </div>

        ) : categories.length === 0 ? (

          <div className="empty-box">
            No categories found.
          </div>

        ) : (

          <div className="table-wrapper">

            <table className="category-table">

              <thead>

                <tr>

                  <th>
                    Sort Order
                  </th>

                  <th>
                    Category ID
                  </th>

                  <th>
                    Category Name
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {categories.map(
                  (category, index) => (

                    <tr key={category.id}>

                      {/* SORT ORDER */}

                      <td>

                        <span className="sort-number">
                          {category.sort_order}
                        </span>

                      </td>

                      {/* CATEGORY ID */}

                      <td>

                        <span className="category-id">
                          #{category.id}
                        </span>

                      </td>

                      {/* CATEGORY NAME */}

                      <td>

                        <span className="category-name">
                          {category.name}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="table-actions">

                          {/* UP */}

                          <button
                            type="button"
                            className="order-btn"
                            onClick={() =>
                              moveCategory(
                                index,
                                "up"
                              )
                            }
                            disabled={index === 0}
                            title="Move Up"
                          >
                            <HiChevronUp />
                          </button>

                          {/* DOWN */}

                          <button
                            type="button"
                            className="order-btn"
                            onClick={() =>
                              moveCategory(
                                index,
                                "down"
                              )
                            }
                            disabled={
                              index ===
                              categories.length - 1
                            }
                            title="Move Down"
                          >
                            <HiChevronDown />
                          </button>

                          {/* EDIT */}

                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                              handleEdit(category)
                            }
                          >
                            <HiPencil />
                            Edit
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(
                                category.id
                              )
                            }
                          >
                            <HiTrash />
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default AdminCategories;