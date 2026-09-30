import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets/frontend_assets/assets";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">

        <div className="footer-content-left">
          <img src={assets.logo} alt="" />

          <p>
            Tomato delivers fresh and delicious meals to your doorstep with fast delivery,
            great quality, and affordable prices. Enjoy your favorite food anytime,
            anywhere
          </p>

          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="facebook" onError={() => console.log("Facebook image failed")} />

            <img src={assets.twitter_icon} alt="twitter" />
            <img src={assets.linkedin_icon} alt="linkedin" />
          </div>
        </div>

        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+91 9876543210</li>
            <li>contact@fooddel.com</li>
          </ul>
        </div>

      </div>

      <hr />

      <p className="footer-copyright">
        Copyright © 2026 FoodDel.com - All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;