import React, {
  useContext,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./Placeorder.css";

import {
  StoreContext,
} from "../../context/StoreContext.jsx";

import { createOrder } from "../../api";


const Placeorder = () => {

  const navigate = useNavigate();

  const {
    cartItems,
    food_list,
    getTotalCartAmount,
    clearCart,
  } = useContext(StoreContext);


  // =========================
  // FORM DATA
  // =========================

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });


  // =========================
  // PAYMENT
  // =========================

  const [paymentMethod, setPaymentMethod] =
    useState("cod");


  // =========================
  // ORDER STATE
  // =========================

  const [orderPlaced, setOrderPlaced] =
    useState(false);

  const [orderId, setOrderId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);


  // =========================
  // SUBTOTAL
  // =========================

  const subtotal = getTotalCartAmount();


  // =========================
  // DELIVERY FEE
  // =========================

  const deliveryFee =
    subtotal === 0
      ? 0
      : subtotal >= 500
      ? 0
      : 40;


  // =========================
  // TOTAL
  // =========================

  const totalAmount =
    subtotal + deliveryFee;


  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };


  // =========================
  // PLACE ORDER
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // CART EMPTY CHECK

    if (subtotal <= 0) {

      alert("Your cart is empty");

      navigate("/cart");

      return;
    }


    // FORM VALIDATION

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {

      alert(
        "Please fill all delivery details"
      );

      return;
    }


    // =========================
    // CREATE ORDER ITEMS
    // IMPORTANT:
    // USE item.id
    // NOT item._id
    // =========================
