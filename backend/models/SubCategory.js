const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SubCategory = sequelize.define(
  "SubCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    // ==========================================
    // SORT ORDER
    // ==========================================
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "sub_categories",
    timestamps: false,
  }
);

module.exports = SubCategory;