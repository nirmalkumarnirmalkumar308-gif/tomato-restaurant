const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

// ==========================================
// REGISTER USER
// ==========================================

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    console.log("REGISTER REQUEST:", {
      name,
      email,
      phone,
      password: password ? "********" : undefined,
    });

    // Check required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message:
          "Name, email, mobile number and password are required",
      });
    }

    // Clean values
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check email
    const existingEmail = await User.findOne({
      where: {
        email: cleanEmail,
      },
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Check phone
    const existingPhone = await User.findOne({
      where: {
        phone: cleanPhone,
      },
    });

    if (existingPhone) {
      return res.status(400).json({
        message: "Mobile number already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // IMPORTANT:
    // Public registration always creates USER
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role: "user",
    });

    console.log(
      "USER CREATED SUCCESSFULLY:",
      user.id
    );

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("=================================");
    console.log("REGISTER ERROR:");
    console.log(error);
    console.log("ERROR MESSAGE:", error.message);
    console.log("ERROR NAME:", error.name);
    console.log("=================================");

    return res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};


// ==========================================
// LOGIN USER
// Email OR Mobile Number
// ==========================================

const loginUser = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        message:
          "Email or mobile number and password are required",
      });
    }

    const cleanLogin = login.trim();

    const user = await User.findOne({
      where: {
        [Op.or]: [
          {
            email: cleanLogin.toLowerCase(),
          },
          {
            phone: cleanLogin,
          },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email/mobile number or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email/mobile number or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("=================================");
    console.log("LOGIN ERROR:");
    console.log(error);
    console.log("ERROR MESSAGE:", error.message);
    console.log("=================================");

    return res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  registerUser,
  loginUser,
};