const orderItems = food_list
  .filter((item) => {
    const id = String(item.id);
    const quantity = Number(cartItems[id] || 0);

    return quantity > 0;
  })
  .map((item) => {
    const id = String(item.id);
    const quantity = Number(cartItems[id] || 0);

    return {
      item_id: Number(item.id),
      item_name: item.name,
      price: Number(item.price || 0),
      quantity: quantity,
    };
  });


    console.log(
      "CART ITEMS:",
      cartItems
    );

    console.log(
      "FOOD LIST:",
      food_list
    );

    console.log(
      "ORDER ITEMS:",
      orderItems
    );


    // NO ITEMS CHECK

    if (orderItems.length === 0) {

      alert(
        "No food items found in cart"
      );

      return;
    }


    try {

      setLoading(true);


      // =========================
      // ORDER DATA
      // =========================

      const orderData = {

        first_name:
          formData.firstName.trim(),

        last_name:
          formData.lastName.trim(),

        email:
          formData.email.trim(),

        phone:
          formData.phone.trim(),

        address:
          formData.address.trim(),

        city:
          formData.city.trim(),

        state:
          formData.state.trim(),

        pincode:
          formData.pincode.trim(),

        payment_method:
          paymentMethod === "cod"
            ? "COD"
            : "ONLINE",

        items: orderItems,
      };


      console.log(
        "ORDER DATA:",
        orderData
      );


      // =========================
      // SEND TO BACKEND
      // =========================

      const response =
        await createOrder(orderData);


      console.log(
        "ORDER RESPONSE:",
        response.data
      );


      // =========================
      // GET ORDER ID
      // =========================

      const newOrderId =
        response.data?.order?.id;


      setOrderId(newOrderId);


      // =========================
      // CLEAR CART
      // =========================

      clearCart();


      // =========================
      // SUCCESS
      // =========================

      setOrderPlaced(true);


    } catch (error) {

      console.log(
        "ORDER ERROR:",
        error
      );

      console.log(
        "SERVER ERROR:",
        error.response?.data
      );


      alert(
        error.response?.data?.message ||
        "Error creating order"
      );


    } finally {

      setLoading(false);

    }

  };


  // =========================
  // SUCCESS SCREEN
  // =========================

  if (orderPlaced) {

    return (

      <div className="order-success">

        <div className="success-box">

          <div className="success-icon">
            ✓
          </div>


          <h1>
            Order Placed Successfully!
          </h1>


          {orderId && (

            <p>
              Order ID:{" "}
              <b>
                #{orderId}
              </b>
            </p>

          )}


          <p>

            Thank you for your order.

            <br />

            Your food will be
            delivered soon.

          </p>


          <p className="payment-text">

            Payment Method:{" "}

            <b>

              {paymentMethod === "cod"
                ? "Cash on Delivery"
                : "Online Payment"}

            </b>

          </p>


          <button
            onClick={() =>
              navigate("/")
            }
          >

            Continue Shopping

          </button>

        </div>

      </div>

    );

  }


  // =========================
  // MAIN PAGE
  // =========================

  return (

    <form
      className="place-order"
      onSubmit={handleSubmit}
    >


      {/* =========================
          LEFT SIDE
      ========================= */}

      <div className="place-order-left">

        <h2>
          Delivery Information
        </h2>


        {/* FIRST + LAST NAME */}

        <div className="multi-fields">

          <input
            type="text"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
          />


          <input
            type="text"
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
          />

        </div>


        {/* EMAIL */}

        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
        />


        {/* PHONE */}

        <input
          type="text"
          name="phone"
          placeholder="Phone number"
          value={formData.phone}
          onChange={handleChange}
        />


        {/* ADDRESS */}

        <input
          type="text"
          name="address"
          placeholder="Delivery address"
          value={formData.address}
          onChange={handleChange}
        />


        {/* CITY + STATE */}

        <div className="multi-fields">

          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />


          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
          />

        </div>


        {/* PINCODE */}

        <input
          type="text"
          name="pincode"
          placeholder="Pincode"
          value={formData.pincode}
          onChange={handleChange}
        />


        {/* =========================
            PAYMENT
        ========================= */}

        <div className="payment-section">

          <h2>
            Payment Method
          </h2>


          {/* COD */}

          <label className="payment-option">

            <input
              type="radio"
              name="payment"
              value="cod"
              checked={
                paymentMethod === "cod"
              }
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
            />


            <span>
              Cash on Delivery
            </span>

          </label>


          {/* ONLINE */}

          <label className="payment-option disabled">

            <input
              type="radio"
              name="payment"
              value="online"
              checked={
                paymentMethod === "online"
              }
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
            />


            <span>

              Online Payment

              <small>
                Coming soon
              </small>

            </span>

          </label>

        </div>

      </div>


      {/* =========================
          RIGHT SIDE
      ========================= */}

      <div className="place-order-right">

        <div className="cart-summary">

          <h2>
            Order Summary
          </h2>


          {/* =========================
              CART ITEMS
          ========================= */}

          <div className="summary-items">

            {food_list.map((item) => {

              // IMPORTANT:
              // USE item.id

              const id =
                String(item.id);


              const quantity =
                Number(
                  cartItems[id] || 0
                );


              // ITEM NOT IN CART

              if (quantity <= 0) {
                return null;
              }


              return (

                <div
                  className="summary-item"
                  key={item.id}
                >

                  <div>

                    <p>
                      {item.name}
                    </p>


                    <span>
                      Qty: {quantity}
                    </span>

                  </div>


                  <b>
                    ₹
                    {(
                      Number(item.price) *
                      quantity
                    ).toFixed(2)}
                  </b>

                </div>

              );

            })}

          </div>


          <hr />


          {/* =========================
              SUBTOTAL
          ========================= */}

          <div className="summary-row">

            <p>
              Subtotal
            </p>


            <p>
              ₹{subtotal.toFixed(2)}
            </p>

          </div>


          {/* =========================
              DELIVERY
          ========================= */}

          <div className="summary-row">

            <p>
              Delivery Fee
            </p>


            <p>

              {deliveryFee === 0
                ? "FREE"
                : `₹${deliveryFee.toFixed(2)}`}

            </p>

          </div>


          <hr />


          {/* =========================
              TOTAL
          ========================= */}

          <div className="summary-total">

            <b>
              Total
            </b>


            <b>
              ₹{totalAmount.toFixed(2)}
            </b>

          </div>


          {/* =========================
              PLACE ORDER BUTTON
          ========================= */}

          <button
            type="submit"
            className="place-order-button"
            disabled={
              subtotal === 0 ||
              loading
            }
          >

            {loading
              ? "PLACING ORDER..."
              : "PLACE ORDER"}

          </button>

        </div>

      </div>

    </form>

  );

};


export default Placeorder;