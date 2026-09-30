import React, { useContext, useMemo } from "react";

import "./FoodDisplay.css";

import FoodItem from "../FoodItem/FoodItem";

import { StoreContext } from "../../context/StoreContextContext.js";

const FoodDisplay = ({ category }) => {
  const { food_list, loading } = useContext(StoreContext);

  // =====================================================
  // NORMALIZE
  // =====================================================

  const normalize = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value)
      .trim()
      .toLowerCase();
  };

  // =====================================================
  // CATEGORY MAP
  // =====================================================

  const categoryMap = {
    veg: "1",

    "non veg": "2",
    "non-veg": "2",

    starters: "3",

    rice: "4",

    salad: "5",

    rolls: "6",

    deserts: "7",
    desserts: "7",

    sandwich: "8",

    cake: "9",

    "pure veg": "10",

    pasta: "11",

    noodles: "12",
  };

  // =====================================================
  // GET CATEGORY NAME
  // =====================================================

  const getCategoryName = (categoryValue) => {
    if (!categoryValue) {
      return "";
    }

    // If category is object
    if (typeof categoryValue === "object") {
      return normalize(
        categoryValue.name ??
          categoryValue.category_name ??
          categoryValue.title ??
          ""
      );
    }

    return normalize(categoryValue);
  };

  // =====================================================
  // GET CATEGORY ID
  // =====================================================

  const getCategoryId = (categoryValue) => {
    if (!categoryValue) {
      return "";
    }

    // If category is object
    if (typeof categoryValue === "object") {
      return normalize(
        categoryValue.id ??
          categoryValue.category_id ??
          categoryValue.categoryId ??
          ""
      );
    }

    // If number/string ID
    const value = normalize(categoryValue);

    if (/^\d+$/.test(value)) {
      return value;
    }

    return "";
  };

  // =====================================================
  // FILTER FOOD
  // =====================================================

  const filteredFoods = useMemo(() => {
    if (!Array.isArray(food_list)) {
      console.log(
        "❌ FOOD LIST IS NOT ARRAY:",
        food_list
      );

      return [];
    }

    // ===================================================
    // ALL
    // ===================================================

    if (
      category === null ||
      category === undefined
    ) {
      return food_list;
    }

    // ===================================================
    // SELECTED CATEGORY
    // ===================================================

    const selectedCategoryName =
      getCategoryName(category);

    const selectedCategoryObjectId =
      getCategoryId(category);

    const selectedCategoryId =
      selectedCategoryObjectId ||
      categoryMap[selectedCategoryName] ||
      "";

    console.log(
      "======================================"
    );

    console.log(
      "🍽️ SELECTED CATEGORY:",
      category
    );

    console.log(
      "📝 SELECTED CATEGORY NAME:",
      selectedCategoryName
    );

    console.log(
      "🆔 SELECTED CATEGORY ID:",
      selectedCategoryId
    );

    console.log(
      "📦 FOOD LIST COUNT:",
      food_list.length
    );

    // ===================================================
    // FILTER
    // ===================================================

    const filtered = food_list.filter((food) => {
      // -----------------------------------------------
      // FOOD CATEGORY ID
      // -----------------------------------------------

      const foodCategoryId =
        normalize(food?.category_id);

      const foodCategoryObjectId =
        normalize(food?.Category?.id);

      // -----------------------------------------------
      // FOOD CATEGORY NAME
      // -----------------------------------------------

      const foodCategoryName =
        getCategoryName(food?.category);

      const backendCategoryName =
        getCategoryName(food?.Category);

      const categoryNameFromBackend =
        normalize(food?.category_name);

      // -----------------------------------------------
      // ID MATCH
      // -----------------------------------------------

      const idMatch =
        selectedCategoryId !== "" &&
        (
          foodCategoryId ===
            selectedCategoryId ||
          foodCategoryObjectId ===
            selectedCategoryId
        );

      // -----------------------------------------------
      // NAME MATCH
      // -----------------------------------------------

      const nameMatch =
        selectedCategoryName !== "" &&
        (
          foodCategoryName ===
            selectedCategoryName ||
          backendCategoryName ===
            selectedCategoryName ||
          categoryNameFromBackend ===
            selectedCategoryName
        );

      const matched =
        idMatch || nameMatch;

      if (matched) {
        console.log(
          "✅ CATEGORY MATCH:",
          food.name,
          {
            foodCategoryId,
            foodCategoryName,
            backendCategoryName,
          }
        );
      }

      return matched;
    });

    console.log(
      "🎯 FILTERED FOOD COUNT:",
      filtered.length
    );

    console.log(
      "======================================"
    );

    return filtered;
  }, [food_list, category]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section
        className="food-display"
        id="food-display"
      >
        <div className="food-display-header">
          <span className="section-eyebrow">
            FRESH & TASTY
          </span>

          <h2>
            What are you craving?
          </h2>
        </div>

        <div className="food-display-grid">
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <div
                className="food-skeleton"
                key={index}
              >
                <div className="skeleton-image"></div>

                <div className="skeleton-line"></div>

                <div className="skeleton-line short"></div>

                <div className="skeleton-line price"></div>
              </div>
            )
          )}
        </div>
      </section>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <section
      className="food-display"
      id="food-display"
    >
      <div className="food-display-header">
        <span className="section-eyebrow">
          FRESH & TASTY
        </span>

        <h2>
          What are you craving?
        </h2>
      </div>

      {filteredFoods.length > 0 ? (
        <div className="food-display-grid">
          {filteredFoods.map((item) => (
            <FoodItem
              key={String(item.id)}
              id={item.id}
              name={item.name}
              price={item.price}
              description={item.description}
              image={item.image}
              images={item.images}
              availability={item.availability}
              stock_quantity={
                item.stock_quantity
              }
              category={item.category}
              category_id={item.category_id}
              sub_category={
                item.sub_category
              }
              sub_category_id={
                item.sub_category_id
              }
              restaurant_name={
                item.restaurant_name
              }
              food_type={item.food_type}
              is_popular={
                item.is_popular
              }
              is_featured={
                item.is_featured
              }
              preparation_time={
                item.preparation_time
              }
              spice_level={
                item.spice_level
              }
              rating={item.rating}
            />
          ))}
        </div>
      ) : (
        <div className="food-empty-state">
          <div className="empty-icon">
            🍽️
          </div>

          <h3>
            Nothing here yet
          </h3>

          <p>
            We're preparing something delicious
            for this category.
          </p>
        </div>
      )}
    </section>
  );
};

export default FoodDisplay;