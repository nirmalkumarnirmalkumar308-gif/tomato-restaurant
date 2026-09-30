import React from "react";
import {
  HiMagnifyingGlass,
  HiPencilSquare,
  HiTrash,
} from "react-icons/hi2";

import "./AdminPages.css";
import AdminBackButton from "./AdminBackButton";

const AdminUsers = () => {
  const users = [
    {
      id: 1,
      name: "Admin",
      email: "nirmalkumarnirmalkumar308@gmail.com",
      phone: "7010638522",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Arun Kumar",
      email: "arun@gmail.com",
      phone: "9876543210",
      role: "User",
      status: "Active",
    },
    {
      id: 3,
      name: "Priya S",
      email: "priya@gmail.com",
      phone: "9876543211",
      role: "User",
      status: "Active",
    },
    {
      id: 4,
      name: "Rahul M",
      email: "rahul@gmail.com",
      phone: "9876543212",
      role: "User",
      status: "Active",
    },
    {
      id: 5,
      name: "Karthik",
      email: "karthik@gmail.com",
      phone: "9876543213",
      role: "User",
      status: "Inactive",
    },
  ];

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
          <span>
            USER MANAGEMENT
          </span>

          <h1>
            Users
          </h1>

          <p>
            View and manage registered customers.
          </p>
        </div>

      </div>

      {/* =========================
          STATS
      ========================= */}

      <div className="page-stats">

        <div>
          <small>
            Total Users
          </small>

          <strong>
            3,642
          </strong>
        </div>

        <div>
          <small>
            Active Users
          </small>

          <strong>
            3,421
          </strong>
        </div>

        <div>
          <small>
            New Users
          </small>

          <strong>
            124
          </strong>
        </div>

      </div>

      {/* =========================
          USER TABLE
      ========================= */}

      <div className="admin-table-card">

        {/* TOOLBAR */}

        <div className="table-toolbar">

          <div className="table-search">

            <HiMagnifyingGlass />

            <input
              type="text"
              placeholder="Search users..."
            />

          </div>

          <select>

            <option>
              All Users
            </option>

            <option>
              Admin
            </option>

            <option>
              User
            </option>

          </select>

        </div>

        {/* TABLE */}

        <div className="table-scroll">

          <table className="admin-table">

            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  User
                </th>

                <th>
                  Email
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Role
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {users.map((user) => (

                <tr key={user.id}>

                  {/* ID */}

                  <td>
                    #{user.id}
                  </td>

                  {/* USER */}

                  <td>

                    <div className="user-name">

                      <div className="user-avatar">
                        {user.name.charAt(0)}
                      </div>

                      <strong>
                        {user.name}
                      </strong>

                    </div>

                  </td>

                  {/* EMAIL */}

                  <td>
                    {user.email}
                  </td>

                  {/* PHONE */}

                  <td>
                    {user.phone}
                  </td>

                  {/* ROLE */}

                  <td>

                    <span
                      className={
                        user.role === "Admin"
                          ? "role admin-role"
                          : "role user-role"
                      }
                    >
                      {user.role}
                    </span>

                  </td>

                  {/* STATUS */}

                  <td>

                    <span
                      className={
                        user.status === "Active"
                          ? "status available"
                          : "status unavailable"
                      }
                    >
                      {user.status}
                    </span>

                  </td>

                  {/* ACTION */}

                  <td>

                    <div className="action-buttons">

                      <button
                        type="button"
                        className="edit-btn"
                        title="Edit User"
                      >
                        <HiPencilSquare />
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        title="Delete User"
                      >
                        <HiTrash />
                      </button>

                    </div>

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

export default AdminUsers;