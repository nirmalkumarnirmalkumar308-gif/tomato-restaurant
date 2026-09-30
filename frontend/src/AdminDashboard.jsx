import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  HiHome,
  HiShoppingBag,
  HiPencilSquare,
  HiClipboardDocumentList,
  HiUsers,
  HiTag,
  HiChartBar,
  HiCog6Tooth,
  HiPlus,
  HiMagnifyingGlass,
  HiBell,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiArrowRightOnRectangle,
  HiChevronUp,
  HiChevronDown,
  HiCheck,
} from "react-icons/hi2";

import {
  getCategories,
  getItems,
  updateCategoryOrder,
} from "./api";

import "./AdminDashboard.css";

const API_URL = "http://localhost:4000/api";

// =====================================================
// GET TOKEN
// =====================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("userToken") ||
    ""
  );
};

// =====================================================
// MENU ITEMS
// =====================================================

const menuItems = [
  {
    name: "Dashboard",
    icon: <HiHome />,
    path: "/admin",
  },
  {
    name: "Food Items",
    icon: <HiShoppingBag />,
    path: "/admin/foods",
  },
  {
    name: "Edit Food",
    icon: <HiPencilSquare />,
    path: "/admin/edit-food",
  },
  {
    name: "Orders",
    icon: <HiClipboardDocumentList />,
    path: "/admin/orders",
  },
  {
    name: "Categories",
    icon: <HiTag />,
    path: "/admin/categories",
  },
  {
    name: "Sub Categories",
    icon: <HiTag />,
    path: "/admin/subcategories",
  },
  {
    name: "Users",
    icon: <HiUsers />,
    path: "/admin/users",
  },
  {
    name: "Analytics",
    icon: <HiChartBar />,
    path: "/admin/analytics",
  },
];

// =====================================================
// DASHBOARD
// =====================================================

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ===================================================
  // SEARCH
  // ===================================================

  const [search, setSearch] = useState("");

  // ===================================================
  // LIVE TIME
  // ===================================================

  const [currentTime, setCurrentTime] = useState(new Date());

  // ===================================================
  // CATEGORY STATES
  // ===================================================

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // ===================================================
  // ORDER STATES
  // ===================================================

  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);

  // ===================================================
  // ADD FOOD NAVIGATION
  // ===================================================

  const handleAddFood = () => {
    navigate("/admin/add-food");
  };

  // ===================================================
  // LOAD CATEGORIES + ITEMS
  // ===================================================

  const loadCategoryData = async () => {
    try {
      setCategoryLoading(true);

      const [categoryData, itemData] = await Promise.all([
        getCategories(),
        getItems(),
      ]);

      const categoryArray = Array.isArray(categoryData)
        ? categoryData
        : categoryData?.categories || [];

      const itemArray = Array.isArray(itemData)
        ? itemData
        : itemData?.items || [];

      const sortedCategories = [...categoryArray].sort((a, b) => {
        const orderA = Number(a.sort_order) || 0;
        const orderB = Number(b.sort_order) || 0;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return Number(a.id) - Number(b.id);
      });

      const numberedCategories = sortedCategories.map(
        (category, index) => ({
          ...category,
          sort_order: index + 1,
        })
      );

      setCategories(numberedCategories);
      setItems(itemArray);
    } catch (error) {
      console.error("Dashboard Category Error:", error);
    } finally {
      setCategoryLoading(false);
    }
  };

  // ===================================================
  // LOAD ORDERS
  // ===================================================

  const loadOrders = async () => {
    try {
      setOrderLoading(true);

      const token = getToken();

      console.log(
        "DASHBOARD ORDER TOKEN:",
        token ? "TOKEN FOUND" : "TOKEN MISSING"
      );

      if (!token) {
        console.warn(
          "Orders API: Authentication token not found"
        );

        setOrders([]);
        return;
      }

      const response = await fetch(`${API_URL}/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.warn(
          "Orders API: Token is invalid or expired"
        );

        setOrders([]);

        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userToken");

        return;
      }

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Orders API Response:",
          errorText
        );

        throw new Error(
          `Orders API Error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "DASHBOARD ORDERS RESPONSE:",
        data
      );

      const orderArray = Array.isArray(data)
        ? data
        : data?.orders || [];

      setOrders(orderArray);
    } catch (error) {
      console.error(
        "Dashboard Orders Error:",
        error
      );

      setOrders([]);
    } finally {
      setOrderLoading(false);
    }
  };

  // ===================================================
  // LOAD ALL DATA
  // ===================================================

  useEffect(() => {
    loadCategoryData();
    loadOrders();
  }, []);

  // ===================================================
  // LIVE CLOCK
  // ===================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // ===================================================
  // GREETING
  // ===================================================

  const getGreeting = () => {
    const hour = currentTime.getHours();

    if (hour >= 5 && hour < 12) {
      return "Good morning";
    }

    if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    }

    if (hour >= 17 && hour < 21) {
      return "Good evening";
    }

    return "Good night";
  };

  // ===================================================
  // DATE + TIME
  // ===================================================

  const formattedDateTime = currentTime.toLocaleString(
    "en-IN",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }
  );

  // ===================================================
  // CATEGORY ITEM COUNT
  // ===================================================

  const getCategoryItemCount = (categoryId) => {
    return items.filter(
      (item) =>
        Number(item.category_id) === Number(categoryId)
    ).length;
  };

  // ===================================================
  // MOVE CATEGORY
  // ===================================================

  const moveCategory = (index, direction) => {
    setCategories((previousCategories) => {
      const updatedCategories = [
        ...previousCategories,
      ];

      const newIndex = index + direction;

      if (
        newIndex < 0 ||
        newIndex >= updatedCategories.length
      ) {
        return previousCategories;
      }

      [
        updatedCategories[index],
        updatedCategories[newIndex],
      ] = [
        updatedCategories[newIndex],
        updatedCategories[index],
      ];

      return updatedCategories.map(
        (category, newOrder) => ({
          ...category,
          sort_order: newOrder + 1,
        })
      );
    });
  };

  // ===================================================
  // SAVE CATEGORY ORDER
  // ===================================================

  const handleSaveCategoryOrder = async () => {
    try {
      if (categories.length === 0) {
        alert("No categories to save.");
        return;
      }

      setSavingOrder(true);

      const categoryPayload = categories.map(
        (category, index) => ({
          id: Number(category.id),
          sort_order: index + 1,
        })
      );

      console.log(
        "Saving Category Order:",
        categoryPayload
      );

      await updateCategoryOrder(categoryPayload);

      alert(
        "Category order saved successfully!"
      );

      await loadCategoryData();
    } catch (error) {
      console.error(
        "Save Category Order Error:",
        error
      );

      console.error(
        "Backend Response:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Failed to save category order"
      );
    } finally {
      setSavingOrder(false);
    }
  };

  // ===================================================
  // EDIT FOOD
  // ===================================================

  const handleEditFood = (itemId) => {
    if (!itemId) {
      alert("Food ID not found");
      return;
    }

    navigate(`/admin/foods/${itemId}`);
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/");
    window.location.reload();
  };

  // ===================================================
  // NORMALIZE STATUS
  // ===================================================

  const normalizeStatus = (status) => {
    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (value === "pending") {
      return "Pending";
    }

    if (value === "preparing") {
      return "Preparing";
    }

    if (
      value === "out for delivery" ||
      value === "out_for_delivery" ||
      value === "out-for-delivery"
    ) {
      return "Out for Delivery";
    }

    if (value === "delivered") {
      return "Delivered";
    }

    if (
      value === "cancelled" ||
      value === "canceled"
    ) {
      return "Cancelled";
    }

    return "Pending";
  };

  // ===================================================
  // STATUS COUNTS
  // ===================================================

  const statusCounts = {
    Pending: 0,
    Preparing: 0,
    "Out for Delivery": 0,
    Delivered: 0,
    Cancelled: 0,
  };

  orders.forEach((order) => {
    const status = normalizeStatus(order.status);

    if (
      Object.prototype.hasOwnProperty.call(
        statusCounts,
        status
      )
    ) {
      statusCounts[status]++;
    }
  });

  // ===================================================
  // TOTAL ORDERS
  // ===================================================

  const totalOrders = orders.length;

  // ===================================================
  // TOTAL REVENUE
  // ===================================================

  const totalRevenue = orders.reduce(
    (total, order) => {
      const status = normalizeStatus(
        order.status
      );

      if (status === "Cancelled") {
        return total;
      }

      return (
        total +
        Number(order.total_amount || 0)
      );
    },
    0
  );

  // ===================================================
  // TOTAL CUSTOMERS
  // ===================================================

  const customerEmails = new Set();

  orders.forEach((order) => {
    if (order.email) {
      customerEmails.add(
        String(order.email)
          .trim()
          .toLowerCase()
      );
    }
  });

  const totalCustomers =
    customerEmails.size;

  // ===================================================
  // STATUS PERCENTAGE
  // ===================================================

  const getStatusPercentage = (status) => {
    if (totalOrders === 0) {
      return 0;
    }

    return Math.round(
      (statusCounts[status] /
        totalOrders) *
        100
    );
  };

  // ===================================================
  // STATUS CLASS
  // ===================================================

  const getStatusClass = (status) => {
    return normalizeStatus(status)
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // ===================================================
  // RECENT ORDERS
  // ===================================================

  const recentOrders = orders.slice(0, 5);

  // ===================================================
  // STATS
  // ===================================================

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString(
        "en-IN",
        {
          maximumFractionDigits: 2,
        }
      )}`,
      change: "Live",
      up: true,
      icon: "₹",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      change: "Live",
      up: true,
      icon: "↗",
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      change: "Live",
      up: true,
      icon: "👥",
    },
    {
      title: "Food Items",
      value: items.length,
      change: "Live",
      up: true,
      icon: "🍽",
    },
  ];

  // ===================================================
  // POPULAR ITEMS
  // ===================================================

  const popularItems = [
    {
      name: "Veg Salad",
      category: "Salad",
      price: "₹120",
      orders: "182 orders",
      image: "🥗",
    },
    {
      name: "Margherita Pizza",
      category: "Pizza",
      price: "₹260",
      orders: "154 orders",
      image: "🍕",
    },
    {
      name: "Veg Noodles",
      category: "Noodles",
      price: "₹180",
      orders: "126 orders",
      image: "🍜",
    },
    {
      name: "Pasta",
      category: "Pasta",
      price: "₹220",
      orders: "98 orders",
      image: "🍝",
    },
  ];

  // ===================================================
  // FILTERED FOOD ITEMS
  // ===================================================

  const filteredFoodItems = items.filter((item) => {
    if (!search.trim()) {
      return true;
    }

    const searchText =
      search.toLowerCase().trim();

    return (
      String(item.name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.description || "")
        .toLowerCase()
        .includes(searchText) ||
      String(
        item.category?.name ||
          item.Category?.name ||
          ""
      )
        .toLowerCase()
        .includes(searchText)
    );
  });

  // ===================================================
  // IMAGE URL
  // ===================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    const imageString = String(image);

    if (
      imageString.startsWith("http://") ||
      imageString.startsWith("https://")
    ) {
      return imageString;
    }

    return `${API_URL.replace(
      "/api",
      ""
    )}/uploads/${imageString.replace(
      /^\/+/,
      ""
    )}`;
  };

  // ===================================================
  // DONUT DATA
  // ===================================================

  const deliveredPercent =
    getStatusPercentage("Delivered");

  const preparingPercent =
    getStatusPercentage("Preparing");

  const pendingPercent =
    getStatusPercentage("Pending");

  const outForDeliveryPercent =
    getStatusPercentage(
      "Out for Delivery"
    );

  const cancelledPercent =
    getStatusPercentage("Cancelled");

  // ===================================================
  // DONUT STYLE
  // ===================================================

  const donutStyle = {
    background: `conic-gradient(
      #22c55e 0% ${deliveredPercent}%,
      #f59e0b
      ${deliveredPercent}%
      ${
        deliveredPercent +
        preparingPercent
      }%,
      #3b82f6
      ${
        deliveredPercent +
        preparingPercent
      }%
      ${
        deliveredPercent +
        preparingPercent +
        pendingPercent
      }%,
      #8b5cf6
      ${
        deliveredPercent +
        preparingPercent +
        pendingPercent
      }%
      ${
        deliveredPercent +
        preparingPercent +
        pendingPercent +
        outForDeliveryPercent
      }%,
      #ef4444
      ${
        deliveredPercent +
        preparingPercent +
        pendingPercent +
        outForDeliveryPercent
      }%
      100%
    )`,
  };

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <div className="admin-dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="admin-sidebar">

        {/* LOGO */}

        <div className="admin-logo">
          <div className="admin-logo-icon">
            T
          </div>

          <div>
            <h2>Tomato</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        {/* MAIN MENU */}

        <div className="menu-title">
          MAIN MENU
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={
                location.pathname === item.path
                  ? "admin-nav-item active"
                  : "admin-nav-item"
              }
              onClick={() =>
                navigate(item.path)
              }
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* SYSTEM */}

        <div className="menu-title system-title">
          SYSTEM
        </div>

        <div className="system-menu">

          {/* SETTINGS */}

          <button
            className={
              location.pathname ===
              "/admin/settings"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              navigate("/admin/settings")
            }
          >
            <span className="nav-icon">
              <HiCog6Tooth />
            </span>

            <span>Settings</span>
          </button>

          {/* LOGOUT */}

          <button
            className="admin-nav-item logout-menu"
            onClick={handleLogout}
          >
            <span className="nav-icon">
              <HiArrowRightOnRectangle />
            </span>

            <span>Logout</span>
          </button>
        </div>

        {/* BACK TO WEBSITE */}

        <div className="back-website">
          <button
            onClick={() => navigate("/")}
          >
            ← Back to Website
          </button>
        </div>
      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="admin-main">

        {/* TOP BAR */}

        <header className="admin-topbar">

          <div className="topbar-search">
            <HiMagnifyingGlass />

            <input
              type="text"
              placeholder="Search anything..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <span className="search-shortcut">
              Ctrl K
            </span>
          </div>

          <div className="topbar-right">

            <button className="notification-btn">
              <HiBell />
              <span></span>
            </button>

            <div className="admin-profile">

              <div className="profile-avatar">
                A
              </div>

              <div className="profile-info">
                <strong>Admin</strong>
                <small>Administrator</small>
              </div>

            </div>
          </div>
        </header>

        {/* PAGE HEADER */}

        <section className="dashboard-header">

          <div>
            <span className="page-label">
              OVERVIEW
            </span>

            <h1>
              {getGreeting()}, Admin 👋
            </h1>

            <p>
              Here's what's happening
              with your food business
              today.
            </p>

            <div
              style={{
                marginTop: "8px",
                fontSize: "13px",
                color: "#777",
                fontWeight: "500",
              }}
            >
              🕐 {formattedDateTime}
            </div>
          </div>

          {/* ADD FOOD */}

          <button
            type="button"
            className="add-food-btn"
            onClick={handleAddFood}
          >
            <HiPlus />
            Add Food
          </button>

        </section>

        {/* STAT CARDS */}

        <section className="stats-grid">

          {stats.map((stat) => (
            <div
              className="stat-card"
              key={stat.title}
            >
              <div className="stat-top">

                <div className="stat-icon">
                  {stat.icon}
                </div>

                <div
                  className={
                    stat.up
                      ? "trend up"
                      : "trend down"
                  }
                >
                  {stat.up ? (
                    <HiArrowTrendingUp />
                  ) : (
                    <HiArrowTrendingDown />
                  )}

                  {stat.change}
                </div>
              </div>

              <div className="stat-value">
                {stat.value}
              </div>

              <div className="stat-title">
                {stat.title}
              </div>
            </div>
          ))}
        </section>

        {/* CATEGORY MANAGEMENT */}

        <section className="dashboard-card category-management-card">

          <div className="card-header category-management-header">

            <div>
              <h3>
                Category Management
              </h3>

              <p>
                Manage category display order
              </p>
            </div>

            <button
              className="save-category-order-btn"
              onClick={
                handleSaveCategoryOrder
              }
              disabled={
                savingOrder ||
                categoryLoading ||
                categories.length === 0
              }
            >
              <HiCheck />

              {savingOrder
                ? "Saving..."
                : "Save Order"}
            </button>
          </div>

          <div className="category-table-wrapper">

            <table className="category-management-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Items</th>
                  <th>Sort Order</th>
                  <th>Move</th>
                </tr>
              </thead>

              <tbody>

                {categoryLoading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="category-loading"
                    >
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="category-loading"
                    >
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map(
                    (category, index) => (
                      <tr
                        key={category.id}
                      >
                        <td>
                          <span className="category-number">
                            {index + 1}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {category.name}
                          </strong>
                        </td>

                        <td>
                          <span className="category-item-count">
                            {getCategoryItemCount(
                              category.id
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="sort-order-number">
                            {index + 1}
                          </span>
                        </td>

                        <td>
                          <div className="category-move-buttons">

                            <button
                              type="button"
                              title="Move Up"
                              disabled={
                                index === 0
                              }
                              onClick={() =>
                                moveCategory(
                                  index,
                                  -1
                                )
                              }
                            >
                              <HiChevronUp />
                            </button>

                            <button
                              type="button"
                              title="Move Down"
                              disabled={
                                index ===
                                categories.length -
                                  1
                              }
                              onClick={() =>
                                moveCategory(
                                  index,
                                  1
                                )
                              }
                            >
                              <HiChevronDown />
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
        </section>

        {/* ALL FOOD ITEMS */}

        <section className="dashboard-card all-food-items-card">

          <div className="card-header">

            <div>
              <h3>All Food Items</h3>

              <p>
                Manage all{" "}
                {items.length}{" "}
                food items
              </p>
            </div>

            <button
              className="view-all-food-btn"
              onClick={() =>
                navigate("/admin/foods")
              }
            >
              View All →
            </button>

          </div>

          <div className="food-table-wrapper">

            <table className="food-items-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Food Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredFoodItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="food-table-empty"
                    >
                      No food items found.
                    </td>
                  </tr>
                ) : (
                  filteredFoodItems.map(
                    (item, index) => {
                      const imageUrl =
                        getImageUrl(
                          item.image
                        );

                      const categoryName =
                        item.category?.name ||
                        item.Category?.name ||
                        "No Category";

                      return (
                        <tr
                          key={item.id}
                        >

                          <td>
                            <span className="food-table-number">
                              {index + 1}
                            </span>
                          </td>

                          <td>
                            <div className="food-table-image">

                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={item.name}
                                  onError={(e) => {
                                    e.currentTarget.style.display =
                                      "none";
                                  }}
                                />
                              ) : (
                                <span>
                                  🍽️
                                </span>
                              )}

                            </div>
                          </td>

                          <td>
                            <strong className="food-table-name">
                              {item.name}
                            </strong>
                          </td>

                          <td>
                            <span className="food-table-category">
                              {categoryName}
                            </span>
                          </td>

                          <td>
                            <p className="food-table-description">
                              {item.description ||
                                "No description"}
                            </p>
                          </td>

                          <td>
                            <strong className="food-table-price">
                              ₹
                              {Number(
                                item.price || 0
                              ).toFixed(2)}
                            </strong>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="food-table-edit-btn"
                              onClick={() =>
                                handleEditFood(
                                  item.id
                                )
                              }
                            >
                              <HiPencilSquare />
                              Edit
                            </button>
                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>
            </table>
          </div>
        </section>

        {/* ANALYTICS GRID */}

        <section className="analytics-grid">

          {/* SALES */}

          <div className="dashboard-card sales-card">

            <div className="card-header">

              <div>
                <h3>
                  Sales Overview
                </h3>

                <p>
                  Revenue performance
                  from orders
                </p>
              </div>

              <select>
                <option>All Orders</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>

            </div>

            <div className="sales-number">
              ₹
              {totalRevenue.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 2,
                }
              )}

              <span>Live</span>
            </div>

            <div className="chart-container">

              <div className="chart-y">
                <span>30k</span>
                <span>20k</span>
                <span>10k</span>
                <span>0</span>
              </div>

              <div className="chart-area">

                <div className="chart-grid-line"></div>
                <div className="chart-grid-line"></div>
                <div className="chart-grid-line"></div>
                <div className="chart-grid-line"></div>

                <svg
                  viewBox="0 0 700 260"
                  preserveAspectRatio="none"
                  className="sales-svg"
                >
                  <defs>
                    <linearGradient
                      id="salesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#ff6347"
                        stopOpacity="0.25"
                      />

                      <stop
                        offset="100%"
                        stopColor="#ff6347"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d="
                      M0 210
                      C60 190 70 175 120 185
                      C170 195 185 140 230 150
                      C275 160 300 105 345 125
                      C390 145 405 90 455 100
                      C505 110 525 70 570 80
                      C615 90 640 45 700 55
                      L700 260
                      L0 260
                      Z
                    "
                    fill="url(#salesGradient)"
                  />

                  <path
                    d="
                      M0 210
                      C60 190 70 175 120 185
                      C170 195 185 140 230 150
                      C275 160 300 105 345 125
                      C390 145 405 90 455 100
                      C505 110 525 70 570 80
                      C615 90 640 45 700 55
                    "
                    fill="none"
                    stroke="#ff6347"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="chart-days">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

              </div>
            </div>
          </div>

          {/* ORDER STATUS */}

          <div className="dashboard-card order-status-card">

            <div className="card-header">

              <div>
                <h3>Order Status</h3>

                <p>
                  All order status breakdown
                </p>
              </div>

              <button
                className="more-btn"
                onClick={loadOrders}
              >
                ↻
              </button>

            </div>

            <div className="donut-wrapper">

              {orderLoading ? (
                <div className="donut-center">
                  <strong>...</strong>
                  <span>Loading</span>
                </div>
              ) : (
                <div
                  className="donut"
                  style={donutStyle}
                >
                  <div className="donut-center">
                    <strong>
                      {totalOrders}
                    </strong>

                    <span>Orders</span>
                  </div>
                </div>
              )}

            </div>

            <div className="status-list">

              <div>
                <span className="status-dot delivered"></span>
                <span>Delivered</span>
                <strong>
                  {deliveredPercent}%
                </strong>
              </div>

              <div>
                <span className="status-dot preparing"></span>
                <span>Preparing</span>
                <strong>
                  {preparingPercent}%
                </strong>
              </div>

              <div>
                <span className="status-dot pending"></span>
                <span>Pending</span>
                <strong>
                  {pendingPercent}%
                </strong>
              </div>

              <div>
                <span
                  className="status-dot"
                  style={{
                    background:
                      "#8b5cf6",
                  }}
                ></span>

                <span>
                  Out for Delivery
                </span>

                <strong>
                  {outForDeliveryPercent}%
                </strong>
              </div>

              <div>
                <span className="status-dot cancelled"></span>
                <span>Cancelled</span>
                <strong>
                  {cancelledPercent}%
                </strong>
              </div>

            </div>
          </div>
        </section>

        {/* BOTTOM GRID */}

        <section className="bottom-grid">

          {/* RECENT ORDERS */}

          <div className="dashboard-card recent-orders">

            <div className="card-header">

              <div>
                <h3>Recent Orders</h3>

                <p>
                  Latest customer orders
                </p>
              </div>

              <button
                className="view-all"
                onClick={() =>
                  navigate("/admin/orders")
                }
              >
                View all →
              </button>

            </div>

            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Item</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {orderLoading ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: "center",
                          padding: "30px",
                        }}
                      >
                        Loading orders...
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: "center",
                          padding: "30px",
                        }}
                      >
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map(
                      (order) => {
                        const status =
                          normalizeStatus(
                            order.status
                          );

                        return (
                          <tr
                            key={order.id}
                          >
                            <td>
                              <strong>
                                #{order.id}
                              </strong>
                            </td>

                            <td>
                              {order.first_name}{" "}
                              {order.last_name}
                            </td>

                            <td>
                              {order.item_name ||
                                order.items ||
                                "Food Order"}
                            </td>

                            <td>
                              <strong>
                                ₹
                                {Number(
                                  order.total_amount ||
                                    0
                                ).toFixed(2)}
                              </strong>
                            </td>

                            <td>
                              <span
                                className={`order-status ${getStatusClass(
                                  status
                                )}`}
                              >
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}

                </tbody>
              </table>
            </div>
          </div>

          {/* POPULAR ITEMS */}

          <div className="dashboard-card popular-card">

            <div className="card-header">

              <div>
                <h3>Popular Items</h3>

                <p>
                  Best selling food
                  items
                </p>
              </div>

              <button
                className="view-all"
                onClick={() =>
                  navigate("/admin/foods")
                }
              >
                View all →
              </button>
            </div>

            <div className="popular-list">

              {popularItems.map((item) => (
                <div
                  className="popular-item"
                  key={item.name}
                >

                  <div className="food-image">
                    {item.image}
                  </div>

                  <div className="food-info">
                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      {item.category}
                    </span>
                  </div>

                  <div className="food-sales">
                    <strong>
                      {item.price}
                    </strong>

                    <span>
                      {item.orders}
                    </span>
                  </div>

                </div>
              ))}

            </div>
          </div>

        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;