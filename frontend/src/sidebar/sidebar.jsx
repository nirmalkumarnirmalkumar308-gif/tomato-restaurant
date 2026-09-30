import React from "react";
import "./Sidebar.css";
import {
  X,
  House,
  Grid,
  Cart3,
  Bag,
  Person,
  Telephone,
  BoxArrowRight,
} from "react-bootstrap-icons";

const Sidebar = ({ sidebar, setSidebar }) => {
  return (
    <div className={sidebar ? "sidebar active" : "sidebar"}>
      <div className="close-icon" onClick={() => setSidebar(false)}>
        <X size={30} />
      </div>

      <h2 className="sidebar-logo">Foodie</h2>

      <ul>
        <li>
          <House size={20} />
          <span>Home</span>
        </li>

        <li>
          <Grid size={20} />
          <span>Menu</span>
        </li>

        <li>
          <Cart3 size={20} />
          <span>Cart</span>
        </li>

        <li>
          <Bag size={20} />
          <span>Orders</span>
        </li>

        <li>
          <Person size={20} />
          <span>Profile</span>
        </li>

        <li>
          <Telephone size={20} />
          <span>Contact</span>
        </li>

        <li className="logout">
          <BoxArrowRight size={20} />
          <span>Logout</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;