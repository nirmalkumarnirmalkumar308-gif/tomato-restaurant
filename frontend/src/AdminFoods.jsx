import React, { useEffect, useMemo, useState } from "react";

import {
  HiPencil,
  HiTrash,
  HiPlus,
  HiArrowPath,
  HiMagnifyingGlass,
  HiXMark,
} from "react-icons/hi2";

import {
  getItems,
  deleteItem,
  syncDefaultItems,
} from "./api";

import {
  food_list as staticFoodList,
} from "./assets/assets/frontend_assets/assets";

import "./AdminFoods.css";

import AdminBackButton from "./AdminBackButton";

const AdminFoods = () => {
  // =====================================================
  // STATES
  // =====================================================

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // GET STATIC IMAGE
  // =====================================================

  const getStaticImage = (foodName) => {
    if (!foodName || !Array.isArray(staticFoodList)) {
      return "";
    }

    const targetName = String(foodName)
      .trim()
      .toLowerCase();

    const found = staticFoodList.find((food) => {
      const staticName = String(food?.name || "")
        .trim()
        .toLowerCase();

      return staticName === targetName;
    });

    return found?.image || "";
  };

  // =====================================================
  // GET IMAGE URL
  // =====================================================

  const getImageUrl = (image, foodName = "") => {
    let imageValue = String(
      image || getStaticImage(foodName) || ""
    ).trim();

    if (!imageValue) {
      return "";
    }

    // Full URL
    if (
      imageValue.startsWith("http://") ||
      imageValue.startsWith("https://")
    ) {
      return imageValue;
    }

    // Base64 image
    if (imageValue.startsWith("data:image")) {
      return imageValue;
    }

    // Frontend/static path
    if (
      imageValue.startsWith("/assets/") ||
      imageValue.startsWith("/src/")
    ) {
      return imageValue;
    }

    // Already absolute frontend/backend path
    if (imageValue.startsWith("/")) {
      if (imageValue.startsWith("/uploads/")) {
        return `http://localhost:4000${imageValue}`;
      }

      return imageValue;
    }

    // Remove unnecessary leading slashes
    const cleanImage = imageValue.replace(/^\/+/, "");

    // Backend uploaded image
    if (cleanImage.startsWith("uploads/")) {
      return `http://localhost:4000/${cleanImage}`;
    }

    return `http://localhost:4000/uploads/${cleanImage}`;
  };

  // =====================================================
  // CATEGORY NAME
  // =====================================================

  const getCategoryName = (item) => {
    return (
      item?.Category?.name ||
      item?.category?.name ||
      item?.category_name ||
      item?.category ||
      "-"
    );
  };

  // =====================================================
  // SUB CATEGORY NAME
  // =====================================================

  const getSubCategoryName = (item) => {
    return (
      item?.SubCategory?.name ||
      item?.subCategory?.name ||
      item?.sub_category?.name ||
      item?.subcategory?.name ||
      item?.sub_category_name ||
      item?.subCategory ||
      item?.sub_category ||
      "-"
    );
  };

  // =====================================================
  // REMOVE DUPLICATES
  // =====================================================

  const removeDuplicateFoods = (foodItems) => {
    const seen = new Set();

    return foodItems.filter((item) => {
      const name = String(item?.name || "")
        .trim()
        .toLowerCase();

      const category = String(
        getCategoryName(item) || ""
      )
        .trim()
        .toLowerCase();

      const key = `${name}-${category}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
  };

  // =====================================================
  // LOAD ITEMS
  // =====================================================

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------------------------
      // Sync default food items
      // -------------------------------------------------

      if (
        Array.isArray(staticFoodList) &&
        staticFoodList.length > 0
      ) {
        try {
          await syncDefaultItems(staticFoodList);
        } catch (syncError) {
          console.warn(
            "Default food sync skipped:",
            syncError
          );
        }
      }

      // -------------------------------------------------
      // Get all food items
      // -------------------------------------------------

      const response = await getItems();

      console.log(
        "GET ITEMS RESPONSE:",
        response
      );

      // -------------------------------------------------
      // Handle different API response formats
      // -------------------------------------------------

      let foodItems = [];

      if (Array.isArray(response)) {
        foodItems = response;
      } else if (Array.isArray(response?.data)) {
        foodItems = response.data;
      } else if (Array.isArray(response?.items)) {
        foodItems = response.items;
      } else if (
        Array.isArray(response?.data?.items)
      ) {
        foodItems = response.data.items;
      }

      console.log(
        "TOTAL ITEMS FROM API:",
        foodItems.length
      );

      console.log(
        "ALL ITEMS:",
        foodItems
      );

      // -------------------------------------------------
      // Normalize items
      // -------------------------------------------------

      const normalizedItems = foodItems.map(
        (item) => {
          const staticImage = getStaticImage(
            item?.name
          );

          return {
            ...item,

            id: String(item?.id),

            image:
              item?.image ||
              item?.image_url ||
              item?.imageUrl ||
              staticImage ||
              "",
          };
        }
      );

      // -------------------------------------------------
      // Remove duplicates
      // -------------------------------------------------

      const uniqueItems =
        removeDuplicateFoods(
          normalizedItems
        );

      console.log(
        "UNIQUE FOOD ITEMS:",
        uniqueItems.length
      );

      setItems(uniqueItems);
    } catch (err) {
      console.error(
        "Error loading food items:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load food items."
      );

      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {
    loadItems();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredItems = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return items;
    }

    return items.filter((item) => {
      const name = String(
        item?.name || ""
      ).toLowerCase();

      const category = String(
        getCategoryName(item) || ""
      ).toLowerCase();

      const subCategory = String(
        getSubCategoryName(item) || ""
      ).toLowerCase();

      const restaurant = String(
        item?.restaurant_name || ""
      ).toLowerCase();

      return (
        name.includes(search) ||
        category.includes(search) ||
        subCategory.includes(search) ||
        restaurant.includes(search)
      );
    });
  }, [items, searchTerm]);

  // =====================================================
  // DELETE FOOD
  // =====================================================

  const handleDelete = async (item) => {
    if (!item?.id) {
      alert("Food ID not found.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(String(item.id));

      await deleteItem(item.id);

      // Remove from UI immediately
      setItems((previousItems) =>
        previousItems.filter(
          (food) =>
            String(food.id) !==
            String(item.id)
        )
      );

      alert(
        "Food item deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete food error:",
        err
      );

      alert(
        err?.response?.data?.message ||
          "Failed to delete food item."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // EDIT FOOD
  // =====================================================

  const handleEdit = (item) => {
    if (!item?.id) {
      alert("Food ID not found.");
      return;
    }

    window.location.href =
      `/admin/foods/${item.id}`;
  };

  // =====================================================
  // ADD FOOD
  // =====================================================

  const handleAddFood = () => {
    window.location.href =
      "/admin/add-food";
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    if (!loading) {
      loadItems();
    }
  };

  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // =====================================================
  // IMAGE ERROR
  // =====================================================

  const handleImageError = (
    event,
    foodName
  ) => {
    const imageElement =
      event.currentTarget;

    const fallbackImage =
      getStaticImage(foodName);

    // Try static image only once
    if (
      fallbackImage &&
      !imageElement.dataset
        .fallbackUsed
    ) {
      imageElement.dataset.fallbackUsed =
        "true";

      imageElement.src =
        fallbackImage;

      return;
    }

    // Hide broken image
    imageElement.style.display =
      "none";

    const parent =
      imageElement.parentElement;

    if (parent) {
      parent.innerHTML = `
        <div class="no-image">
          No Image
        </div>
      `;
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-foods-page">

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <AdminBackButton />

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-foods-header">

        <div className="admin-foods-title-section">
          <h1>
            Food Items
          </h1>

          <p>
            Manage your complete food menu,
            categories, prices and food images.
          </p>
        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="admin-foods-actions">

          <button
            type="button"
            className="refresh-food-button"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh Food Items"
          >
            <HiArrowPath />

            {loading
              ? "Loading..."
              : "Refresh"}
          </button>

          <button
            type="button"
            className="add-food-button"
            onClick={handleAddFood}
          >
            <HiPlus />
            Add Food
          </button>

        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="foods-error">
          {error}
        </div>
      )}

      {/* =================================================
          SEARCH + COUNT
      ================================================= */}

      {!loading && (
        <div className="foods-toolbar">

          <div className="foods-count">
            <strong>
              {filteredItems.length}
            </strong>

            <span>
              {filteredItems.length === 1
                ? " Food Item"
                : " Food Items"}
            </span>
          </div>

          <div className="foods-search-box">

            <HiMagnifyingGlass />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search food, restaurant, category..."
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search-button"
                onClick={
                  handleClearSearch
                }
                title="Clear Search"
              >
                <HiXMark />
              </button>
            )}

          </div>
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (
        <div className="foods-loading">
          Loading food items...
        </div>
      ) : (
        <>
          {/* =================================================
              TABLE
          ================================================= */}

          <div className="foods-table-container">

            <table className="foods-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Food Name</th>
                  <th>Restaurant</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredItems.length === 0 ? (

                  <tr>
                    <td
                      colSpan="8"
                      className="no-foods"
                    >
                      {searchTerm
                        ? "No food items match your search."
                        : "No food items found."}
                    </td>
                  </tr>

                ) : (

                  filteredItems.map(
                    (item, index) => {

                      const imageUrl =
                        getImageUrl(
                          item?.image,
                          item?.name
                        );

                      const isDeleting =
                        String(
                          deletingId
                        ) ===
                        String(item?.id);

                      return (
                        <tr
                          key={
                            item?.id ||
                            `${item?.name}-${index}`
                          }
                        >

                          {/* NUMBER */}

                          <td>
                            {index + 1}
                          </td>

                          {/* IMAGE */}

                          <td>
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={
                                  item?.name ||
                                  "Food"
                                }
                                className="food-item-image"
                                loading="lazy"
                                onError={(
                                  event
                                ) =>
                                  handleImageError(
                                    event,
                                    item?.name
                                  )
                                }
                              />
                            ) : (
                              <div className="no-image">
                                No Image
                              </div>
                            )}
                          </td>

                          {/* FOOD NAME */}

                          <td className="food-name">
                            {item?.name ||
                              "Unnamed Food"}
                          </td>

                          {/* RESTAURANT */}

                          <td>
                            {item?.restaurant_name ||
                              item?.restaurantName ||
                              "-"}
                          </td>

                          {/* CATEGORY */}

                          <td>
                            {getCategoryName(
                              item
                            )}
                          </td>

                          {/* SUB CATEGORY */}

                          <td>
                            {getSubCategoryName(
                              item
                            )}
                          </td>

                          {/* PRICE */}

                          <td className="food-price">
                            ₹
                            {Number(
                              item?.price || 0
                            ).toFixed(2)}
                          </td>

                          {/* ACTIONS */}

                          <td>
                            <div className="food-actions">

                              {/* EDIT */}

                              <button
                                type="button"
                                className="edit-food-button"
                                onClick={() =>
                                  handleEdit(
                                    item
                                  )
                                }
                                title="Edit Food"
                                disabled={
                                  isDeleting
                                }
                              >
                                <HiPencil />
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                className="delete-food-button"
                                onClick={() =>
                                  handleDelete(
                                    item
                                  )
                                }
                                title="Delete Food"
                                disabled={
                                  isDeleting
                                }
                              >
                                {isDeleting ? (
                                  <HiArrowPath className="delete-loading-icon" />
                                ) : (
                                  <HiTrash />
                                )}
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>
            </table>
          </div>

          {/* =================================================
              FOOTER COUNT
          ================================================= */}

          {items.length > 0 && (
            <div className="foods-result-footer">

              Showing{" "}

              <strong>
                {filteredItems.length}
              </strong>

              {" "}of{" "}

              <strong>
                {items.length}
              </strong>

              {" "}
              food items

              {searchTerm && (
                <button
                  type="button"
                  onClick={
                    handleClearSearch
                  }
                  className="clear-search-text"
                >
                  Clear search
                </button>
              )}

            </div>
          )}

        </>
      )}
    </div>
  );
};

export default AdminFoods;