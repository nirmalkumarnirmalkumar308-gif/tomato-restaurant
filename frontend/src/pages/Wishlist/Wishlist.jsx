import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./Wishlist.css";

const API_URL = "http://localhost:4000/api";

const Wishlist = () => {
  const navigate = useNavigate();

  const [wishlist, setWishlist] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("userToken") ||
      ""
    );
  };

  const getImageUrl = (item) => {
    if (!item) {
      return "";
    }

    let image =
      item.images || item.image;

    if (Array.isArray(image)) {
      image = image[0];
    }

    if (typeof image === "string") {
      try {
        const parsed =
          JSON.parse(image);

        if (Array.isArray(parsed)) {
          image = parsed[0];
        } else if (parsed) {
          image = parsed;
        }
      } catch {
        // normal string
      }
    }

    if (
      typeof image === "object" &&
      image !== null
    ) {
      image =
        image.url ||
        image.secure_url ||
        image.src ||
        image.path ||
        "";
    }

    if (!image) {
      return "";
    }

    const path =
      String(image).trim();

    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    ) {
      return path;
    }

    return `http://localhost:4000/${path.replace(
      /^\/+/,
      ""
    )}`;
  };

  // =====================================================
  // FETCH WISHLIST
  // =====================================================

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setWishlist([]);
        setError(
          "Please login to view your wishlist."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/wishlist`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load wishlist"
        );
      }

      setWishlist(
        Array.isArray(data?.wishlist)
          ? data.wishlist
          : []
      );
    } catch (err) {
      console.error(
        "WISHLIST FETCH ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to load wishlist."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // =====================================================
  // REMOVE
  // =====================================================

  const handleRemove = async (
    itemId
  ) => {
    const token = getToken();

    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/wishlist/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to remove item"
        );
      }

      setWishlist((previous) =>
        previous.filter(
          (wishlistItem) =>
            String(
              wishlistItem.item_id
            ) !== String(itemId)
        )
      );
    } catch (err) {
      console.error(
        "REMOVE WISHLIST ERROR:",
        err
      );

      alert(
        err.message ||
          "Unable to remove item."
      );
    }
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = (
    item
  ) => {
    const food =
      item?.item;

    if (!food) {
      return;
    }

    const stock = Number(
      food.stock_quantity
    );

    const availability =
      food.availability;

    if (
      availability === false ||
      availability === 0 ||
      (Number.isFinite(stock) &&
        stock <= 0)
    ) {
      alert(
        "This food is currently unavailable."
      );

      return;
    }

    const cart =
      JSON.parse(
        localStorage.getItem(
          "cartItems"
        ) || "{}"
      );

    const id = String(
      food.id
    );

    cart[id] =
      Number(cart[id] || 0) + 1;

    if (
      Number.isFinite(stock) &&
      cart[id] > stock
    ) {
      cart[id] = stock;

      alert(
        `Only ${stock} item${
          stock > 1 ? "s" : ""
        } available.`
      );
    }

    localStorage.setItem(
      "cartItems",
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );

    alert(
      `${food.name} added to cart.`
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-loading">
          <div className="wishlist-spinner" />

          <h3>
            Loading your wishlist...
          </h3>

          <p>
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (
    error &&
    wishlist.length === 0
  ) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">
            ❤️
          </div>

          <h2>
            Your Wishlist
          </h2>

          <p>
            {error}
          </p>

          {getToken() ? (
            <button
              type="button"
              onClick={fetchWishlist}
              className="wishlist-primary-btn"
            >
              Try Again
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new Event(
                    "openLogin"
                  )
                )
              }
              className="wishlist-primary-btn"
            >
              Login
            </button>
          )}
        </div>
      </div>
    );
  }

  // =====================================================
  // EMPTY
  // =====================================================

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">
            ♡
          </div>

          <h2>
            Your Wishlist is Empty
          </h2>

          <p>
            Save your favourite food
            items here and order them
            whenever you want.
          </p>

          <button
            type="button"
            className="wishlist-primary-btn"
            onClick={() =>
              navigate("/")
            }
          >
            Explore Food
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="wishlist-page">

      {/* HEADER */}

      <div className="wishlist-header">
        <div>
          <span className="wishlist-label">
            YOUR FAVOURITES
          </span>

          <h1>
            My Wishlist ❤️
          </h1>

          <p>
            {wishlist.length} saved{" "}
            {wishlist.length === 1
              ? "item"
              : "items"}
          </p>
        </div>

        <button
          type="button"
          className="wishlist-back-btn"
          onClick={() =>
            navigate("/")
          }
        >
          ← Continue Shopping
        </button>
      </div>

      {/* ITEMS */}

      <div className="wishlist-grid">
        {wishlist.map(
          (wishlistItem) => {
            const food =
              wishlistItem.item;

            if (!food) {
              return null;
            }

            const image =
              getImageUrl(food);

            const stock =
              Number(
                food.stock_quantity
              );

            const isAvailable =
              food.availability !==
                false &&
              food.availability !==
                0 &&
              (!Number.isFinite(
                stock
              ) ||
                stock > 0);

            return (
              <article
                className="wishlist-card"
                key={
                  wishlistItem.id
                }
              >

                {/* IMAGE */}

                <div
                  className="wishlist-image-wrap"
                  onClick={() =>
                    navigate(
                      `/food/${food.id}`
                    )
                  }
                >
                  {image ? (
                    <img
                      src={image}
                      alt={
                        food.name ||
                        "Food"
                      }
                      className="wishlist-image"
                    />
                  ) : (
                    <div className="wishlist-image-placeholder">
                      🍽️
                    </div>
                  )}

                  <button
                    type="button"
                    className="wishlist-remove-icon"
                    onClick={(e) => {
                      e.stopPropagation();

                      handleRemove(
                        food.id
                      );
                    }}
                    title="Remove from wishlist"
                  >
                    ♥
                  </button>

                  {!isAvailable && (
                    <div className="wishlist-unavailable">
                      Unavailable
                    </div>
                  )}
                </div>

                {/* CONTENT */}

                <div className="wishlist-card-content">

                  <div className="wishlist-title-row">
                    <h3>
                      {food.name}
                    </h3>

                    <span className="wishlist-rating">
                      ★ 4.5
                    </span>
                  </div>

                  {food.restaurant_name && (
                    <p className="wishlist-restaurant">
                      🏪{" "}
                      {
                        food.restaurant_name
                      }
                    </p>
                  )}

                  <p className="wishlist-description">
                    {food.description ||
                      "Delicious and freshly prepared food."}
                  </p>

                  <div className="wishlist-bottom">

                    <div className="wishlist-price">
                      ₹
                      {Number(
                        food.price || 0
                      ).toFixed(2)}
                    </div>

                    <button
                      type="button"
                      className={
                        isAvailable
                          ? "wishlist-cart-btn"
                          : "wishlist-disabled-btn"
                      }
                      disabled={
                        !isAvailable
                      }
                      onClick={() =>
                        handleAddToCart(
                          wishlistItem
                        )
                      }
                    >
                      {isAvailable
                        ? "+ Add to Cart"
                        : "Unavailable"}
                    </button>

                  </div>

                  {isAvailable &&
                    Number.isFinite(
                      stock
                    ) &&
                    stock <= 5 && (
                      <div className="wishlist-low-stock">
                        Only {stock} left
                      </div>
                    )}
                </div>
              </article>
            );
          }
        )}
      </div>
    </div>
  );
};

export default Wishlist;