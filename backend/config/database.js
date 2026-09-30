const { Sequelize } = require("sequelize");

// =====================================================
// REQUIRED ENVIRONMENT VARIABLES
// =====================================================

const required = [
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
];

for (const key of required) {
  if (
    process.env[key] === undefined ||
    process.env[key] === ""
  ) {
    console.warn(`[database] Missing ${key} in environment.`);
  }
}

// =====================================================
// MYSQL DATABASE CONNECTION
// =====================================================

const sequelize = new Sequelize(
  process.env.DB_NAME || "tomato",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "Nirmal@2005",
  {
    host: process.env.DB_HOST || "localhost",

    port: Number(process.env.DB_PORT || 3306),

    dialect: "mysql",

    logging:
      process.env.NODE_ENV === "development"
        ? console.log
        : false,

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    define: {
      timestamps: true,
      freezeTableName: false,
    },

    dialectOptions: {
      connectTimeout: 10000,
    },
  }
);

// =====================================================
// EXPORT
// =====================================================

module.exports = sequelize;