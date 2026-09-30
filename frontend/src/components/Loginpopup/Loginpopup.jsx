import React, { useState } from "react";
import "./Loginpopup.css";
import { assets } from "../../assets/assets/frontend_assets/assets";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

const API_URL = "http://localhost:4000/api";

const Loginpopup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("Login");

  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOGIN / SIGN UP
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // =================================================
      // LOGIN
      // =================================================

      if (currState === "Login") {
        if (!email.trim() || !password.trim()) {
          setError(
            "Email/Mobile Number and Password are required."
          );

          setLoading(false);
          return;
        }

        const response = await axios.post(
          `${API_URL}/users/login`,
          {
            login: email.trim(),
            password,
          }
        );

        console.log("=================================");
        console.log("LOGIN RESPONSE:", response.data);
        console.log("=================================");

        // =================================================
        // GET TOKEN
        // =================================================

        const token =
          response.data?.token ||
          response.data?.accessToken ||
          response.data?.data?.token;

        if (!token) {
          console.error(
            "LOGIN ERROR: Token not received from backend"
          );

          setError(
            "Login successful, but authentication token was not received."
          );

          setLoading(false);
          return;
        }

        // =================================================
        // VALIDATE JWT FORMAT
        // =================================================

        const tokenParts = String(token).split(".");

        console.log("JWT TOKEN RECEIVED");
        console.log(
          "JWT TOKEN PARTS:",
          tokenParts.length
        );

        if (tokenParts.length !== 3) {
          console.error(
            "Invalid JWT token format"
          );

          localStorage.removeItem("token");

          setError(
            "Invalid authentication token received from server."
          );

          setLoading(false);
          return;
        }

        // =================================================
        // SAVE TOKEN
        // =================================================

        localStorage.setItem("token", token);

        // Compatibility keys
        localStorage.setItem("authToken", token);
        localStorage.setItem("userToken", token);

        console.log(
          "JWT TOKEN SAVED SUCCESSFULLY"
        );

        console.log(
          "TOKEN CHECK:",
          localStorage.getItem("token")
            ? "TOKEN EXISTS"
            : "TOKEN MISSING"
        );

        // =================================================
        // SAVE USER DATA
        // =================================================

        if (response.data?.user) {
          const user = response.data.user;

          localStorage.setItem(
            "user",
            JSON.stringify(user)
          );

          const role =
            user.role?.toLowerCase() || "user";

          localStorage.setItem(
            "role",
            role
          );

          console.log(
            "LOGIN USER:",
            user
          );

          console.log(
            "LOGIN ROLE:",
            role
          );
        }

        // =================================================
        // SUCCESS
        // =================================================

        setSuccess("Login successful!");

        setEmail("");
        setPassword("");

        // =================================================
        // CLOSE + REFRESH
        // =================================================

        setTimeout(() => {
          setShowLogin(false);

          window.location.reload();
        }, 500);
      }

      // =================================================
      // SIGN UP
      // =================================================

      else {
        // =================================================
        // REQUIRED FIELDS
        // =================================================

        if (
          !name.trim() ||
          !email.trim() ||
          !phone.trim() ||
          !password.trim()
        ) {
          setError(
            "Name, Email, Mobile Number and Password are required."
          );

          setLoading(false);
          return;
        }

        // =================================================
        // EMAIL VALIDATION
        // =================================================

        const emailRegex =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
          setError(
            "Please enter a valid email address."
          );

          setLoading(false);
          return;
        }

        // =================================================
        // MOBILE VALIDATION
        // =================================================

        if (phone.length < 10) {
          setError(
            "Please enter a valid mobile number."
          );

          setLoading(false);
          return;
        }

        // =================================================
        // PASSWORD VALIDATION
        // =================================================

        if (password.length < 6) {
          setError(
            "Password must contain at least 6 characters."
          );

          setLoading(false);
          return;
        }

        // =================================================
        // REGISTER
        // =================================================

        const response = await axios.post(
          `${API_URL}/users/register`,
          {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
          }
        );

        console.log(
          "REGISTER RESPONSE:",
          response.data
        );

        // =================================================
        // SUCCESS
        // =================================================

        setSuccess(
          "Registration successful! Please login."
        );

        // =================================================
        // CLEAR FIELDS
        // =================================================

        setName("");
        setEmail("");
        setPhone("");
        setPassword("");

        // =================================================
        // SWITCH TO LOGIN
        // =================================================

        setTimeout(() => {
          setCurrState("Login");
          setSuccess("");
        }, 1000);
      }
    } catch (error) {
      console.log("=================================");
      console.log("FULL LOGIN ERROR:", error);

      console.log(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      console.log(
        "STATUS:",
        error.response?.status
      );

      console.log("=================================");

      if (error.response) {
        const backendMessage =
          error.response.data?.message;

        const backendError =
          error.response.data?.error;

        setError(
          backendMessage ||
            backendError ||
            `Request failed with status ${error.response.status}`
        );
      } else if (error.request) {
        setError(
          "Cannot connect to backend server. Make sure backend is running on port 4000."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SWITCH LOGIN / SIGN UP
  // =====================================================

  const switchState = (state) => {
    setCurrState(state);

    setError("");
    setSuccess("");

    setShowPassword(false);
  };

  // =====================================================
  // CLOSE POPUP
  // =====================================================

  const handleClose = () => {
    setShowLogin(false);
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="login-popup">
      <form
        className="login-popup-container"
        onSubmit={handleSubmit}
      >
        {/* =================================================
            TITLE
        ================================================= */}

        <div className="login-popup-title">
          <h2>{currState}</h2>

          <img
            src={assets.cross_icon}
            alt="Close"
            onClick={handleClose}
          />
        </div>

        {/* =================================================
            INPUTS
        ================================================= */}

        <div className="login-popup-inputs">

          {/* NAME */}

          {currState === "Sign Up" && (
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />
          )}

          {/* EMAIL / MOBILE */}

          {currState === "Login" ? (
            <input
              type="text"
              placeholder="Email or Mobile Number"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          ) : (
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          )}

          {/* PHONE */}

          {currState === "Sign Up" && (
            <input
              type="tel"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => {
                const value =
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 15);

                setPhone(value);
              }}
              required
            />
          )}

          {/* PASSWORD */}

          <div className="password-field">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <span
              className="eye-icon"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </span>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <p className="login-success">
            {success}
          </p>
        )}

        {/* =================================================
            SUBMIT BUTTON
        ================================================= */}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : currState === "Login"
            ? "Login"
            : "Create Account"}
        </button>

        {/* =================================================
            TERMS
        ================================================= */}

        <div className="login-popup-condition">
          <input
            type="checkbox"
            required
          />

          <p>
            By continuing, I agree to the
            terms of use & privacy policy.
          </p>
        </div>

        {/* =================================================
            SWITCH LOGIN / SIGN UP
        ================================================= */}

        {currState === "Login" ? (
          <p className="switch-text">
            Create a new account?{" "}

            <span
              onClick={() =>
                switchState("Sign Up")
              }
            >
              Click here
            </span>
          </p>
        ) : (
          <p className="switch-text">
            Already have an account?{" "}

            <span
              onClick={() =>
                switchState("Login")
              }
            >
              Login here
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

export default Loginpopup;