import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiArrowPath,
} from "react-icons/hi2";

import { getItems, getCategories } from "../api";
import "./EditFood.css";

const EditFood = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= LOAD FOOD DATA =================

  const loadFoods = async () => {
    try {
      setLoading(true);

      const [itemData, categoryData] = await Promise.all([
        getItems(),
        getCategories(),
      ]);

      const itemArray = Array.isArray(itemData)
        ? itemData
        : itemData?.items ||
          itemData?.data ||
          [];

      const categoryArray = Array.isArray(categoryData)
        ? categoryData
        : categoryData?.categories ||
          categoryData?.data ||
          [];

      setItems(
        Array.isArray(itemArray)
          ? itemArray
          : []
      );

      setCategories(
        Array.isArray(categoryArray)
          ? categoryArray
          : []
      );
    } catch (error) {
      console.error(
        "Edit Food Load Error:",
        error
      );

      setItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  // ================= CATEGORY NAME =================

  const getCategoryName = (item) => {
    if (item?.Category?.name) {
      return item.Category.name;
    }

    if (item?.category?.name) {
      return item.category.name;
    }

    const category = categories.find(
      (cat) =>
        String(cat.id) ===
        String(item?.category_id)
    );

    return category?.name || "Uncategorized";
  };

  // ================= SUB CATEGORY =================

  const getSubCategoryName = (item) => {
    if (item?.SubCategory?.name) {
      return item.SubCategory.name;
    }

    if (item?.subCategory?.name) {
      return item.subCategory.name;
    }

    if (item?.subcategory?.name) {
      return item.subcategory.name;
    }

    return "No Sub Category";
  };

  // ================= IMAGE =================

  const getImageUrl = (item) => {
    let image = "";

    if (
      Array.isArray(item?.images) &&
      item.images.length > 0
    ) {
      image = item.images[0];
    } else if (item?.image) {
      image = item.image;
    }

    if (!image) {
      return "";
    }

    const value = String(image);

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("blob:") ||
      value.startsWith("data:")
    ) {
      return value;
    }

    return `http://localhost:4000/${value.replace(
      /^\/+/,
      ""
    )}`;
  };

  // ================= GROUP FOOD =================

  const groupedFoods = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    const filteredItems = items.filter(
      (item) => {
        if (!keyword) {
          return true;
        }

        const foodName = String(
          item?.name || ""
        ).toLowerCase();

        const categoryName =
          getCategoryName(item).toLowerCase();

        const subCategoryName =
          getSubCategoryName(item).toLowerCase();

        return (
          foodName.includes(keyword) ||
          categoryName.includes(keyword) ||
          subCategoryName.includes(keyword)
        );
      }
    );

    return filteredItems.reduce(
      (groups, item) => {
        const categoryName =
          getCategoryName(item);

        if (!groups[categoryName]) {
          groups[categoryName] = [];
        }

        groups[categoryName].push(item);

        return groups;
      },
      {}
    );
  }, [
    items,
    categories,
    search,
  ]);

  const categoryNames =
    Object.keys(groupedFoods);

  // ================= OPEN FOOD DETAILS =================

  const handleEdit = (id) => {
    navigate(`/admin/foods/${id}`);
  };

  return (
    <div className="edit-food-page">

      {/* ================= HEADER ================= */}

      <div className="edit-food-header">

        <div className="edit-food-title-area">

          <button
            className="edit-food-back"
            onClick={() =>
              navigate("/admin")
            }
          >
            <HiArrowLeft />
            <span>
              Back to Dashboard
            </span>
          </button>

          <h1>Edit Food</h1>

          <p>
            Select a food item to edit
            its details
          </p>

        </div>

        <button
          className="edit-food-refresh"
          onClick={loadFoods}
          disabled={loading}
        >
          <HiArrowPath />
          <span>Refresh</span>
        </button>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="edit-food-search-box">

        <HiMagnifyingGlass />

        <input
          type="text"
          placeholder="Search food, category or sub category..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="edit-food-loading">

          <div className="edit-food-spinner"></div>

          <p>
            Loading food items...
          </p>

        </div>
      )}

      {/* ================= EMPTY ================= */}

      {!loading &&
        categoryNames.length === 0 && (
          <div className="edit-food-empty">

            <div className="empty-icon">
              🍽️
            </div>

            <h2>
              No Food Items Found
            </h2>

            <p>
              {search
                ? "No food items match your search."
                : "There are no food items available."}
            </p>

          </div>
        )}

      {/* ================= CATEGORY LIST ================= */}

      {!loading &&
        categoryNames.length > 0 && (
          <div className="edit-food-categories">

            {categoryNames.map(
              (categoryName) => (
                <section
                  className="edit-food-category"
                  key={categoryName}
                >

                  {/* CATEGORY HEADER */}

                  <div className="category-heading">

                    <div className="category-title">

                      <div className="category-icon">
                        🍴
                      </div>

                      <div>
                        <h2>
                          {categoryName}
                        </h2>

                        <span>
                          {
                            groupedFoods[
                              categoryName
                            ].length
                          }{" "}
                          food
                          {groupedFoods[
                            categoryName
                          ].length !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* FOOD LIST */}

                  <div className="edit-food-list">

                    {groupedFoods[
                      categoryName
                    ].map((item) => {

                      const imageUrl =
                        getImageUrl(item);

                      return (
                        <div
                          className="edit-food-item"
                          key={item.id}
                        >

                          {/* IMAGE */}

                          <div className="edit-food-image">

                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={
                                  item.name ||
                                  "Food"
                                }
                                onError={(e) => {
                                  e.currentTarget.style.display =
                                    "none";
                                  e.currentTarget.nextSibling.style.display =
                                    "flex";
                                }}
                              />
                            ) : null}

                            <div
                              className="no-food-image"
                              style={{
                                display:
                                  imageUrl
                                    ? "none"
                                    : "flex",
                              }}
                            >
                              🍽️
                            </div>

                          </div>

                          {/* FOOD INFO */}

                          <div className="edit-food-info">

                            <h3>
                              {item.name ||
                                "Unnamed Food"}
                            </h3>

                            <p className="edit-food-subcategory">
                              {getSubCategoryName(
                                item
                              )}
                            </p>

                            <div className="edit-food-meta">

                              <span className="edit-food-price">
                                ₹
                                {Number(
                                  item.price || 0
                                ).toFixed(2)}
                              </span>

                              {item.description && (
                                <span className="edit-food-description">
                                  {
                                    item.description
                                  }
                                </span>
                              )}

                            </div>

                          </div>

                          {/* EDIT BUTTON */}

                          <button
                            className="edit-food-button"
                            onClick={() =>
                              handleEdit(
                                item.id
                              )
                            }
                          >
                            <HiPencilSquare />
                            <span>
                              Edit
                            </span>
                          </button>

                        </div>
                      );
                    })}

                  </div>

                </section>
              )
            )}

          </div>
        )}

    </div>
  );
};

export default EditFood;