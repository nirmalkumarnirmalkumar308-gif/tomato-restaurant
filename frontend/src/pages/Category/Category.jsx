import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "./Category.css";

import FoodItem from "../../components/FoodItem/FoodItem";

import {
  getItems,
  getCategories,
} from "../../api";


/* =====================================
   CATEGORY ID MAP
===================================== */

const categoryIdMap = {
  veg: 1,

  nonveg: 2,
  nonvegfood: 2,

  starters: 3,

  rice: 4,

  salad: 5,

  rolls: 6,

  deserts: 7,
  dessert: 7,
  desserts: 7,

  sandwich: 8,

  cake: 9,

  pureveg: 10,

  pasta: 11,

  noodles: 12,
};


/* =====================================
   NORMALIZE CATEGORY
===================================== */

const normalizeCategory = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/_/g, "");
};


/* =====================================
   GET CATEGORY ID FROM FOOD
===================================== */

const getFoodCategoryId = (food) => {

  if (!food) {
    return null;
  }


  /* DIRECT */

  const directId =
    food.category_id ??
    food.categoryId ??
    food.categoryID;

  if (
    directId !== null &&
    directId !== undefined &&
    directId !== ""
  ) {
    return Number(directId);
  }


  /* SEQUELIZE CATEGORY */

  const categoryId =
    food.Category?.id ??
    food.Category?.category_id;

  if (
    categoryId !== null &&
    categoryId !== undefined &&
    categoryId !== ""
  ) {
    return Number(categoryId);
  }


  /* LOWERCASE CATEGORY */

  const lowercaseCategoryId =
    food.category?.id ??
    food.category?.category_id;

  if (
    lowercaseCategoryId !== null &&
    lowercaseCategoryId !== undefined &&
    lowercaseCategoryId !== ""
  ) {
    return Number(lowercaseCategoryId);
  }


  return null;
};


/* =====================================
   GET CATEGORY NAME FROM FOOD
===================================== */

const getFoodCategoryName = (food) => {

  if (!food) {
    return "";
  }


  if (
    typeof food.category === "string"
  ) {
    return food.category;
  }


  if (
    typeof food.category_name === "string"
  ) {
    return food.category_name;
  }


  if (
    typeof food.categoryName === "string"
  ) {
    return food.categoryName;
  }


  if (
    typeof food.Category?.name === "string"
  ) {
    return food.Category.name;
  }


  if (
    typeof food.category?.name === "string"
  ) {
    return food.category.name;
  }


  return "";
};


/* =====================================
   IMAGE
===================================== */

const getFoodImage = (food) => {

  if (
    Array.isArray(food?.images) &&
    food.images.length > 0
  ) {
    return food.images[0];
  }


  if (
    typeof food?.images === "string"
  ) {

    try {

      const parsed =
        JSON.parse(food.images);

      if (
        Array.isArray(parsed) &&
        parsed.length > 0
      ) {
        return parsed[0];
      }

    } catch {

      return food.images;

    }
  }


  return (
    food?.image ||
    food?.image_url ||
    food?.imageUrl ||
    ""
  );
};


/* =====================================
   AVAILABILITY
===================================== */

const getFoodAvailability = (food) => {

  const stock = Number(
    food?.stock_quantity ??
    food?.stock
  );


  if (
    Number.isFinite(stock)
  ) {
    return stock > 0;
  }


  if (
    food?.availability !== undefined &&
    food?.availability !== null
  ) {

    return (
      food.availability === true ||
      food.availability === 1 ||
      food.availability === "1" ||
      food.availability === "true"
    );
  }


  return false;
};


/* =====================================
   CATEGORY COMPONENT
===================================== */

