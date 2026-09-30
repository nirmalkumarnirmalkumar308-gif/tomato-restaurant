import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import "./PopularFood.css";
import FoodItem from "../FoodItem/FoodItem";
import { StoreContext } from "../../context/StoreContext.jsx";

const PopularFood = ({ searchText = "" }) => {
  const { food_list = [], loading } =
    useContext(StoreContext);

  const [liveSearch, setLiveSearch] = useState(
    searchText ||
      localStorage.getItem("foodSearch") ||
      ""
  );

  // =====================================================
  // SCROLL TO MENU
  // =====================================================

  const scrollToMenu = () => {
    const menuSection =
      document.getElementById("menu-section");

    if (menuSection) {
      menuSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // =====================================================
  // SEARCH PARAM UPDATE
  // =====================================================

  useEffect(() => {
    setLiveSearch(searchText || "");
  }, [searchText]);

  // =====================================================
  // CUSTOM SEARCH EVENT
  // =====================================================

  useEffect(() => {
    const handleFoodSearch = (event) => {
      const value = event.detail || "";

      setLiveSearch(value);

      if (value) {
        setTimeout(() => {
          const popularSection =
            document.getElementById(
              "popular-section"
            );

          if (popularSection) {
            popularSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      }
    };

    window.addEventListener(
      "foodSearch",
      handleFoodSearch
    );

    return () => {
      window.removeEventListener(
        "foodSearch",
        handleFoodSearch
      );
    };
  }, []);

  // =====================================================
  // NORMALIZE AVAILABILITY
  // =====================================================

  const normalizeAvailability = (value) => {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value === 1;
    }

    if (typeof value === "string") {
      const normalized = value
        .trim()
        .toLowerCase();

      if (
        normalized === "1" ||
        normalized === "true" ||
        normalized === "yes" ||
        normalized === "available" ||
        normalized === "active" ||
        normalized === "on"
      ) {
        return true;
      }

      if (
        normalized === "0" ||
        normalized === "false" ||
        normalized === "no" ||
        normalized === "unavailable" ||
        normalized === "not available" ||
        normalized === "inactive" ||
        normalized === "sold out" ||
        normalized === "soldout" ||
        normalized === "off" ||
        normalized === ""
      ) {
        return false;
      }
    }

    return false;
  };

  // =====================================================
  // IMPORTANT:
  // HOME PAGE SHOULD SHOW ONLY AVAILABLE ITEMS
  // AND ITEMS WITH STOCK > 0
  // =====================================================

  const isFoodAvailable = (item) => {
    if (!item) {
      return false;
    }

    /*
      StoreContext has:
      
      availability =
        database availability === true
        AND stock > 0

      So both conditions are checked again here.
    */

    const availability = normalizeAvailability(
      item.availability
    );

    const stock = Number(
      item.stock_quantity
    );

    const validStock =
      Number.isFinite(stock)
        ? stock
        : 0;

    // Not available in database
    if (!availability) {
      return false;
    }

    // No stock
    if (validStock <= 0) {
      return false;
    }

    return true;
  };

  // =====================================================
  // CATEGORY NAME
  // =====================================================

  const getCategoryName = (item) => {
    if (!item) {
      return "";
    }

    if (
      typeof item.category === "object" &&
      item.category !== null
    ) {
      return String(
        item.category?.name || ""
      )
        .trim()
        .toLowerCase();
    }

    return String(
      item.category ||
        item.category_name ||
        item.Category?.name ||
        ""
    )
      .trim()
      .toLowerCase();
  };

  // =====================================================
  // FILTER + SEARCH
  // =====================================================

  const filteredFoods = useMemo(() => {
    let search = String(
      liveSearch || ""
    )
      .trim()
      .toLowerCase();

    // ===================================================
    // SEARCH SPELLING CORRECTIONS
    // ===================================================

    const spellingCorrections = {
      panner: "paneer",
      paner: "paneer",
      panir: "paneer",

      chiken: "chicken",
      chikn: "chicken",
      chikken: "chicken",

      sald: "salad",

      pastaa: "pasta",

      noddles: "noodles",
      nudles: "noodles",

      sandwitch: "sandwich",

      biriyani: "biryani",
      biriyaniy: "biryani",
    };

    if (spellingCorrections[search]) {
      search =
        spellingCorrections[search];
    }

    // ===================================================
    // ONLY AVAILABLE FOOD
    // ===================================================

    const availableFoods =
      food_list.filter((item) =>
        isFoodAvailable(item)
      );

    // ===================================================
    // SEARCH MODE
    // ===================================================

    if (search) {
      const words = search
        .split(" ")
        .filter(Boolean);

      return availableFoods.filter(
        (item) => {
          const name = String(
            item.name || ""
          ).toLowerCase();

          const description =
            String(
              item.description || ""
            ).toLowerCase();

          const category =
            getCategoryName(item);

          const subCategory =
            typeof item.sub_category ===
            "object" &&
            item.sub_category !== null
              ? String(
                  item.sub_category
                    ?.name || ""
                ).toLowerCase()
              : String(
                  item.sub_category ||
                    item.subCategory ||
                    item.sub_category_name ||
                    ""
                ).toLowerCase();

          const foodType =
            String(
              item.food_type || ""
            ).toLowerCase();

          const restaurant =
            String(
              item.restaurant_name ||
                ""
            ).toLowerCase();

          const searchableText = `
            ${name}
            ${description}
            ${category}
            ${subCategory}
            ${foodType}
            ${restaurant}
          `.toLowerCase();

          return words.every(
            (word) =>
              searchableText.includes(
                word
              )
          );
        }
      );
    }

    // ===================================================
    // MIX DIFFERENT CATEGORIES
    // ===================================================

    const categoryMap = new Map();

    availableFoods.forEach(
      (item) => {
        const category =
          getCategoryName(item) ||
          "other";

        if (
          !categoryMap.has(category)
        ) {
          categoryMap.set(
            category,
            []
          );
        }

        categoryMap
          .get(category)
          .push(item);
      }
    );

    const mixedFoods = [];

    const categoryArrays =
      Array.from(
        categoryMap.values()
      );

    // Shuffle categories
    const shuffledCategories =
      [...categoryArrays].sort(
        () => Math.random() - 0.5
      );

    let index = 0;

    while (
      mixedFoods.length < 12
    ) {
      let added = false;

      for (
        const categoryFoods of
          shuffledCategories
      ) {
        if (
          categoryFoods[index]
        ) {
          mixedFoods.push(
            categoryFoods[index]
          );

          added = true;
        }

        if (
          mixedFoods.length >= 12
        ) {
          break;
        }
      }

      if (!added) {
        break;
      }

      index++;
    }

    return mixedFoods;
  }, [food_list, liveSearch]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="popular-food">
        <div className="popular-food-title">
          <h1>
            Loading food items...
          </h1>

          <p>
            Please wait while we prepare
            your menu.
          </p>
        </div>

        <div className="popular-food-list">
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              className="food-skeleton"
              key={index}
            >
              <div className="skeleton-image" />

              <div className="skeleton-content">
                <div className="skeleton-line large" />
                <div className="skeleton-line" />
                <div className="skeleton-line small" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="popular-food"
      id="popular-food"
    >
      {/* =================================================
          TITLE
      ================================================= */}

      <div className="popular-food-title">
        <span className="popular-section-label">
          OUR MENU
        </span>

        <h1>
          {liveSearch
            ? `Search Results for "${liveSearch}"`
            : "Explore Our Popular Dishes"}
        </h1>

        <p>
          {liveSearch
            ? `Found ${filteredFoods.length} food item${
                filteredFoods.length !== 1
                  ? "s"
                  : ""
              } matching your search.`
            : "A delicious mix of favourites from different categories, freshly prepared just for you."}
        </p>
      </div>

      {/* =================================================
          NO FOOD
      ================================================= */}

      {filteredFoods.length === 0 ? (
        <div className="no-food-found">
          <div className="no-food-icon">
            🔍
          </div>

          <h3>
            No food items found
          </h3>

          <p>
            Try searching for Chicken,
            Paneer, Biryani, Pizza,
            Salad or Pasta.
          </p>

          {liveSearch && (
            <button
              onClick={() => {
                setLiveSearch("");

                localStorage.removeItem(
                  "foodSearch"
                );

                window.dispatchEvent(
                  new CustomEvent(
                    "foodSearch",
                    {
                      detail: "",
                    }
                  )
                );
              }}
            >
              View Popular Dishes
            </button>
          )}
        </div>
      ) : (
        /* =================================================
           FOOD LIST
        ================================================= */

        <div className="popular-food-list">
          {filteredFoods.map(
            (item, index) => (
              <FoodItem
                key={
                  item.id ||
                  item._id ||
                  `${item.name}-${index}`
                }
                id={
                  item.id ||
                  item._id
                }
                name={item.name}
                price={item.price}
                description={
                  item.description
                }
                image={item.image}
                images={item.images}
                availability={
                  item.availability
                }
                stock_quantity={
                  item.stock_quantity
                }
                food_type={
                  item.food_type
                }
                foodType={
                  item.foodType
                }
                preparation_time={
                  item.preparation_time
                }
                preparationTime={
                  item.preparationTime
                }
                is_popular={
                  item.is_popular
                }
                isPopular={
                  item.isPopular
                }
                restaurant_name={
                  item.restaurant_name
                }
              />
            )
          )}
        </div>
      )}

      {/* =================================================
          EXPLORE ALL BUTTON
      ================================================= */}

      {!liveSearch &&
        filteredFoods.length > 0 && (
          <div className="popular-food-button-container">
            <button
              className="popular-food-button"
              onClick={scrollToMenu}
            >
              <span>
                Explore All Dishes
              </span>

              <span className="view-all-arrow">
                →
              </span>
            </button>
          </div>
        )}
    </div>
  );
};

export default PopularFood;