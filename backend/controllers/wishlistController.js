const Wishlist = require("../models/wishlist");
const Item = require("../models/item");

// =====================================================
// GET USER ID
// =====================================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?.userId ||
    req.user?.user_id ||
    null
  );
};

// =====================================================
// ADD TO WISHLIST
// =====================================================

const addToWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { item_id } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!item_id) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    // Check item exists
    const item = await Item.findByPk(item_id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // Check already exists
    const existingWishlist = await Wishlist.findOne({
      where: {
        user_id: userId,
        item_id,
      },
    });

    if (existingWishlist) {
      return res.status(409).json({
        success: false,
        message: "Food already exists in wishlist",
      });
    }

    const wishlist = await Wishlist.create({
      user_id: userId,
      item_id,
    });

    return res.status(201).json({
      success: true,
      message: "Food added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error(
      "ADD WISHLIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add food to wishlist",
      error: error.message,
    });
  }
};

// =====================================================
// GET USER WISHLIST
// =====================================================

const getWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const wishlist = await Wishlist.findAll({
      where: {
        user_id: userId,
      },

      include: [
        {
          model: Item,
          as: "item",
          required: false,
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    console.error(
      "GET WISHLIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

// =====================================================
// REMOVE FROM WISHLIST
// =====================================================

const removeFromWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { itemId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    const wishlist = await Wishlist.findOne({
      where: {
        user_id: userId,
        item_id: itemId,
      },
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Food not found in wishlist",
      });
    }

    await wishlist.destroy();

    return res.status(200).json({
      success: true,
      message: "Food removed from wishlist",
    });
  } catch (error) {
    console.error(
      "REMOVE WISHLIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove food from wishlist",
      error: error.message,
    });
  }
};

// =====================================================
// CHECK WISHLIST STATUS
// =====================================================

const checkWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { itemId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const wishlist = await Wishlist.findOne({
      where: {
        user_id: userId,
        item_id: itemId,
      },
    });

    return res.status(200).json({
      success: true,
      isWishlisted: !!wishlist,
    });
  } catch (error) {
    console.error(
      "CHECK WISHLIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
      error: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWishlist,
};