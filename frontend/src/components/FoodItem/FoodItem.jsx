import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./FoodItem.css";

import { StoreContext } from "../../context/StoreContext.jsx";

const API_URL = "http://localhost:4000/api";

const FoodItem = ({
  id,
  name,
  price,
  description,
  image,
  images,

  // Availability
  availability,

  // Stock
  stock_quantity,

  // Food type
  food_type,
  foodType,

  // Preparation
  preparation_time,
  preparationTime,

  // Popular
  is_popular,
  isPopular,

  // Restaurant
  restaurant_name,
}) => {
  const {
    cartItems,
    addToCart,
    removeFromCart,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  // =====================================================
  // ITEM ID
  // =====================================================

  const itemId = String(id);

  // =====================================================
  // WISHLIST STATE
  // =====================================================

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] =
    useState(false);

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
  // CHECK WISHLIST STATUS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const checkWishlistStatus = async () => {
      if (!id) {
        return;
      }

      const token = getToken();

      if (!token) {
        if (!cancelled) {
          setIsWishlisted(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/wishlist/check/${itemId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!cancelled && response.ok) {
          setIsWishlisted(
            data?.isWishlisted === true
          );
        }
      } catch (error) {
        console.error(
          "WISHLIST CHECK ERROR:",
          error
        );
      }
    };

    checkWishlistStatus();

    return () => {
      cancelled = true;
    };
  }, [id, itemId]);

  // =====================================================
  // TOGGLE WISHLIST
  // =====================================================

  const handleWishlist = async (e) => {
    e.stopPropagation();

    if (!id || wishlistLoading) {
      return;
    }

    const token = getToken();

    // User must login
    if (!token) {
      alert(
        "Please login to add food to your wishlist."
      );

      return;
    }

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        // =================================================
        // REMOVE FROM WISHLIST
        // =================================================

        const response = await fetch(
          `${API_URL}/wishlist/${itemId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to remove from wishlist"
          );
        }

        setIsWishlisted(false);
      } else {
        // =================================================
        // ADD TO WISHLIST
        // =================================================

        const response = await fetch(
          `${API_URL}/wishlist`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              item_id: Number(id),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to add to wishlist"
          );
        }

        setIsWishlisted(true);
      }
    } catch (error) {
      console.error(
        "WISHLIST ERROR:",
        error
      );

      alert(
        error.message ||
          "Something went wrong with wishlist."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // =====================================================
  // CART QUANTITY
  // =====================================================

  const quantity = Number(
    cartItems?.[itemId] || 0
  );

  // =====================================================
  // CHECK STOCK PROP
  // =====================================================

  const hasStockValue =
    stock_quantity !== undefined &&
    stock_quantity !== null &&
    stock_quantity !== "";

  // =====================================================
  // NORMALIZE STOCK
  // =====================================================

  const stockQuantity = useMemo(() => {
    if (!hasStockValue) {
      return null;
    }

    const value = Number(stock_quantity);

    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }

    return Math.floor(value);
  }, [stock_quantity, hasStockValue]);

  // =====================================================
  // NORMALIZE AVAILABILITY
  // =====================================================

  const adminAvailability = useMemo(() => {
    if (typeof availability === "boolean") {
      return availability;
    }

    if (typeof availability === "number") {
      return availability === 1;
    }

    if (typeof availability === "string") {
      const value = availability
        .trim()
        .toLowerCase();

      if (
        value === "1" ||
        value === "true" ||
        value === "yes" ||
        value === "available" ||
        value === "active" ||
        value === "on"
      ) {
        return true;
      }

      if (
        value === "0" ||
        value === "false" ||
        value === "no" ||
        value === "unavailable" ||
        value === "not available" ||
        value === "inactive" ||
        value === "sold out" ||
        value === "soldout" ||
        value === "off" ||
        value === ""
      ) {
        return false;
      }
    }

    if (
      availability === undefined ||
      availability === null
    ) {
      return true;
    }

    return false;
  }, [availability]);

  // =====================================================
  // OUT OF STOCK
  // =====================================================

  const isOutOfStock =
    hasStockValue &&
    stockQuantity !== null &&
    stockQuantity <= 0;

  // =====================================================
  // MANUALLY UNAVAILABLE
  // =====================================================

  const isManuallyUnavailable =
    adminAvailability === false &&
    !isOutOfStock;

  // =====================================================
  // FINAL AVAILABLE STATE
  // =====================================================

  const isAvailable =
    adminAvailability === true &&
    !isOutOfStock;

  // =====================================================
  // STOCK LIMIT
  // =====================================================

  const stockLimitReached =
    isAvailable &&
    stockQuantity !== null &&
    quantity >= stockQuantity;

  // =====================================================
  // FOOD TYPE
  // =====================================================

  const normalizedFoodType = String(
    food_type || foodType || ""
  )
    .trim()
    .toLowerCase();

  const isVeg =
    normalizedFoodType === "veg" ||
    normalizedFoodType === "vegetarian";

  const isNonVeg =
    normalizedFoodType === "non-veg" ||
    normalizedFoodType === "non veg" ||
    normalizedFoodType === "nonveg" ||
    normalizedFoodType === "nonvegetarian";

  // =====================================================
  // POPULAR
  // =====================================================

  const isPopularFood = useMemo(() => {
    if (
      is_popular === true ||
      isPopular === true ||
      is_popular === 1 ||
      isPopular === 1
    ) {
      return true;
    }

    const value = String(
      is_popular ??
        isPopular ??
        ""
    )
      .trim()
      .toLowerCase();

    return (
      value === "true" ||
      value === "1" ||
      value === "yes"
    );
  }, [is_popular, isPopular]);

  // =====================================================
  // IMAGE LIST
  // =====================================================

  const foodImages = useMemo(() => {
    let result = [];

    if (Array.isArray(images)) {
      result = images;
    } else if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);

        if (Array.isArray(parsed)) {
          result = parsed;
        } else if (parsed) {
          result = [parsed];
        }
      } catch {
        if (images.trim()) {
          result = [images];
        }
      }
    }

    if (
      result.length === 0 &&
      image
    ) {
      result = [image];
    }

    return result
      .map((item) => {
        if (
          typeof item === "object" &&
          item !== null
        ) {
          return (
            item.url ||
            item.secure_url ||
            item.src ||
            item.path ||
            ""
          );
        }

        return String(item || "").trim();
      })
      .filter(Boolean);
  }, [images, image]);

  // =====================================================
  // CURRENT IMAGE
  // =====================================================

  const [
    currentImage,
    setCurrentImage,
  ] = useState(0);

  useEffect(() => {
    setCurrentImage(0);
  }, [id]);

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "";
    }

    const imagePathString =
      String(imagePath).trim();

    if (!imagePathString) {
      return "";
    }

    // Cloudinary / External URL
    if (
      imagePathString.startsWith("http://") ||
      imagePathString.startsWith("https://") ||
      imagePathString.startsWith("data:") ||
      imagePathString.startsWith("blob:")
    ) {
      return imagePathString;
    }

    // Local frontend path
    if (
      imagePathString.startsWith("/assets/") ||
      imagePathString.startsWith("/src/") ||
      imagePathString.startsWith("./") ||
      imagePathString.startsWith("../")
    ) {
      return imagePathString;
    }

    // Backend image path
    const cleanPath =
      imagePathString.replace(/^\/+/, "");

    return `http://localhost:4000/${cleanPath}`;
  };

  // =====================================================
  // SAFE IMAGE INDEX
  // =====================================================

  const safeImageIndex =
    foodImages.length > 0
      ? Math.min(
          currentImage,
          foodImages.length - 1
        )
      : 0;

  // =====================================================
  // IMAGE URL
  // =====================================================

  const imageUrl =
    foodImages.length > 0
      ? getImageUrl(
          foodImages[safeImageIndex]
        )
      : "";

  // =====================================================
  // IMAGE ERROR
  // =====================================================

  const [
    imageError,
    setImageError,
  ] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  const handleImageError = () => {
    setImageError(true);
  };

  // =====================================================
  // FOOD DETAILS NAVIGATION
  // =====================================================

  const handleFoodClick = () => {
    if (!id) {
      return;
    }

    navigate(`/food/${id}`);
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAdd = (e) => {
    e.stopPropagation();

    if (!isAvailable) {
      return;
    }

    if (
      stockQuantity !== null &&
      quantity >= stockQuantity
    ) {
      return;
    }

    addToCart(itemId);
  };

  // =====================================================
  // REMOVE FROM CART
  // =====================================================

  const handleRemove = (e) => {
    e.stopPropagation();

    if (quantity <= 0) {
      return;
    }

    removeFromCart(itemId);
  };

  // =====================================================
  // IMAGE CHANGE
  // =====================================================

  const handleImageChange = (
    e,
    index
  ) => {
    e.stopPropagation();

    setCurrentImage(index);
  };

  // =====================================================
  // PREPARATION TIME
  // =====================================================

  const prepTime =
    preparation_time ||
    preparationTime ||
    25;

  // =====================================================
  // PRICE
  // =====================================================

  const formattedPrice =
    Number(price || 0).toFixed(2);

  // =====================================================
  // DESCRIPTION
  // =====================================================

  const foodDescription =
    description ||
    "Delicious and freshly prepared food.";

  // =====================================================
  // STATUS TEXT
  // =====================================================

  let stockStatusText = "Available";

  if (isOutOfStock) {
    stockStatusText = "Out of Stock";
  } else if (isManuallyUnavailable) {
    stockStatusText =
      "Currently Unavailable";
  } else if (
    stockQuantity !== null
  ) {
    stockStatusText =
      `${stockQuantity} in stock`;
  } else {
    stockStatusText = "Available";
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <article
      className={`food-item ${
        !isAvailable
          ? "food-item-unavailable"
          : ""
      }`}
      onClick={handleFoodClick}
    >
      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="food-item-img-container">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={name || "Food"}
            className="food-item-image"
            draggable="false"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="food-image-placeholder">
            <span>🍽️</span>

            <small>
              Image unavailable
            </small>
          </div>
        )}

        <div className="food-image-overlay" />

        {/* =================================================
            WISHLIST BUTTON
        ================================================= */}

        <button
          type="button"
          className={`food-wishlist-btn ${
            isWishlisted
              ? "active"
              : ""
          } ${
            wishlistLoading
              ? "loading"
              : ""
          }`}
          onClick={handleWishlist}
          disabled={wishlistLoading}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          title={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          <span className="wishlist-heart">
            {isWishlisted
              ? "♥"
              : "♡"}
          </span>
        </button>

        {/* =================================================
            POPULAR
        ================================================= */}

        {isPopularFood && (
          <div className="food-popular-badge">
            <span className="popular-star">
              ★
            </span>

            <span>
              Popular
            </span>
          </div>
        )}

        {/* =================================================
            AVAILABILITY
        ================================================= */}

        <div
          className={`food-status-badge ${
            isAvailable
              ? "available"
              : "unavailable"
          }`}
        >
          <span className="status-dot" />

          {isAvailable
            ? "Available"
            : isOutOfStock
            ? "Out of Stock"
            : "Unavailable"}
        </div>

        {/* =================================================
            FOOD TYPE
        ================================================= */}

        {(isVeg || isNonVeg) && (
          <div
            className={`food-type-badge ${
              isVeg
                ? "veg"
                : "non-veg"
            }`}
          >
            <span className="food-type-dot" />

            {isVeg
              ? "VEG"
              : "NON-VEG"}
          </div>
        )}

        {/* =================================================
            UNAVAILABLE OVERLAY
        ================================================= */}

        {!isAvailable && (
          <div className="food-unavailable-overlay">
            <div className="unavailable-glass-card">
              <div className="unavailable-icon-wrap">
                <span>
                  {isOutOfStock
                    ? "📦"
                    : "⏳"}
                </span>
              </div>

              <strong>
                {isOutOfStock
                  ? "Out of Stock"
                  : "Currently Unavailable"}
              </strong>

              <small>
                {isOutOfStock
                  ? "This item is currently sold out"
                  : "This item is temporarily unavailable"}
              </small>
            </div>
          </div>
        )}

        {/* =================================================
            IMAGE DOTS
        ================================================= */}

        {foodImages.length > 1 && (
          <div className="food-image-dots">
            {foodImages.map(
              (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`food-image-dot ${
                    index ===
                    safeImageIndex
                      ? "active"
                      : ""
                  }`}
                  onClick={(e) =>
                    handleImageChange(
                      e,
                      index
                    )
                  }
                  aria-label={`View image ${
                    index + 1
                  }`}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* =================================================
          FOOD INFORMATION
      ================================================= */}

      <div className="food-item-info">

        {/* TITLE */}

        <div className="food-item-title-row">
          <h3
            className="food-item-name"
            title={name}
          >
            {name || "Food Item"}
          </h3>

          <div className="food-item-rating">
            <span className="rating-star">
              ★
            </span>

            <strong>
              4.5
            </strong>
          </div>
        </div>

        {/* RESTAURANT */}

        {restaurant_name && (
          <div className="food-restaurant-name">
            🏪 {restaurant_name}
          </div>
        )}

        {/* META */}

        <div className="food-item-meta">
          <span className="food-preparation">
            <span className="meta-icon">
              ⏱
            </span>

            {prepTime} min
          </span>

          <span className="meta-separator">
            •
          </span>

          <span>
            Freshly prepared
          </span>
        </div>

        {/* DESCRIPTION */}

        <p
          className="food-item-description"
          title={foodDescription}
        >
          {foodDescription}
        </p>

        {/* STOCK */}

        <div
          className={`food-stock-info ${
            isOutOfStock
              ? "stock-empty"
              : isManuallyUnavailable
              ? "stock-empty"
              : stockQuantity !== null &&
                stockQuantity <= 5
              ? "stock-low"
              : "stock-normal"
          }`}
        >
          <span className="stock-icon">
            📦
          </span>

          <span className="stock-label">
            {stockStatusText}
          </span>
        </div>

        {/* PRICE + CART */}

        <div className="food-item-bottom">

          <div className="food-item-price">
            <span className="price-symbol">
              ₹
            </span>

            {formattedPrice}
          </div>

          {/* UNAVAILABLE */}

          {!isAvailable ? (
            <button
              type="button"
              className="unavailable-btn"
              disabled
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {isOutOfStock
                ? "Out of Stock"
                : "Unavailable"}
            </button>
          ) : quantity === 0 ? (

            /* ADD */

            <button
              type="button"
              className="quick-add-btn"
              onClick={handleAdd}
            >
              <span className="quick-add-plus">
                +
              </span>

              <span>
                Add
              </span>
            </button>

          ) : (

            /* COUNTER */

            <div
              className="food-item-counter"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <button
                type="button"
                className="counter-btn counter-remove"
                onClick={handleRemove}
              >
                −
              </button>

              <span className="counter-value">
                {quantity}
              </span>

              <button
                type="button"
                className="counter-btn counter-add"
                disabled={
                  stockLimitReached
                }
                onClick={handleAdd}
              >
                {stockLimitReached
                  ? "✓"
                  : "+"}
              </button>
            </div>
          )}
        </div>

        {/* STOCK LIMIT */}

        {isAvailable &&
          stockLimitReached &&
          quantity > 0 && (
            <div className="stock-limit-message">
              Maximum available quantity reached
            </div>
          )}

        {/* LOW STOCK */}

        {isAvailable &&
          stockQuantity !== null &&
          stockQuantity > 0 &&
          stockQuantity <= 5 && (
            <div className="stock-limit-message">
              Only {stockQuantity} left
            </div>
          )}
      </div>
    </article>
  );
};

export default FoodItem;