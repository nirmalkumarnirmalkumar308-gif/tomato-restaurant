import React from "react";
import {
  HiMagnifyingGlass,
  HiEye,
} from "react-icons/hi2";

import AdminBackButton from "./AdminBackButton";
import "./AdminPages.css";

const AdminOrders = () => {
  const orders = [
    {
      id: "#ORD-1024",
      customer: "Arun Kumar",
      food: "Veg Burger",
      amount: "₹240",
      date: "10 Sep 2026",
      status: "Delivered",
    },
    {
      id: "#ORD-1023",
      customer: "Priya S",
      food: "Paneer Pizza",
      amount: "₹420",
      date: "10 Sep 2026",
      status: "Preparing",
    },
    {
      id: "#ORD-1022",
      customer: "Rahul M",
      food: "Veg Noodles",
      amount: "₹180",
      date: "10 Sep 2026",
      status: "Pending",
    },
    {
      id: "#ORD-1021",
      customer: "Karthik",
      food: "French Fries",
      amount: "₹120",
      date: "09 Sep 2026",
      status: "Delivered",
    },
    {
      id: "#ORD-1020",
      customer: "Divya",
      food: "Pasta",
      amount: "₹280",
      date: "09 Sep 2026",
      status: "Cancelled",
    },
  ];

  return (
    <div className="admin-page">

      {/* Back to Dashboard */}
      <AdminBackButton />

      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <span>ORDER MANAGEMENT</span>
          <h1>Orders</h1>
          <p>Track and manage customer orders.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="page-stats">

        <div>
          <small>Total Orders</small>
          <strong>1,284</strong>
        </div>

        <div>
          <small>Preparing</small>
          <strong>32</strong>
        </div>

        <div>
          <small>Delivered</small>
          <strong>1,182</strong>
        </div>

        <div>
          <small>Cancelled</small>
          <strong>70</strong>
        </div>

      </div>

      {/* Orders Table */}
      <div className="admin-table-card">

        {/* Toolbar */}
        <div className="table-toolbar">

          <div className="table-search">
            <HiMagnifyingGlass />

            <input
              type="text"
              placeholder="Search orders..."
            />
          </div>

          <select defaultValue="All Status">
            <option>All Status</option>
            <option>Pending</option>
            <option>Preparing</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>

        </div>

        {/* Table */}
        <div className="table-scroll">

          <table className="admin-table">

            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Food</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {orders.map((order) => (

                <tr key={order.id}>

                  <td>
                    <strong>{order.id}</strong>
                  </td>

                  <td>
                    {order.customer}
                  </td>

                  <td>
                    {order.food}
                  </td>

                  <td>
                    <strong>{order.amount}</strong>
                  </td>

                  <td>
                    {order.date}
                  </td>

                  <td>
                    <span
                      className={`status ${order.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="view-btn"
                      title="View Order"
                    >
                      <HiEye />
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default AdminOrders;