const Category = () => {

  const params = useParams();


  /*
    IMPORTANT

    Support all possible route names:

    /category/:category
    /category/:categoryName
    /categories/:category
  */

  const category =
    params.category ??
    params.categoryName ??
    params.name ??
    params.categoryId;


  const [items, setItems] =
    useState([]);


  const [categories, setCategories] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  /* ===================================
     LOAD DATA
  =================================== */

  useEffect(() => {

    loadData();

  }, [category]);


  const loadData = async () => {

    try {

      setLoading(true);


      const [
        itemsResponse,
        categoriesResponse,
      ] = await Promise.all([

        getItems(),

        getCategories(),

      ]);


      /* ================================
         ITEMS
      ================================= */

      const itemList =
        Array.isArray(itemsResponse)
          ? itemsResponse
          : Array.isArray(
              itemsResponse?.items
            )
          ? itemsResponse.items
          : Array.isArray(
              itemsResponse?.data
            )
          ? itemsResponse.data
          : [];


      /* ================================
         CATEGORIES
      ================================= */

      const categoryList =
        Array.isArray(
          categoriesResponse
        )
          ? categoriesResponse
          : Array.isArray(
              categoriesResponse?.categories
            )
          ? categoriesResponse.categories
          : Array.isArray(
              categoriesResponse?.data
            )
          ? categoriesResponse.data
          : [];


      setItems(itemList);

      setCategories(categoryList);


      console.log(
        "======================================"
      );

      console.log(
        "📂 CATEGORY PAGE DATA"
      );

      console.log(
        "ROUTE PARAMS:",
        params
      );

      console.log(
        "CATEGORY PARAM:",
        category
      );

      console.log(
        "ITEM COUNT:",
        itemList.length
      );

      console.log(
        "CATEGORY COUNT:",
        categoryList.length
      );

      console.log(
        "======================================"
      );

    } catch (error) {

      console.error(
        "❌ CATEGORY PAGE ERROR:",
        error
      );

      setItems([]);

      setCategories([]);

    } finally {

      setLoading(false);

    }
  };


  /* =====================================
     CURRENT CATEGORY NAME
  ===================================== */

  const currentCategoryName =
    category
      ? decodeURIComponent(
          String(category)
        ).trim()
      : "Menu";


  /* =====================================
     NORMALIZED NAME
  ===================================== */

  const normalizedCurrentCategory =
    normalizeCategory(
      currentCategoryName
    );


  /* =====================================
     FIND CATEGORY
  ===================================== */

  const currentCategory =
    categories.find((cat) => {

      return (
        normalizeCategory(
          cat?.name
        ) ===
        normalizedCurrentCategory
      );

    });


  /* =====================================
     CATEGORY ID
  ===================================== */

  const currentCategoryId =
    currentCategory?.id ??
    categoryIdMap[
      normalizedCurrentCategory
    ] ??
    null;


  /* =====================================
     DEBUG
  ===================================== */

  console.log(
    "======================================"
  );

  console.log(
    "🎯 CURRENT CATEGORY:"
  );

  console.log({
    routeParams: params,

    urlValue: category,

    categoryName:
      currentCategoryName,

    normalized:
      normalizedCurrentCategory,

    databaseCategory:
      currentCategory,

    categoryId:
      currentCategoryId,
  });


  /* =====================================
     FILTER FOOD
  ===================================== */

  const categoryFoodItems =
    items.filter((food) => {

      if (
        currentCategoryId === null ||
        currentCategoryId === undefined
      ) {
        return false;
      }


      const foodCategoryId =
        getFoodCategoryId(food);


      const foodCategoryName =
        normalizeCategory(
          getFoodCategoryName(food)
        );


      const categoryIdMatch =
        Number(foodCategoryId) ===
        Number(currentCategoryId);


      const categoryNameMatch =
        foodCategoryName ===
        normalizedCurrentCategory;


      return (
        categoryIdMatch ||
        categoryNameMatch
      );

    });


  /* =====================================
     REMOVE DUPLICATES
  ===================================== */

  const uniqueCategoryFoodItems = [];

  const usedIds = new Set();


  categoryFoodItems.forEach(
    (food) => {

      const foodId =
        food?.id ??
        food?._id;


      if (
        foodId === null ||
        foodId === undefined
      ) {
        return;
      }


      const id =
        String(foodId);


      if (
        !usedIds.has(id)
      ) {

        usedIds.add(id);

        uniqueCategoryFoodItems.push(
          food
        );

      }

    }
  );


  /* =====================================
     FINAL FILTER DEBUG
  ===================================== */

  console.log(
    "======================================"
  );

  console.log(
    "🎯 FILTER RESULT:"
  );

  console.log(
    "CATEGORY:",
    currentCategoryName
  );

  console.log(
    "CATEGORY ID:",
    currentCategoryId
  );

  console.log(
    "MATCHED ITEMS:",
    uniqueCategoryFoodItems.length
  );


  uniqueCategoryFoodItems.forEach(
    (food) => {

      console.log(
        "✅",
        food.name,
        "→",
        {
          id:
            food.id,

          category:
            getFoodCategoryName(
              food
            ),

          categoryId:
            getFoodCategoryId(
              food
            ),
        }
      );

    }
  );


  console.log(
    "======================================"
  );


  /* =====================================
     RETURN
  ===================================== */

  return (

    <div className="category-page">

      {/* =================================
          HERO
      ================================= */}

      <section className="category-hero">

        <div className="category-hero-content">

          <div className="category-eyebrow">

            <span></span>

            EXPLORE OUR MENU

            <span></span>

          </div>


          <h1>

            Delicious{" "}

            <strong>
              {currentCategoryName}
            </strong>{" "}

            for You

          </h1>


          <p>

            Discover delicious food
            specially selected for you.

          </p>


          {!loading &&
            uniqueCategoryFoodItems.length >
              0 && (

              <div className="category-result-text">

                <span className="result-dot"></span>

                {
                  uniqueCategoryFoodItems.length
                }{" "}

                delicious items waiting
                for you

              </div>

            )}

        </div>

      </section>


      {/* =================================
          FOOD SECTION
      ================================= */}

      <section className="category-food-section">

        <div className="category-section-heading">

          <div>

            <span className="section-mini-title">
              FRESH & TASTY
            </span>

            <h2>
              What are you craving?
            </h2>

          </div>


          {!loading &&
            uniqueCategoryFoodItems.length >
              0 && (

              <span className="food-count">

                {
                  uniqueCategoryFoodItems.length
                }{" "}

                Items

              </span>

            )}

        </div>


        {/* =================================
            LOADING
        ================================= */}

        {loading && (

          <div className="category-loading">

            <div className="loading-spinner"></div>

            <p>
              Finding delicious food
              for you...
            </p>

          </div>

        )}


        {/* =================================
            NO FOOD
        ================================= */}

        {!loading &&
          uniqueCategoryFoodItems.length ===
            0 && (

            <div className="no-food">

              <div className="no-food-icon">
                🍽️
              </div>

              <h3>
                Nothing here yet
              </h3>

              <p>
                We're preparing something
                delicious for this category.
              </p>

            </div>

          )}


        {/* =================================
            FOOD GRID
        ================================= */}

        {!loading &&
          uniqueCategoryFoodItems.length >
            0 && (

            <div className="category-food-grid">

              {uniqueCategoryFoodItems.map(
                (food) => {

                  const foodId =
                    food?.id ??
                    food?._id;


                  const foodAvailability =
                    getFoodAvailability(
                      food
                    );


                  return (

                    <div
                      className="category-food-card"
                      key={String(foodId)}
                    >

                      {/* ==========================
                          POPULAR
                      ========================== */}

                      {(
                        food?.is_popular ||
                        food?.isPopular
                      ) && (

                        <div className="popular-badge">

                          ⭐ Popular

                        </div>

                      )}


                      {/* ==========================
                          FOOD ITEM
                      ========================== */}

                      <FoodItem

                        id={foodId}

                        name={
                          food?.name
                        }

                        price={
                          food?.price
                        }

                        description={
                          food?.description ||
                          ""
                        }

                        image={
                          getFoodImage(
                            food
                          )
                        }

                        images={
                          food?.images
                        }

                        availability={
                          foodAvailability
                        }

                        is_popular={
                          food?.is_popular ??
                          food?.isPopular
                        }

                        is_featured={
                          food?.is_featured ??
                          food?.isFeatured
                        }

                      />

                    </div>

                  );

                }
              )}

            </div>

          )}


        {/* =================================
            BOTTOM CTA
        ================================= */}

        {!loading &&
          uniqueCategoryFoodItems.length >
            0 && (

            <section className="category-bottom-cta">

              <div>

                <span>
                  HUNGRY ALREADY?
                </span>

                <h2>

                  Your next favourite dish
                  is waiting for you.

                </h2>

                <p>

                  Freshly prepared.
                  Deliciously delivered.

                </p>

              </div>


              <div className="cta-emoji">
                🍕
              </div>

            </section>

          )}

      </section>

    </div>

  );
};


export default Category;