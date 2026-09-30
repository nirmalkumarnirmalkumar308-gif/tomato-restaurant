import React, { useEffect, useState } from "react";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiChevronUp,
  HiChevronDown,
  HiArrowPath,
} from "react-icons/hi2";

import AdminBackButton from "./AdminBackbutton";

import {
  getCategories,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  updateSubCategoryOrder,
} from "./api";

import "./AdminPages.css";

const AdminSubCategories = () => {
  // ==========================================
  // STATES
  // ==========================================

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [newName, setNewName] = useState("");

  const [editingSubCategory, setEditingSubCategory] =
    useState(null);

  const [editName, setEditName] = useState("");

  const [editCategoryId, setEditCategoryId] =
    useState("");

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  const loadCategories = async () => {
    try {
      const response = await getCategories();

      if (Array.isArray(response)) {
        setCategories(response);
      }
    } catch (error) {
      console.error(
        "Error loading categories:",
        error
      );
    }
  };

  // ==========================================
  // LOAD SUB CATEGORIES
  // ==========================================

  const loadSubCategories = async () => {
    try {
      setLoading(true);

      const response = await getSubCategories();

      if (Array.isArray(response)) {
        const sorted = [...response].sort(
          (a, b) => {
            const categoryCompare =
              Number(a.category_id) -
              Number(b.category_id);

            if (categoryCompare !== 0) {
              return categoryCompare;
            }

            return (
              Number(a.sort_order || 0) -
              Number(b.sort_order || 0)
            );
          }
        );

        setSubCategories(sorted);
      } else {
        setSubCategories([]);
      }
    } catch (error) {
      console.error(
        "Error loading sub categories:",
        error
      );

      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadCategories();
    loadSubCategories();
  }, []);

  // ==========================================
  // CATEGORY NAME
  // ==========================================

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) =>
        Number(item.id) === Number(categoryId)
    );

    return category ? category.name : "-";
  };

  // ==========================================
  // FILTERED SUB CATEGORIES
  // ==========================================

  const filteredSubCategories =
    selectedCategory
      ? subCategories.filter(
          (item) =>
            Number(item.category_id) ===
            Number(selectedCategory)
        )
      : subCategories;

  // ==========================================
  // ADD SUB CATEGORY
  // ==========================================

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!selectedCategory) {
      alert("Please select a category");
      return;
    }

    if (!newName.trim()) {
      alert("Please enter sub category name");
      return;
    }

    try {
      const categorySubCategories =
        subCategories.filter(
          (item) =>
            Number(item.category_id) ===
            Number(selectedCategory)
        );

      const nextSortOrder =
        categorySubCategories.length + 1;

      await createSubCategory({
        category_id: Number(selectedCategory),
        name: newName.trim(),
        sort_order: nextSortOrder,
      });

      alert(
        "Sub Category added successfully"
      );

      setNewName("");
      setShowAddModal(false);

      await loadSubCategories();
    } catch (error) {
      console.error(
        "Error adding sub category:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to add sub category"
      );
    }
  };

  // ==========================================
  // OPEN EDIT
  // ==========================================

  const handleEdit = (subCategory) => {
    setEditingSubCategory(subCategory);

    setEditName(subCategory.name);

    setEditCategoryId(
      String(subCategory.category_id)
    );

    setShowEditModal(true);
  };

  // ==========================================
  // UPDATE SUB CATEGORY
  // ==========================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editName.trim()) {
      alert("Please enter sub category name");
      return;
    }

    if (!editCategoryId) {
      alert("Please select category");
      return;
    }

    try {
      await updateSubCategory(
        editingSubCategory.id,
        {
          category_id: Number(editCategoryId),
          name: editName.trim(),
          sort_order:
            Number(
              editingSubCategory.sort_order
            ) || 1,
        }
      );

      alert(
        "Sub Category updated successfully"
      );

      setShowEditModal(false);
      setEditingSubCategory(null);
      setEditName("");
      setEditCategoryId("");

      await loadSubCategories();
    } catch (error) {
      console.error(
        "Error updating sub category:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to update sub category"
      );
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sub category?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteSubCategory(id);

      alert(
        "Sub Category deleted successfully"
      );

      await loadSubCategories();
    } catch (error) {
      console.error(
        "Error deleting sub category:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to delete sub category"
      );
    }
  };

  // ==========================================
  // SAVE ORDER
  // ==========================================

  const saveOrder = async (updatedList) => {
    try {
      await updateSubCategoryOrder(
        updatedList.map((item, index) => ({
          id: item.id,
          sort_order: index + 1,
        }))
      );

      await loadSubCategories();
    } catch (error) {
      console.error(
        "Error updating sub category order:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to update sort order"
      );

      await loadSubCategories();
    }
  };

  // ==========================================
  // MOVE UP
  // ==========================================

  const handleMoveUp = async (index) => {
    if (index <= 0) {
      return;
    }

    const current =
      filteredSubCategories[index];

    const previous =
      filteredSubCategories[index - 1];

    if (
      Number(current.category_id) !==
      Number(previous.category_id)
    ) {
      return;
    }

    const updatedList = [
      ...filteredSubCategories,
    ];

    [
      updatedList[index - 1],
      updatedList[index],
    ] = [
      updatedList[index],
      updatedList[index - 1],
    ];

    const reordered = updatedList.map(
      (item, itemIndex) => ({
        ...item,
        sort_order: itemIndex + 1,
      })
    );

    setSubCategories((prev) => {
      const otherItems = prev.filter(
        (item) =>
          Number(item.category_id) !==
          Number(selectedCategory)
      );

      return [...otherItems, ...reordered].sort(
        (a, b) => {
          const categoryCompare =
            Number(a.category_id) -
            Number(b.category_id);

          if (categoryCompare !== 0) {
            return categoryCompare;
          }

          return (
            Number(a.sort_order || 0) -
            Number(b.sort_order || 0)
          );
        }
      );
    });

    await saveOrder(reordered);
  };

  // ==========================================
  // MOVE DOWN
  // ==========================================

  const handleMoveDown = async (index) => {
    if (
      index >=
      filteredSubCategories.length - 1
    ) {
      return;
    }

    const current =
      filteredSubCategories[index];

    const next =
      filteredSubCategories[index + 1];

    if (
      Number(current.category_id) !==
      Number(next.category_id)
    ) {
      return;
    }

    const updatedList = [
      ...filteredSubCategories,
    ];

    [
      updatedList[index],
      updatedList[index + 1],
    ] = [
      updatedList[index + 1],
      updatedList[index],
    ];

    const reordered = updatedList.map(
      (item, itemIndex) => ({
        ...item,
        sort_order: itemIndex + 1,
      })
    );

    setSubCategories((prev) => {
      const otherItems = prev.filter(
        (item) =>
          Number(item.category_id) !==
          Number(selectedCategory)
      );

      return [...otherItems, ...reordered].sort(
        (a, b) => {
          const categoryCompare =
            Number(a.category_id) -
            Number(b.category_id);

          if (categoryCompare !== 0) {
            return categoryCompare;
          }

          return (
            Number(a.sort_order || 0) -
            Number(b.sort_order || 0)
          );
        }
      );
    });

    await saveOrder(reordered);
  };

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    await loadCategories();
    await loadSubCategories();
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="admin-page">

      <AdminBackButton />

      {/* HEADER */}
      <div className="admin-page-header">
        <div>
          <span>SUB CATEGORY MANAGEMENT</span>

          <h1>Sub Categories</h1>

          <p>
            Manage food sub categories and
            their display order.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={() =>
            setShowAddModal(true)
          }
        >
          <HiPlus />
          Add Sub Category
        </button>
      </div>

      {/* TOOLBAR */}
      <div
        className="admin-table-card"
        style={{
          marginBottom: "20px",
        }}
      >
        <div
          className="table-toolbar"
          style={{
            justifyContent: "space-between",
          }}
        >
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value
              )
            }
          >
            <option value="">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="secondary-btn"
            onClick={handleRefresh}
          >
            <HiArrowPath />
            Refresh
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="admin-table-card">

        <div className="table-scroll">

          <table className="admin-table">

            <thead>
              <tr>
                <th>Sort Order</th>

                <th>Sub Category ID</th>

                <th>Sub Category Name</th>

                <th>Category</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    Loading Sub Categories...
                  </td>
                </tr>
              ) : filteredSubCategories.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    No Sub Categories Found
                  </td>
                </tr>
              ) : (
                filteredSubCategories.map(
                  (subCategory, index) => (
                    <tr
                      key={subCategory.id}
                    >

                      {/* SORT ORDER */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: "8px",
                          }}
                        >
                          <strong>
                            {index + 1}
                          </strong>

                          <div
                            style={{
                              display:
                                "flex",
                              gap: "3px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleMoveUp(
                                  index
                                )
                              }
                              disabled={
                                index === 0
                              }
                              title="Move Up"
                              style={{
                                border:
                                  "1px solid #ddd",
                                background:
                                  "#fff",
                                borderRadius:
                                  "5px",
                                width: "28px",
                                height:
                                  "28px",
                                cursor:
                                  index === 0
                                    ? "not-allowed"
                                    : "pointer",
                                opacity:
                                  index === 0
                                    ? 0.4
                                    : 1,
                              }}
                            >
                              <HiChevronUp />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleMoveDown(
                                  index
                                )
                              }
                              disabled={
                                index ===
                                filteredSubCategories.length -
                                  1
                              }
                              title="Move Down"
                              style={{
                                border:
                                  "1px solid #ddd",
                                background:
                                  "#fff",
                                borderRadius:
                                  "5px",
                                width: "28px",
                                height:
                                  "28px",
                                cursor:
                                  index ===
                                  filteredSubCategories.length -
                                    1
                                    ? "not-allowed"
                                    : "pointer",
                                opacity:
                                  index ===
                                  filteredSubCategories.length -
                                    1
                                    ? 0.4
                                    : 1,
                              }}
                            >
                              <HiChevronDown />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td>
                        <strong>
                          #{subCategory.id}
                        </strong>
                      </td>

                      {/* NAME */}
                      <td>
                        <strong>
                          {subCategory.name}
                        </strong>
                      </td>

                      {/* CATEGORY */}
                      <td>
                        {getCategoryName(
                          subCategory.category_id
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: "8px",
                          }}
                        >

                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                              handleEdit(
                                subCategory
                              )
                            }
                            title="Edit"
                          >
                            <HiPencil />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(
                                subCategory.id
                              )
                            }
                            title="Delete"
                          >
                            <HiTrash />
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ======================================
          ADD MODAL
      ====================================== */}

      {showAddModal && (
        <div className="admin-modal-overlay">

          <div className="admin-modal">

            <div className="admin-modal-header">
              <h2>Add Sub Category</h2>

              <button
                type="button"
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAdd}>

              <div className="form-group">

                <label>
                  Category
                </label>

                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>

              </div>

              <div className="form-group">

                <label>
                  Sub Category Name
                </label>

                <input
                  type="text"
                  value={newName}
                  onChange={(e) =>
                    setNewName(
                      e.target.value
                    )
                  }
                  placeholder="Enter sub category name"
                  required
                />

              </div>

              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Add Sub Category
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ======================================
          EDIT MODAL
      ====================================== */}

      {showEditModal &&
        editingSubCategory && (
          <div className="admin-modal-overlay">

            <div className="admin-modal">

              <div className="admin-modal-header">

                <h2>
                  Edit Sub Category
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSubCategory(
                      null
                    );
                  }}
                >
                  ×
                </button>

              </div>

              <form onSubmit={handleUpdate}>

                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    value={editCategoryId}
                    onChange={(e) =>
                      setEditCategoryId(
                        e.target.value
                      )
                    }
                    required
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Sub Category Name
                  </label>

                  <input
                    type="text"
                    value={editName}
                    onChange={(e) =>
                      setEditName(
                        e.target.value
                      )
                    }
                    placeholder="Enter sub category name"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Sort Order
                  </label>

                  <input
                    type="number"
                    value={
                      editingSubCategory.sort_order ||
                      1
                    }
                    disabled
                  />

                </div>

                <div className="admin-modal-actions">

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingSubCategory(
                        null
                      );
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    Save Changes
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
};

export default AdminSubCategories;
