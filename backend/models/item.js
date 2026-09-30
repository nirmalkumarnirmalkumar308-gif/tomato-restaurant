const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Item = sequelize.define(
  "Item",
  {
    // =====================================================
    // ID
    // =====================================================

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // =====================================================
    // CATEGORY
    // =====================================================

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // =====================================================
    // SUB CATEGORY
    // =====================================================

    sub_category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // =====================================================
    // RESTAURANT NAME
    // =====================================================

    restaurant_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: "Tomato Restaurant",
    },

    // =====================================================
    // FOOD NAME
    // =====================================================

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    // =====================================================
    // PRICE
    // =====================================================

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    // =====================================================
    // DESCRIPTION
    // =====================================================

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // =====================================================
    // MAIN IMAGE
    // =====================================================

    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    // =====================================================
    // MULTIPLE IMAGES
    // =====================================================

    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    // =====================================================
    // STOCK QUANTITY
    // =====================================================

    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // =====================================================
    // AVAILABILITY
    // =====================================================

    availability: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    // =====================================================
    // PREPARATION TIME
    // =====================================================

    preparation_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 20,
    },

    // =====================================================
    // FOOD TYPE
    // =====================================================

    food_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    // =====================================================
    // SPICE LEVEL
    // =====================================================

    spice_level: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "MEDIUM",
    },

    // =====================================================
    // CALORIES
    // =====================================================

    calories: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // =====================================================
    // SERVES
    // =====================================================

    serves: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },

    // =====================================================
    // POPULAR
    // =====================================================

    is_popular: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    // =====================================================
    // FEATURED
    // =====================================================

    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    // =====================================================
    // SORT ORDER
    // =====================================================

    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "Items",
    timestamps: false,
  }
);

module.exports = Item;