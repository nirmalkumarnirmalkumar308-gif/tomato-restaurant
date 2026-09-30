import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ExploreMenu.css";

import {
  menu_list,
} from "../../assets/assets/frontend_assets/assets";


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
   CATEGORY ROUTE NAME
===================================== */

const getCategoryRouteName = (categoryName) => {
  const normalized =
    normalizeCategory(categoryName);

  const categoryMap = {
    veg: "Veg",

    nonveg: "Non Veg",
    nonvegfood: "Non Veg",

    starters: "Starters",

    rice: "Rice",

    salad: "Salad",

    rolls: "Rolls",

    deserts: "Deserts",
    dessert: "Deserts",
    desserts: "Deserts",

    sandwich: "Sandwich",

    cake: "Cake",

    pureveg: "Pure Veg",

    pasta: "Pasta",

    noodles: "Noodles",
  };

  return (
    categoryMap[normalized] ||
    categoryName
  );
};


/* =====================================
   EXPLORE MENU
===================================== */

const ExploreMenu = () => {

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const navigate = useNavigate();


  /* ===================================
     CATEGORY CLICK
  =================================== */

  const handleCategoryClick = (
    categoryName
  ) => {

    const routeCategory =
      getCategoryRouteName(
        categoryName
      );

    console.log(
      "🍽️ CATEGORY CLICK:",
      {
        original:
          categoryName,

        route:
          routeCategory,

        normalized:
          normalizeCategory(
            routeCategory
          ),
      }
    );


    setSelectedCategory(
      routeCategory
    );


    navigate(
      `/category/${encodeURIComponent(
        routeCategory
      )}`
    );
  };


  /* ===================================
     RETURN
  =================================== */

  return (

    <div
      className="explore-menu"
      id="explore-menu"
    >

      {/* =================================
          TITLE
      ================================= */}

      <h1>
        Explore our menu
      </h1>


      {/* =================================
          DESCRIPTION
      ================================= */}

      <p className="explore-menu-text">

        Choose from our delicious
        categories and enjoy your
        favourite food.

      </p>


      {/* =================================
          CATEGORY LIST
      ================================= */}

      <div className="explore-menu-list">

        {Array.isArray(menu_list) &&
          menu_list.map(
            (item, index) => {

              const menuName =
                item?.menu_name ||
                "";

              const routeName =
                getCategoryRouteName(
                  menuName
                );


              return (

                <div
                  key={
                    `${routeName}-${index}`
                  }

                  className={`
                    explore-menu-list-item
                    ${
                      normalizeCategory(
                        selectedCategory
                      ) ===
                      normalizeCategory(
                        routeName
                      )
                        ? "active"
                        : ""
                    }
                  `}

                  onClick={() =>
                    handleCategoryClick(
                      menuName
                    )
                  }

                  role="button"

                  tabIndex={0}

                  onKeyDown={(event) => {

                    if (
                      event.key ===
                      "Enter"
                    ) {
                      handleCategoryClick(
                        menuName
                      );
                    }

                  }}
                >

                  {/* =========================
                      IMAGE
                  ========================= */}

                  <div className="category-image-wrapper">

                    <img
                      src={
                        item?.menu_image
                      }

                      alt={
                        menuName ||
                        "Food category"
                      }

                      loading="lazy"
                    />

                  </div>


                  {/* =========================
                      NAME
                  ========================= */}

                  <p>
                    {menuName}
                  </p>

                </div>

              );

            }
          )}

      </div>


      {/* =================================
          DIVIDER
      ================================= */}

      <hr />

    </div>

  );
};


export default ExploreMenu;