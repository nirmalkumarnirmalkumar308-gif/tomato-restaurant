import React, { useState } from "react";
import "./AdminPages.css";
import AdminBackButton from "./AdminBackbutton";
const AdminSettings = () => {
  const [restaurantName, setRestaurantName] =
    useState("Tomato Food");

  const [email, setEmail] =
    useState("admin@tomato.com");

  const [phone, setPhone] =
    useState("9876543210");

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="admin-page">

      {/* =========================
          BACK TO DASHBOARD
      ========================= */}

      <AdminBackButton />

      {/* =========================
          HEADER
      ========================= */}

      <div className="admin-page-header">

        <div>
          <span>SYSTEM</span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your admin and restaurant settings.
          </p>
        </div>

      </div>

      {/* =========================
          SETTINGS
      ========================= */}

      <div className="settings-grid">

        {/* RESTAURANT INFORMATION */}

        <div className="settings-card">

          <h2>
            Restaurant Information
          </h2>

          <p>
            Update your restaurant information.
          </p>

          {/* RESTAURANT NAME */}

          <label>
            Restaurant Name
          </label>

          <input
            type="text"
            value={restaurantName}
            onChange={(e) =>
              setRestaurantName(e.target.value)
            }
          />

          {/* ADMIN EMAIL */}

          <label>
            Admin Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          {/* PHONE */}

          <label>
            Phone Number
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />

          {/* SAVE */}

          <button
            type="button"
            className="primary-btn save-btn"
            onClick={handleSave}
          >
            Save Changes
          </button>

        </div>

        {/* NOTIFICATIONS */}

        <div className="settings-card">

          <h2>
            Notifications
          </h2>

          <p>
            Manage admin notifications.
          </p>

          {/* NEW ORDERS */}

          <div className="setting-row">

            <div>
              <strong>
                New Orders
              </strong>

              <span>
                Get notified when a new order arrives.
              </span>
            </div>

            <input
              type="checkbox"
              defaultChecked
            />

          </div>

          {/* NEW USERS */}

          <div className="setting-row">

            <div>
              <strong>
                New Users
              </strong>

              <span>
                Get notified when a customer registers.
              </span>
            </div>

            <input
              type="checkbox"
              defaultChecked
            />

          </div>

          {/* LOW STOCK */}

          <div className="setting-row">

            <div>
              <strong>
                Low Stock
              </strong>

              <span>
                Receive low stock notifications.
              </span>
            </div>

            <input
              type="checkbox"
            />

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminSettings;