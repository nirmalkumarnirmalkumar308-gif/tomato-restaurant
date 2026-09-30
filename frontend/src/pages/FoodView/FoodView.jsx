import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./FoodView.css";

import { StoreContext } from "../../context/StoreContext.jsx";

const FoodView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    food_list,
    cartItems,
    addToCart,
    removeFromCart,
    fetchFoodById,
    loading: storeLoading,
  } = useContext(StoreContext);

  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);

  const [isWishlist, setIsWishlist] =
    useState(false);

  const [quantity, setQuantity] = useState(1);

  const [shareMessage, setShareMessage] =
    useState("");

  /* =====================================================
     NORMALIZE AVAILABILITY
  ===================================================== */

  const normalizeAvailability = (value) => {
    return (
      value === true ||
      value === 1 ||
      value === "1" ||
      value === "true" ||
      value === "TRUE"
    );
  };

  /* =====================================================
     LOAD FOOD
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const loadFood = async () => {
      setLoading(true);

      try {
        const localFood =
          food_list?.find(
            (item) =>
              String(item.id) === String(id)
          );

        if (localFood) {
          if (mounted) {
            setFood(localFood);
            setLoading(false);
          }

          return;
        }

        if (fetchFoodById) {
          const result =
            await fetchFoodById(id);

          if (mounted) {
            setFood(result || null);
          }
        }
      } catch (error) {
        console.error(
          "FOOD VIEW ERROR:",
          error
        );

        if (mounted) {
          setFood(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFood();

    return () => {
      mounted = false;
    };
  }, [
    id,
    food_list,
    fetchFoodById,
  ]);

  /* =====================================================
     RESET IMAGE
  ===================================================== */

  useEffect(() => {
    setActiveImage(0);
  }, [id]);

  /* =====================================================
     WISHLIST LOAD
  ===================================================== */

  useEffect(() => {
    try {
      const savedWishlist =
        JSON.parse(
          localStorage.getItem(
            "wishlistItems"
          )
        ) || [];

      setIsWishlist(
        savedWishlist.some(
          (item) =>
            String(item) === String(id)
        )
      );
    } catch (error) {
      console.error(
        "Wishlist load error:",
        error
      );

      setIsWishlist(false);
    }
  }, [id]);

  /* =====================================================
     FOOD DATA
  ===================================================== */

  const stock = Number(
    food?.stock_quantity
  );

  const validStock =
    Number.isFinite(stock) && stock >= 0
      ? stock
      : 0;

  const databaseAvailability =
    normalizeAvailability(
      food?.backend_availability ??
        food?.availability
    );

  const isOutOfStock =
    validStock <= 0;

  const isAvailable =
    databaseAvailability &&
    !isOutOfStock;

  const currentCartQuantity =
    Number(
      cartItems?.[String(id)] ||
        cartItems?.[id] ||
        0
    );

  const remainingStock = Math.max(
    validStock - currentCartQuantity,
    0
  );

  /* =====================================================
     IMAGES
  ===================================================== */

  const imageList = useMemo(() => {
    if (!food) {
      return [];
    }

    let images = [];

    if (Array.isArray(food.images)) {
      images = [...food.images];
    } else if (
      typeof food.images === "string"
    ) {
      try {
        const parsed =
          JSON.parse(food.images);

        if (Array.isArray(parsed)) {
          images = [...parsed];
        }
      } catch {
        images = [];
      }
    }

    if (food.image) {
      images.unshift(food.image);
    }

    return images
      .filter(Boolean)
      .map((image) => String(image))
      .filter(
        (image, index, array) =>
          array.indexOf(image) === index
      );
  }, [food]);

  /* =====================================================
     IMAGE URL
  ===================================================== */

  const getImageUrl = (path) => {
    if (!path) {
      return "/placeholder-food.jpg";
    }

    const cleanPath =
      String(path).trim();

    if (
      cleanPath.startsWith("http://") ||
      cleanPath.startsWith("https://") ||
      cleanPath.startsWith("data:")
    ) {
      return cleanPath;
    }

    return `http://localhost:4000/${cleanPath.replace(
      /^\/+/,
      ""
    )}`;
  };

  /* =====================================================
     CATEGORY
  ===================================================== */

  const categoryName =
    food?.Category?.name ||
    food?.category?.name ||
    food?.category ||
    "Food";

  const subCategoryName =
    food?.SubCategory?.name ||
    food?.subCategory?.name ||
    food?.subcategory ||
    "";

  /* =====================================================
     FOOD TYPE
  ===================================================== */

  const foodType =
    food?.food_type ||
    food?.foodType ||
    "";

  const normalizedFoodType =
    String(foodType)
      .toLowerCase()
      .trim();

  const isVeg =
    normalizedFoodType === "veg" ||
    normalizedFoodType ===
      "vegetarian";

  const isNonVeg =
    normalizedFoodType ===
      "non-veg" ||
    normalizedFoodType ===
      "non veg" ||
    normalizedFoodType ===
      "nonvegetarian";

  /* =====================================================
     QUANTITY
  ===================================================== */

  const increaseQuantity = () => {
    if (!isAvailable) {
      return;
    }

    if (quantity >= validStock) {
      return;
    }

    setQuantity(
      (previous) => previous + 1
    );
  };

  const decreaseQuantity = () => {
    setQuantity(
      (previous) =>
        Math.max(previous - 1, 1)
    );
  };

  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAddToCart = () => {
    if (!food || !isAvailable) {
      return;
    }

    const availableToAdd =
      validStock - currentCartQuantity;

    if (availableToAdd <= 0) {
      return;
    }

    const amountToAdd = Math.min(
      quantity,
      availableToAdd
    );

    for (
      let i = 0;
      i < amountToAdd;
      i++
    ) {
      addToCart(food.id);
    }

    setQuantity(1);
  };

  /* =====================================================
     BUY NOW
  ===================================================== */

  const handleBuyNow = () => {
    if (!food || !isAvailable) {
      return;
    }

    const availableToAdd =
      validStock - currentCartQuantity;

    if (availableToAdd <= 0) {
      navigate("/cart");
      return;
    }

    const amountToAdd = Math.min(
      quantity,
      availableToAdd
    );

    for (
      let i = 0;
      i < amountToAdd;
      i++
    ) {
      addToCart(food.id);
    }

    navigate("/order");
  };

  /* =====================================================
     CART PLUS
  ===================================================== */

  const handleCartIncrease = () => {
    if (!isAvailable) {
      return;
    }

    if (
      currentCartQuantity >=
      validStock
    ) {
      return;
    }

    addToCart(food.id);
  };

  /* =====================================================
     CART MINUS
  ===================================================== */

  const handleCartDecrease = () => {
    if (currentCartQuantity <= 0) {
      return;
    }

    removeFromCart(food.id);
  };

  /* =====================================================
     WISHLIST
  ===================================================== */

  const toggleWishlist = () => {
    try {
      const savedWishlist =
        JSON.parse(
          localStorage.getItem(
            "wishlistItems"
          )
        ) || [];

      const itemId = String(id);

      const exists =
        savedWishlist.some(
          (item) =>
            String(item) === itemId
        );

      let updatedWishlist;

      if (exists) {
        updatedWishlist =
          savedWishlist.filter(
            (item) =>
              String(item) !== itemId
          );

        setIsWishlist(false);
      } else {
        updatedWishlist = [
          ...savedWishlist,
          itemId,
        ];

        setIsWishlist(true);
      }

      localStorage.setItem(
        "wishlistItems",
        JSON.stringify(
          updatedWishlist
        )
      );

      window.dispatchEvent(
        new Event("wishlistChanged")
      );
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );
    }
  };

  /* =====================================================
     SHARE
  ===================================================== */

  const handleShare = async () => {
    const shareUrl =
      window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title:
            food?.name ||
            "Tomato Food",

          text: `Check out ${
            food?.name ||
            "this delicious food"
          } on Tomato.`,

          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(
          shareUrl
        );

        setShareMessage(
          "Link copied!"
        );

        setTimeout(() => {
          setShareMessage("");
        }, 2000);
      }
    } catch {
      console.log(
        "Share cancelled."
      );
    }
  };

  /* =====================================================
     RELATED FOODS
  ===================================================== */

  const relatedFoods = useMemo(() => {
    if (
      !food ||
      !Array.isArray(food_list)
    ) {
      return [];
    }

    return food_list
      .filter((item) => {
        if (
          String(item.id) ===
          String(food.id)
        ) {
          return false;
        }

        const itemAvailability =
          normalizeAvailability(
            item.availability
          );

        const itemStock = Number(
          item.stock_quantity
        );

        if (
          !itemAvailability ||
          !Number.isFinite(itemStock) ||
          itemStock <= 0
        ) {
          return false;
        }

        const itemCategory =
          item?.Category?.name ||
          item?.category?.name ||
          item?.category ||
          "";

        return (
          String(itemCategory)
            .toLowerCase()
            .trim() ===
          String(categoryName)
            .toLowerCase()
            .trim()
        );
      })
      .slice(0, 4);
  }, [
    food,
    food_list,
    categoryName,
  ]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading || storeLoading) {
    return (
      <div className="food-view-page">
        <div className="food-view-loading">
          <div className="food-view-spinner"></div>

          <h3>
            Loading delicious food...
          </h3>

          <p>
            Please wait while we
            prepare the details.
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     FOOD NOT FOUND
  ===================================================== */

  if (!food) {
    return (
      <div className="food-view-page">
        <div className="food-view-error">
          <div className="error-icon">
            🍽️
          </div>

          <h2>
            Food not found
          </h2>

          <p>
            Sorry, we couldn't find
            this food item.
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN RENDER
  ===================================================== */

  return (
    <div className="food-view-page">
      <div className="food-view-container">

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="food-breadcrumb">
          <button
            onClick={() =>
              navigate(-1)
            }
          >
            ← Back
          </button>

          <span>Home</span>
          <span>/</span>
          <span>{categoryName}</span>
          <span>/</span>

          <strong>
            {food.name}
          </strong>
        </div>

        {/* =================================================
            MAIN FOOD SECTION
        ================================================= */}

        <div className="food-view-main">

          {/* =================================================
              IMAGE SECTION
          ================================================= */}

          <div className="food-gallery">
            <div className="food-main-image-card">

              {food.is_popular ||
              food.isPopular ? (
                <div className="food-popular-tag">
                  ⭐ Popular Choice
                </div>
              ) : null}

              {!isAvailable && (
                <div className="food-unavailable-overlay">
                  <span>
                    Currently Unavailable
                  </span>
                </div>
              )}

              {imageList.length > 0 ? (
                <img
                  src={getImageUrl(
                    imageList[
                      activeImage
                    ]
                  )}
                  alt={food.name}
                  className={
                    !isAvailable
                      ? "food-main-image unavailable-image"
                      : "food-main-image"
                  }
                />
              ) : (
                <div className="no-food-image">
                  <span>🍽️</span>
                  <span>
                    No image available
                  </span>
                </div>
              )}

              {imageList.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery-arrow gallery-prev"
                    onClick={() =>
                      setActiveImage(
                        activeImage === 0
                          ? imageList.length -
                            1
                          : activeImage - 1
                      )
                    }
                    aria-label="Previous image"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="gallery-arrow gallery-next"
                    onClick={() =>
                      setActiveImage(
                        activeImage ===
                          imageList.length -
                            1
                          ? 0
                          : activeImage + 1
                      )
                    }
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* THUMBNAILS */}

            {imageList.length > 1 && (
              <div className="food-thumbnail-list">
                {imageList.map(
                  (image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      className={
                        activeImage === index
                          ? "food-thumbnail active"
                          : "food-thumbnail"
                      }
                      onClick={() =>
                        setActiveImage(
                          index
                        )
                      }
                    >
                      <img
                        src={getImageUrl(
                          image
                        )}
                        alt={`${food.name} ${
                          index + 1
                        }`}
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* =================================================
              FOOD INFORMATION
          ================================================= */}

          <div className="food-information">

            {/* TOP INFORMATION */}

            <div className="food-info-top">

              <div className="food-category">
                <span>
                  {categoryName}
                </span>

                {subCategoryName && (
                  <>
                    <span className="category-separator">
                      •
                    </span>

                    <span>
                      {subCategoryName}
                    </span>
                  </>
                )}
              </div>

              {/* ACTION BUTTONS */}

              <div className="food-action-buttons">

                <button
                  type="button"
                  className={
                    isWishlist
                      ? "food-icon-btn wishlist active"
                      : "food-icon-btn wishlist"
                  }
                  onClick={
                    toggleWishlist
                  }
                  title={
                    isWishlist
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"
                  }
                  aria-label="Wishlist"
                >
                  {isWishlist
                    ? "♥"
                    : "♡"}
                </button>

                <button
                  type="button"
                  className="food-icon-btn share"
                  onClick={handleShare}
                  title="Share"
                  aria-label="Share"
                >
                  ↗
                </button>

              </div>
            </div>

            {/* FOOD NAME */}

            <h1>{food.name}</h1>

            {/* RESTAURANT */}

            {food.restaurant_name && (
              <div className="restaurant-name">
                <span className="restaurant-icon">
                  🏪
                </span>

                <span>
                  {food.restaurant_name}
                </span>
              </div>
            )}

            {/* RATING */}

            <div className="food-rating-row">
              <div className="food-rating">
                <span className="rating-star">
                  ★
                </span>

                <strong>
                  4.5
                </strong>

                <span>
                  120+ ratings
                </span>
              </div>

              <span className="rating-divider">
                |
              </span>

              <span>
                100+ reviews
              </span>
            </div>

            {/* DESCRIPTION */}

            <p className="food-description">
              {food.description ||
                "Freshly prepared with quality ingredients and delicious flavours."}
            </p>

            {/* PRICE */}

            <div className="food-price-section">
              <div className="food-price">
                ₹
                {Number(
                  food.price || 0
                ).toFixed(2)}
              </div>

              <span className="price-note">
                Inclusive of all applicable taxes
              </span>
            </div>

            {/* FOOD TAGS */}

            <div className="food-tags">

              {isVeg && (
                <span className="food-tag veg">
                  <span className="tag-dot"></span>
                  Pure Veg
                </span>
              )}

              {isNonVeg && (
                <span className="food-tag nonveg">
                  <span className="tag-dot"></span>
                  Non-Veg
                </span>
              )}

              {food.is_popular ||
              food.isPopular ? (
                <span className="food-tag popular">
                  ⭐ Popular
                </span>
              ) : null}

              {food.is_featured ||
              food.isFeatured ? (
                <span className="food-tag featured">
                  ✦ Featured
                </span>
              ) : null}

            </div>

            {/* DETAILS GRID */}

            <div className="food-details-grid">

              <div className="food-detail-box">
                <span className="detail-icon">
                  🚴
                </span>

                <div>
                  <small>
                    Preparation
                  </small>

                  <strong>
                    {food.preparation_time ||
                      food.preparationTime ||
                      20}{" "}
                    mins
                  </strong>
                </div>
              </div>

              <div className="food-detail-box">
                <span className="detail-icon">
                  🌶️
                </span>

                <div>
                  <small>
                    Spice Level
                  </small>

                  <strong>
                    {food.spice_level ||
                      "MEDIUM"}
                  </strong>
                </div>
              </div>

              <div className="food-detail-box">
                <span className="detail-icon">
                  🔥
                </span>

                <div>
                  <small>
                    Calories
                  </small>

                  <strong>
                    {food.calories
                      ? `${food.calories} kcal`
                      : "N/A"}
                  </strong>
                </div>
              </div>

              <div className="food-detail-box">
                <span className="detail-icon">
                  👥
                </span>

                <div>
                  <small>
                    Serves
                  </small>

                  <strong>
                    {food.serves || 1}
                  </strong>
                </div>
              </div>

            </div>

            {/* =================================================
                AVAILABILITY
            ================================================= */}

            <div
              className={
                isAvailable
                  ? "food-stock-card available"
                  : "food-stock-card unavailable"
              }
            >

              <div className="stock-status">

                <span className="status-icon">
                  {isAvailable
                    ? "✓"
                    : "!"}
                </span>

                <div className="stock-text">
                  <strong>
                    {isAvailable
                      ? "Available"
                      : "Currently Unavailable"}
                  </strong>

                  <small>
                    {isAvailable
                      ? `${validStock} items available`
                      : isOutOfStock
                      ? "This item is currently out of stock"
                      : "This item is temporarily unavailable"}
                  </small>
                </div>

              </div>

              {isAvailable &&
                validStock <= 5 && (
                  <span className="low-stock">
                    Only {validStock} left
                  </span>
                )}

            </div>

            {/* =================================================
                PURCHASE
            ================================================= */}

            {isAvailable && (
              <div className="purchase-section">

                <div className="quantity-section">
                  <span>
                    Quantity
                  </span>

                  <div className="quantity-control">

                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      disabled={
                        quantity <= 1
                      }
                    >
                      −
                    </button>

                    <span>
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      disabled={
                        quantity >=
                        validStock
                      }
                    >
                      +
                    </button>

                  </div>
                </div>

                <div className="purchase-buttons">

                  <button
                    type="button"
                    className="add-cart-btn"
                    onClick={
                      handleAddToCart
                    }
                    disabled={
                      remainingStock <=
                      0
                    }
                  >
                    🛒 Add to Cart
                  </button>

                  <button
                    type="button"
                    className="buy-now-btn"
                    onClick={
                      handleBuyNow
                    }
                    disabled={
                      remainingStock <=
                      0
                    }
                  >
                    Buy Now
                  </button>

                </div>
              </div>
            )}

            {/* =================================================
                CURRENT CART
            ================================================= */}

            {currentCartQuantity > 0 && (
              <div className="already-cart">

                <div className="cart-info">

                  <span className="cart-check">
                    ✓
                  </span>

                  <div>
                    <strong>
                      In your cart
                    </strong>

                    <small>
                      {currentCartQuantity}{" "}
                      item
                      {currentCartQuantity >
                      1
                        ? "s"
                        : ""}
                    </small>
                  </div>

                </div>

                <div className="mini-cart-control">

                  <button
                    type="button"
                    onClick={
                      handleCartDecrease
                    }
                  >
                    −
                  </button>

                  <span>
                    {currentCartQuantity}
                  </span>

                  <button
                    type="button"
                    onClick={
                      handleCartIncrease
                    }
                    disabled={
                      currentCartQuantity >=
                      validStock
                    }
                  >
                    +
                  </button>

                </div>

                <button
                  type="button"
                  className="view-cart-btn"
                  onClick={() =>
                    navigate("/cart")
                  }
                >
                  View Cart →
                </button>

              </div>
            )}

            {/* SHARE MESSAGE */}

            {shareMessage && (
              <div className="share-message">
                ✓ {shareMessage}
              </div>
            )}

          </div>
        </div>

        {/* =================================================
            EXTRA INFORMATION
        ================================================= */}

        <section className="food-extra-section">

          <div className="extra-section-header">
            <span>
              WHY YOU'LL LOVE IT
            </span>

            <h2>
              Fresh. Delicious. Made for you.
            </h2>
          </div>

          <div className="benefits-grid">

            <div className="benefit-card">
              <div>🥗</div>

              <h3>
                Fresh Ingredients
              </h3>

              <p>
                Carefully selected
                ingredients prepared
                fresh for every order.
              </p>
            </div>

            <div className="benefit-card">
              <div>👨‍🍳</div>

              <h3>
                Expertly Prepared
              </h3>

              <p>
                Prepared with care
                to deliver delicious
                taste and quality.
              </p>
            </div>

            <div className="benefit-card">
              <div>🚴</div>

              <h3>
                Fast Delivery
              </h3>

              <p>
                Freshly prepared food
                delivered quickly to
                your doorstep.
              </p>
            </div>

            <div className="benefit-card">
              <div>🔒</div>

              <h3>
                Secure Ordering
              </h3>

              <p>
                A smooth and secure
                ordering experience
                from start to finish.
              </p>
            </div>

          </div>
        </section>

        {/* =================================================
            RELATED FOODS
        ================================================= */}

        {relatedFoods.length > 0 && (
          <section className="related-food-section">

            <div className="related-header">

              <div>
                <span>
                  YOU MAY ALSO LIKE
                </span>

                <h2>
                  More from {categoryName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/category/${categoryName}`
                  )
                }
              >
                View all →
              </button>

            </div>

            <div className="related-food-grid">

              {relatedFoods.map(
                (item) => (
                  <button
                    type="button"
                    className="related-food-card"
                    key={item.id}
                    onClick={() =>
                      navigate(
                        `/food/${item.id}`
                      )
                    }
                  >

                    <div className="related-image">

                      <img
                        src={getImageUrl(
                          Array.isArray(
                            item.images
                          )
                            ? item
                                .images[0]
                            : item.image
                        )}
                        alt={item.name}
                      />

                      <span>
                        ★ 4.5
                      </span>

                    </div>

                    <div className="related-info">

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        {item.description ||
                          "Delicious and freshly prepared."}
                      </p>

                      <strong>
                        ₹
                        {Number(
                          item.price || 0
                        ).toFixed(2)}
                      </strong>

                    </div>

                  </button>
                )
              )}

            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default FoodView;