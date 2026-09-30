import React, { useContext, useEffect, useState } from "react";
import "./Navbar.css";

import { assets } from "../../assets/assets/frontend_assets/assets";
import { StoreContext } from "../../context/StoreContext.jsx";

import {
  FaSearch,
  FaShoppingCart,
  FaHeart,
  FaPlus,
  FaUserShield,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

const Navbar = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems = {} } = useContext(StoreContext);

  const [menu, setMenu] = useState("Home");
  const [isAdmin, setIsAdmin] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [mobileMenu, setMobileMenu] = useState(false);

  /* =========================
     WISHLIST
  ========================= */

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const wishlistCount = Array.isArray(wishlist)
    ? wishlist.length
    : Object.keys(wishlist || {}).length;

  /* =========================
     CART COUNT
  ========================= */

  const totalItems = Object.values(cartItems || {}).reduce(
    (total, quantity) => total + Number(quantity || 0),
    0
  );

  /* =========================
     LOGO
  ========================= */

  const logo =
    assets?.logo ||
    "https://res.cloudinary.com/s6chjv3q/image/upload/tomato-food-app/old-assets/logo.png";

  /* =========================
     ADMIN CHECK
  ========================= */

  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const adminToken = localStorage.getItem("adminToken");

      setIsAdmin(
        Boolean(
          (token && role === "admin") ||
          adminToken
        )
      );
    };

    checkAdmin();

    window.addEventListener("storage", checkAdmin);
    window.addEventListener("authChanged", checkAdmin);

    return () => {
      window.removeEventListener("storage", checkAdmin);
      window.removeEventListener("authChanged", checkAdmin);
    };
  }, []);

  /* =========================
     WISHLIST SYNC
  ========================= */

  useEffect(() => {
    const updateWishlist = () => {
      try {
        const saved = localStorage.getItem("wishlist");

        setWishlist(
          saved ? JSON.parse(saved) : []
        );
      } catch {
        setWishlist([]);
      }
    };

    window.addEventListener(
      "wishlistChanged",
      updateWishlist
    );

    window.addEventListener(
      "storage",
      updateWishlist
    );

    return () => {
      window.removeEventListener(
        "wishlistChanged",
        updateWishlist
      );

      window.removeEventListener(
        "storage",
        updateWishlist
      );
    };
  }, []);

  /* =========================
     ACTIVE MENU
  ========================= */

  useEffect(() => {
    if (location.pathname === "/") {
      setMenu("Home");
    }
  }, [location.pathname]);

  /* =========================
     SEARCH URL
  ========================= */

  useEffect(() => {
    const params = new URLSearchParams(
      location.search
    );

    const search = params.get("search") || "";

    setSearchText(search);

    if (search) {
      setSearchOpen(true);
    }
  }, [location.search]);

  /* =========================
     MOBILE
  ========================= */

  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  /* =========================
     HOME
  ========================= */

  const handleHome = () => {
    setMenu("Home");
    closeMobileMenu();

    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =========================
     SECTION NAVIGATION
  ========================= */

  const scrollToSection = (sectionId, menuName) => {
    setMenu(menuName);
    closeMobileMenu();

    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 250);
    } else {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }
  };

  const handleMenu = () => {
    scrollToSection("explore-menu", "Menu");
  };

  const handleOffers = () => {
    scrollToSection("offers", "Offers");
  };

  const handleAbout = () => {
    scrollToSection("about", "About Us");
  };

  const handleContact = () => {
    scrollToSection("contact", "Contact");
  };

  /* =========================
     SEARCH
  ========================= */

  const handleSearch = (e) => {
    const value = e.target.value;

    setSearchText(value);

    if (value.trim()) {
      navigate(
        `/?search=${encodeURIComponent(
          value.trim()
        )}`
      );
    } else {
      navigate("/");
    }
  };

  /* =========================
     CART
  ========================= */

  const handleCart = () => {
    closeMobileMenu();
    navigate("/cart");
  };

  /* =========================
     WISHLIST
  ========================= */

  const handleWishlist = () => {
    closeMobileMenu();
    navigate("/wishlist");
  };

  /* =========================
     ADMIN
  ========================= */

  const handleAddFood = () => {
    closeMobileMenu();
    navigate("/add-food");
  };

  const handleAdmin = () => {
    closeMobileMenu();
    navigate("/admin");
  };

  /* =========================
     LOGIN
  ========================= */

  const handleLogin = () => {
    closeMobileMenu();

    if (setShowLogin) {
      setShowLogin(true);
    }
  };

  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    [
      "token",
      "role",
      "user",
      "authToken",
      "userToken",
      "adminToken",
      "adminUser",
    ].forEach((key) => {
      localStorage.removeItem(key);
    });

    setIsAdmin(false);
    closeMobileMenu();

    navigate("/");

    window.dispatchEvent(
      new Event("authChanged")
    );
  };

  /* =========================
     UI
  ========================= */

  return (
    <>
      <nav className="navbar">

        <div className="navbar-container">

          {/* LOGO */}

          <div
            className="navbar-brand"
            onClick={handleHome}
          >
            <img
              src={logo}
              alt="Tomato"
              className="navbar-logo"
            />
          </div>

          {/* DESKTOP MENU */}

          <ul className="navbar-menu">

            <li
              className={
                menu === "Home" ? "active" : ""
              }
              onClick={handleHome}
            >
              Home
            </li>

            <li
              className={
                menu === "Menu" ? "active" : ""
              }
              onClick={handleMenu}
            >
              Menu
            </li>

            <li
              className={
                menu === "Offers" ? "active" : ""
              }
              onClick={handleOffers}
            >
              Offers
            </li>

            <li
              className={
                menu === "About Us" ? "active" : ""
              }
              onClick={handleAbout}
            >
              About Us
            </li>

            <li
              className={
                menu === "Contact" ? "active" : ""
              }
              onClick={handleContact}
            >
              Contact
            </li>

          </ul>

          {/* ACTIONS */}

          <div className="navbar-actions">

            {/* SEARCH */}

            <div
              className={`navbar-search ${
                searchOpen ? "search-open" : ""
              }`}
            >
              {searchOpen && (
                <input
                  type="text"
                  value={searchText}
                  onChange={handleSearch}
                  placeholder="Search food..."
                  autoFocus
                />
              )}

              <button
                type="button"
                className="navbar-icon-button"
                onClick={() =>
                  setSearchOpen((prev) => !prev)
                }
                aria-label="Search"
              >
                <FaSearch />
              </button>
            </div>

            {/* WISHLIST */}

            <button
              type="button"
              className="navbar-icon-button"
              onClick={handleWishlist}
              aria-label="Wishlist"
              title="Wishlist"
            >
              <FaHeart />

              {wishlistCount > 0 && (
                <span className="navbar-badge">
                  {wishlistCount > 99
                    ? "99+"
                    : wishlistCount}
                </span>
              )}
            </button>

            {/* CART */}

            <button
              type="button"
              className="navbar-icon-button"
              onClick={handleCart}
              aria-label="Cart"
              title="Cart"
            >
              <FaShoppingCart />

              {totalItems > 0 && (
                <span className="navbar-badge">
                  {totalItems > 99
                    ? "99+"
                    : totalItems}
                </span>
              )}
            </button>

            {/* ADMIN ADD FOOD */}

            {isAdmin && (
              <button
                type="button"
                className="navbar-icon-button admin-icon"
                onClick={handleAddFood}
                aria-label="Add Food"
                title="Add Food"
              >
                <FaPlus />
              </button>
            )}

            {/* ADMIN */}

            {isAdmin && (
              <button
                type="button"
                className="navbar-icon-button admin-icon"
                onClick={handleAdmin}
                aria-label="Admin"
                title="Admin"
              >
                <FaUserShield />
              </button>
            )}

            {/* LOGIN */}

            {!isAdmin && (
              <button
                type="button"
                className="login-button"
                onClick={handleLogin}
              >
                Login
              </button>
            )}

            {/* LOGOUT */}

            {isAdmin && (
              <button
                type="button"
                className="navbar-icon-button logout-icon"
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            )}

            {/* MOBILE MENU */}

            <button
              type="button"
              className="mobile-menu-button"
              onClick={() =>
                setMobileMenu(true)
              }
              aria-label="Open Menu"
            >
              <FaBars />
            </button>

          </div>
        </div>
      </nav>

      {/* MOBILE SIDEBAR */}

      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={closeMobileMenu}
        >
          <aside
            className="mobile-sidebar"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="mobile-sidebar-header">

              <img
                src={logo}
                alt="Tomato"
              />

              <button
                type="button"
                onClick={closeMobileMenu}
              >
                <FaTimes />
              </button>

            </div>

            <div className="mobile-sidebar-menu">

              <button
                className={
                  menu === "Home"
                    ? "active"
                    : ""
                }
                onClick={handleHome}
              >
                Home
              </button>

              <button
                className={
                  menu === "Menu"
                    ? "active"
                    : ""
                }
                onClick={handleMenu}
              >
                Menu
              </button>

              <button
                className={
                  menu === "Offers"
                    ? "active"
                    : ""
                }
                onClick={handleOffers}
              >
                Offers
              </button>

              <button
                className={
                  menu === "About Us"
                    ? "active"
                    : ""
                }
                onClick={handleAbout}
              >
                About Us
              </button>

              <button
                className={
                  menu === "Contact"
                    ? "active"
                    : ""
                }
                onClick={handleContact}
              >
                Contact
              </button>

              <button onClick={handleWishlist}>
                <span>Wishlist</span>

                {wishlistCount > 0 && (
                  <span className="mobile-count">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button onClick={handleCart}>
                <span>Cart</span>

                {totalItems > 0 && (
                  <span className="mobile-count">
                    {totalItems}
                  </span>
                )}
              </button>

              {isAdmin && (
                <button onClick={handleAddFood}>
                  Add Food
                </button>
              )}

              {isAdmin && (
                <button onClick={handleAdmin}>
                  Admin
                </button>
              )}

            </div>

            <div className="mobile-sidebar-bottom">

              {isAdmin ? (
                <button
                  className="mobile-logout"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              ) : (
                <button
                  className="mobile-login"
                  onClick={handleLogin}
                >
                  Login
                </button>
              )}

            </div>

          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;