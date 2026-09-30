import React from "react";
import {
  HiArrowTrendingUp,
} from "react-icons/hi2";

import "./AdminPages.css";
import AdminBackButton from "./AdminBackbutton";

const AdminAnalytics = () => {
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
          <span>BUSINESS ANALYTICS</span>

          <h1>
            Analytics
          </h1>

          <p>
            Understand your restaurant performance.
          </p>
        </div>

        <select className="analytics-select">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
        </select>

      </div>

      {/* =========================
          ANALYTICS CARDS
      ========================= */}

      <div className="analytics-cards">

        {/* TOTAL REVENUE */}

        <div className="analytics-card">

          <span>
            Total Revenue
          </span>

          <strong>
            ₹24,580
          </strong>

          <small>
            <HiArrowTrendingUp />
            +12.5% this week
          </small>

        </div>

        {/* TOTAL ORDERS */}

        <div className="analytics-card">

          <span>
            Total Orders
          </span>

          <strong>
            1,284
          </strong>

          <small>
            <HiArrowTrendingUp />
            +8.2% this week
          </small>

        </div>

        {/* AVERAGE ORDER */}

        <div className="analytics-card">

          <span>
            Average Order
          </span>

          <strong>
            ₹286
          </strong>

          <small>
            <HiArrowTrendingUp />
            +5.4% this week
          </small>

        </div>

        {/* CUSTOMERS */}

        <div className="analytics-card">

          <span>
            Customers
          </span>

          <strong>
            3,642
          </strong>

          <small>
            <HiArrowTrendingUp />
            +15.3% this week
          </small>

        </div>

      </div>

      {/* =========================
          REVENUE OVERVIEW
      ========================= */}

      <div className="analytics-big-card">

        <div className="analytics-card-header">

          <div>

            <h2>
              Revenue Overview
            </h2>

            <p>
              Weekly revenue performance
            </p>

          </div>

        </div>

        <div className="big-bars">

          <div>
            <span>Mon</span>
            <div
              className="bar"
              style={{ height: "45%" }}
            ></div>
          </div>

          <div>
            <span>Tue</span>
            <div
              className="bar"
              style={{ height: "60%" }}
            ></div>
          </div>

          <div>
            <span>Wed</span>
            <div
              className="bar"
              style={{ height: "52%" }}
            ></div>
          </div>

          <div>
            <span>Thu</span>
            <div
              className="bar"
              style={{ height: "72%" }}
            ></div>
          </div>

          <div>
            <span>Fri</span>
            <div
              className="bar"
              style={{ height: "65%" }}
            ></div>
          </div>

          <div>
            <span>Sat</span>
            <div
              className="bar"
              style={{ height: "90%" }}
            ></div>
          </div>

          <div>
            <span>Sun</span>
            <div
              className="bar"
              style={{ height: "78%" }}
            ></div>
          </div>

        </div>

      </div>

      {/* =========================
          TWO COLUMN ANALYTICS
      ========================= */}

      <div className="analytics-two">

        {/* TOP CATEGORIES */}

        <div className="analytics-big-card">

          <h2>
            Top Categories
          </h2>

          {/* VEG */}

          <div className="progress-item">

            <div>
              <span>
                Veg
              </span>

              <strong>
                52%
              </strong>
            </div>

            <div className="progress">
              <span
                style={{ width: "52%" }}
              ></span>
            </div>

          </div>

          {/* NON VEG */}

          <div className="progress-item">

            <div>
              <span>
                Non-Veg
              </span>

              <strong>
                28%
              </strong>
            </div>

            <div className="progress">
              <span
                style={{ width: "28%" }}
              ></span>
            </div>

          </div>

          {/* PIZZA */}

          <div className="progress-item">

            <div>
              <span>
                Pizza
              </span>

              <strong>
                12%
              </strong>
            </div>

            <div className="progress">
              <span
                style={{ width: "12%" }}
              ></span>
            </div>

          </div>

          {/* DESSERT */}

          <div className="progress-item">

            <div>
              <span>
                Dessert
              </span>

              <strong>
                8%
              </strong>
            </div>

            <div className="progress">
              <span
                style={{ width: "8%" }}
              ></span>
            </div>

          </div>

        </div>

        {/* CUSTOMER GROWTH */}

        <div className="analytics-big-card">

          <h2>
            Customer Growth
          </h2>

          <div className="customer-number">
            3,642
          </div>

          <p>
            Total registered customers
          </p>

          <div className="growth-box">

            +15.3%

            <span>
              compared to last month
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminAnalytics;