require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const sequelize = require("./config/database");

// =====================================================
// MODELS
// =====================================================

const Category = require("./models/Category");
const SubCategory = require("./models/SubCategory");
const Item = require("./models/item");
const Order = require("./models/Order");
const OrderItem = require("./models/OrderItem");
const Wishlist = require("./models/wishlist");

// =====================================================
// ROUTES
// =====================================================

const categoryRoutes = require("./routes/categoryRoutes");
const subCategoryRoutes = require("./routes/subcategoryroutes");
const itemRoutes = require("./routes/itemroutes");
const orderRoutes = require("./routes/orderroutes");
const userRoutes = require("./routes/userRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

const PORT = Number(
  process.env.PORT || 4000
);

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL
          .split(",")
          .map((url) => url.trim())
      : true,

    credentials: true,
  })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// =====================================================
// ROOT
// =====================================================

app.get("/", (_req, res) => {
  res.json({
    message:
      "Tomato Food App Backend Running",
    status: "ok",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/api/health",
  async (_req, res) => {
    try {
      await sequelize.authenticate();

      res.json({
        status: "ok",
        database: "connected",
      });
    } catch (error) {
      res.status(503).json({
        status: "error",
        database: "disconnected",
        message: error.message,
      });
    }
  }
);

// =====================================================
// API ROUTES
// =====================================================

app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/subcategories",
  subCategoryRoutes
);

app.use(
  "/api/items",
  itemRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/users",
  userRoutes
);

// =====================================================
// WISHLIST ROUTES
// =====================================================

app.use(
  "/api/wishlist",
  wishlistRoutes
);

// =====================================================
// MODEL ASSOCIATIONS
// =====================================================

// CATEGORY → SUB CATEGORY

Category.hasMany(SubCategory, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
});

SubCategory.belongsTo(Category, {
  foreignKey: "category_id",
});

// CATEGORY → ITEMS

Category.hasMany(Item, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
});

Item.belongsTo(Category, {
  foreignKey: "category_id",
});

// SUB CATEGORY → ITEMS

SubCategory.hasMany(Item, {
  foreignKey: "sub_category_id",
  onDelete: "CASCADE",
});

Item.belongsTo(SubCategory, {
  foreignKey: "sub_category_id",
});

// ORDER → ORDER ITEMS

Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "orderItems",
  onDelete: "CASCADE",
});

OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

// =====================================================
// WISHLIST ASSOCIATIONS
// =====================================================

// USER → WISHLIST
//
// User model already exists in userRoutes.
// We intentionally don't require User here,
// because your current User model filename/casing
// may be different.
//
// Wishlist → Item is enough for the wishlist
// controller's include.

Wishlist.belongsTo(Item, {
  foreignKey: "item_id",
  as: "item",
});

Item.hasMany(Wishlist, {
  foreignKey: "item_id",
  as: "wishlists",
  onDelete: "CASCADE",
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
  (err, _req, res, _next) => {
    console.error(
      "Unhandled API error:",
      err
    );

    if (
      err.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        message:
          "Each image must be 2 MB or smaller.",
      });
    }

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
);

// =====================================================
// START SERVER
// =====================================================

const start = async () => {
  try {
    await sequelize.authenticate();

    console.log(
      "Database connected successfully."
    );

    await sequelize.sync();

    console.log(
      "Database models synchronized."
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on http://localhost:${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Startup failed:",
      error
    );

    process.exit(1);
  }
};

start();