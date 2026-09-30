const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // ==========================================
    // USER REFERENCE (optional — guest orders allowed)
    // ==========================================

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },

    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },

    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "COD",
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    delivery_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 40,
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Pending",
    },
  },
  {
    tableName: "Orders",
    timestamps: true,
  }
);

module.exports = Order;