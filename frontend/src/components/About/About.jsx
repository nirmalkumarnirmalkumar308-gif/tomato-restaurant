import React from "react";
import "./About.css";

const About = () => {
  return (
    <section className="about" id="about">
      <div className="about-container">

        <div className="about-visual">
          <div className="about-main-icon">
            🍅
          </div>

          <div className="about-small-card">
            <strong>100%</strong>
            <span>Fresh & Tasty</span>
          </div>
        </div>

        <div className="about-content">
          <span className="about-label">
            ABOUT TOMATO
          </span>

          <h2>
            Good food.
            <br />
            <span>Good mood.</span>
          </h2>

          <p>
            Tomato is a modern food delivery platform created
            to make ordering your favourite food simple, fast,
            and enjoyable.
          </p>

          <p>
            From fresh salads and delicious pizzas to pasta,
            noodles and desserts, we bring a variety of tasty
            dishes right to your doorstep.
          </p>

          <div className="about-features">
            <div>
              <strong>🥗</strong>
              <span>Fresh Food</span>
            </div>

            <div>
              <strong>⚡</strong>
              <span>Fast Delivery</span>
            </div>

            <div>
              <strong>❤️</strong>
              <span>Best Quality</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;