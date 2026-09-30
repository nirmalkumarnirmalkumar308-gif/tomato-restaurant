import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

// =====================================================
// CUSTOMER COMPONENTS
// =====================================================

import Navbar from "./components/Navbar/navbar";
import Footer from "./components/Footer/Footer";
import AppDownload from "./components/App download/App download";
import Loginpopup from "./components/Loginpopup/Loginpopup";

// =====================================================
// CUSTOMER PAGES
// =====================================================

import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import Placeorder from "./pages/Placeorder/Placeorder";
import Category from "./pages/Category/Category";
import FoodView from "./pages/FoodView/FoodView";
import Wishlist from "./pages/Wishlist/Wishlist";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "./AdminDashboard";
import AddFood from "./AddFood";
import AdminFoods from "./AdminFoods";
import AdminOrders from "./AdminOrders";
import AdminCategories from "./AdminCategories";
import AdminUsers from "./AdminUsers";
import AdminAnalytics from "./AdminAnalytics";
import AdminSettings from "./AdminSettings";
import AdminSubCategories from "./AdminSubCategories";
import EditFood from "./EditFood/EditFood";
import FoodDetails from "./FoodDetails";

// =====================================================
// APP
// =====================================================

const App = () => {
  const location = useLocation();

  const [showLogin, setShowLogin] = useState(false);

  // =====================================================
  // OPEN LOGIN POPUP EVENT
  // =====================================================

  useEffect(() => {
    const handleOpenLogin = () => {
      setShowLogin(true);
    };

    window.addEventListener("openLogin", handleOpenLogin);

    return () => {
      window.removeEventListener("openLogin", handleOpenLogin);
    };
  }, []);

  // =====================================================
  // CLOSE LOGIN POPUP WHEN ROUTE CHANGES
  // =====================================================

  useEffect(() => {
    setShowLogin(false);
  }, [location.pathname]);

  // =====================================================
  // ADMIN ROUTES
  // =====================================================

  const isAdminRoute =
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");

  // =====================================================
  // CUSTOMER ROUTES
  // =====================================================

  const isCustomerRoute = !isAdminRoute;

  return (
    <>
      {/* =================================================
          CUSTOMER NAVBAR
      ================================================= */}

      {isCustomerRoute && (
        <Navbar setShowLogin={setShowLogin} />
      )}

      {/* =================================================
          ROUTES
      ================================================= */}

      <Routes>

        {/* =================================================
            CUSTOMER
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/place-order"
          element={<Placeorder />}
        />

        {/* CATEGORY
            Example:
            /category/Veg
            /category/Cake
            /category/Noodles
        */}

        <Route
          path="/category/:category"
          element={<Category />}
        />

        {/* FOOD DETAILS */}

        <Route
          path="/food/:id"
          element={<FoodView />}
        />

        {/* WISHLIST */}

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* =================================================
            ADMIN FOOD ITEMS
        ================================================= */}

        <Route
          path="/admin/foods"
          element={<AdminFoods />}
        />

        {/* =================================================
            ADMIN ADD FOOD
        ================================================= */}

        <Route
          path="/admin/add-food"
          element={<AddFood />}
        />

        {/* OLD URL SUPPORT */}

        <Route
          path="/add-food"
          element={
            <Navigate
              to="/admin/add-food"
              replace
            />
          }
        />

        {/* =================================================
            ADMIN EDIT FOOD
        ================================================= */}

        <Route
          path="/admin/edit-food"
          element={<EditFood />}
        />

        {/* =================================================
            ADMIN FOOD DETAILS
        ================================================= */}

        <Route
          path="/admin/foods/:id"
          element={<FoodDetails />}
        />

        {/* =================================================
            ADMIN ORDERS
        ================================================= */}

        <Route
          path="/admin/orders"
          element={<AdminOrders />}
        />

        {/* =================================================
            ADMIN CATEGORIES
        ================================================= */}

        <Route
          path="/admin/categories"
          element={<AdminCategories />}
        />

        {/* =================================================
            ADMIN SUB CATEGORIES
        ================================================= */}

        <Route
          path="/admin/subcategories"
          element={<AdminSubCategories />}
        />

        {/* =================================================
            ADMIN USERS
        ================================================= */}

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        {/* =================================================
            ADMIN ANALYTICS
        ================================================= */}

        <Route
          path="/admin/analytics"
          element={<AdminAnalytics />}
        />

        {/* =================================================
            ADMIN SETTINGS
        ================================================= */}

        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />

        {/* =================================================
            OLD / FALLBACK ROUTES
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />

        {/* =================================================
            404 FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={
            isAdminRoute ? (
              <Navigate
                to="/admin/dashboard"
                replace
              />
            ) : (
              <Navigate
                to="/"
                replace
              />
            )
          }
        />

      </Routes>

      {/* =================================================
          CUSTOMER FOOTER
          
          Never shown inside admin pages
      ================================================= */}

      {isCustomerRoute && (
        <>
          <AppDownload />
          <Footer />
        </>
      )}

      {/* =================================================
          LOGIN POPUP
      ================================================= */}

      {showLogin && (
        <Loginpopup
          setShowLogin={setShowLogin}
        />
      )}
    </>
  );
};

export default App;