const jwt = require("jsonwebtoken");

// =====================================================
// VERIFY JWT TOKEN
// =====================================================

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("\n========== AUTH DEBUG ==========");
    console.log(
      "AUTH HEADER:",
      authHeader ? "RECEIVED" : "MISSING"
    );

    // No Authorization header
    if (!authHeader) {
      console.log("❌ Authorization header missing");

      return res.status(401).json({
        message: "Authorization token required",
      });
    }

    // Wrong format
    if (!authHeader.startsWith("Bearer ")) {
      console.log("❌ Invalid Authorization format");

      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    // Extract token
    const token = authHeader.substring(7).trim();

    console.log(
      "TOKEN RECEIVED:",
      token ? "YES" : "NO"
    );

    console.log(
      "TOKEN PARTS:",
      token ? token.split(".").length : 0
    );

    if (!token) {
      console.log("❌ Empty token");

      return res.status(401).json({
        message: "Authentication token missing",
      });
    }

    // JWT secret check
    if (!process.env.JWT_SECRET) {
      console.error(
        "❌ JWT_SECRET is missing from environment variables"
      );

      return res.status(500).json({
        message: "JWT configuration error",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("✅ JWT VERIFIED");
    console.log("USER ID:", decoded.id);
    console.log("USER EMAIL:", decoded.email);
    console.log("USER ROLE:", decoded.role);
    console.log("================================\n");

    req.user = decoded;

    next();
  } catch (error) {
    console.log("\n========== JWT ERROR ==========");
    console.log("ERROR NAME:", error.name);
    console.log("ERROR MESSAGE:", error.message);
    console.log("================================\n");

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// =====================================================
// ADMIN ONLY
// =====================================================

const adminOnly = (req, res, next) => {
  console.log("========== ADMIN CHECK ==========");

  if (!req.user) {
    console.log("❌ No authenticated user");

    return res.status(401).json({
      message: "Authentication required",
    });
  }

  console.log("USER ROLE:", req.user.role);

  if (req.user.role !== "admin") {
    console.log("❌ Admin access denied");

    return res.status(403).json({
      message: "Admin access only",
    });
  }

  console.log("✅ ADMIN VERIFIED");
  console.log("================================\n");

  next();
};

module.exports = {
  verifyToken,
  adminOnly,
};