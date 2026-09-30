import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext.jsx";

const Cart = () => {
  const {
    cartItems,
    food_list,
    addToCart,
    removeFromCart,
    removeItem,
    clearCart,
    getTotalCartAmount,
    getDeliveryFee,
    getTaxAmount,
    getGrandTotal,
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const subtotal = getTotalCartAmount();
  const deliveryFee = getDeliveryFee();
  const tax = getTaxAmount();
  const grandTotal = getGrandTotal();

  const cartProducts = food_list.filter(
    (item) => Number(cartItems[String(item.id)] || 0) > 0
  );

  return (
    <div className="cart">

      {/* CART HEADER */}
      <div className="cart-header">
        <div>
          <h1>Your Cart</h1>
          <p>
            Review your items before checkout
          </p>
        </div>

        {cartProducts.length > 0 && (
          <button
            className="clear-cart-btn"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        )}
      </div>

      {/* EMPTY CART */}
      {cartProducts.length === 0 ? (

        <div className="empty-cart">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h2>Your cart is empty</h2>

          <p>
            Add delicious food items to continue.
          </p>

          <button
            onClick={() => navigate("/")}
          >
            Browse Food
          </button>

        </div>

      ) : (

        <div className="cart-layout">

          {/* CART ITEMS */}
          <div className="cart-items">

            {cartProducts.map((item) => {

              const id = String(item.id);

              const quantity =
                Number(cartItems[id] || 0);

              const imageUrl = item.image
                ? item.image.startsWith("http")
                  ? item.image
                  : `http://localhost:4000/${item.image.replace(
                      /^\/+/,
                      ""
                    )}`
                : "";

              const itemTotal =
                Number(item.price || 0) *
                quantity;

              return (
                <div
                  className="cart-product"
                  key={id}
                >

                  {/* IMAGE */}
                  <div className="cart-product-image">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                      />
                    ) : (
                      <div className="cart-image-placeholder">
                        🍽️
                      </div>
                    )}

                  </div>

                  {/* PRODUCT INFO */}
                  <div className="cart-product-info">

                    <h3>{item.name}</h3>

                    <p>
                      {item.description}
                    </p>

                    <span>
                      ₹
                      {Number(item.price).toFixed(2)}
                    </span>

                  </div>

                  {/* QUANTITY */}
                  <div className="cart-quantity">

                    <button
                      onClick={() =>
                        removeFromCart(id)
                      }
                    >
                      −
                    </button>

                    <strong>
                      {quantity}
                    </strong>

                    <button
                      onClick={() =>
                        addToCart(id)
                      }
                    >
                      +
                    </button>

                  </div>

                  {/* ITEM TOTAL */}
                  <div className="cart-item-total">

                    <strong>
                      ₹{itemTotal.toFixed(2)}
                    </strong>

                    <button
                      className="delete-item"
                      onClick={() =>
                        removeItem(id)
                      }
                    >
                      🗑
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

          {/* ORDER SUMMARY */}
          <div className="cart-summary">

            <h2>Order Summary</h2>

            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹{subtotal.toFixed(2)}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Delivery Fee
              </span>

              <strong>
                {deliveryFee === 0
                  ? "FREE"
                  : `₹${deliveryFee.toFixed(2)}`}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Tax (5%)
              </span>

              <strong>
                ₹{tax.toFixed(2)}
              </strong>

            </div>

            <hr />

            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                ₹{grandTotal.toFixed(2)}
              </strong>

            </div>

            {/* CHECKOUT */}
            <button
              className="checkout-btn"
              onClick={() => navigate("/order")}
            >
              Proceed to Checkout →
            </button>

            {/* CONTINUE SHOPPING */}
            <button
              className="continue-btn"
              onClick={() => navigate("/")}
            >
              ← Continue Shopping
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default Cart;