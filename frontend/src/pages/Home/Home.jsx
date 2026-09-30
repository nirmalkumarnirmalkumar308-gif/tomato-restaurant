import React from "react";
import { useSearchParams } from "react-router-dom";
import "./Home.css";

import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import PopularFood from "../../components/PopularFood/PopularFood";
import Offers from "../../components/Offers/Offers";
import About from "../../components/About/About";
import Contact from "../../components/Contact/Contact";

const Home = () => {
  const [searchParams] = useSearchParams();
  const searchText = searchParams.get("search") || "";

  return (
    <div>

      {/* HERO */}
      <Header />

      {/* MENU SECTION */}
      <section id="menu-section">
        <ExploreMenu />
      </section>

      {/* POPULAR FOOD SECTION */}
      <section id="popular-section">
        <PopularFood searchText={searchText} />
      </section>

      {/* OFFERS */}
      <Offers />

      {/* ABOUT */}
      <About />

      {/* CONTACT */}
      <Contact />

    </div>
  );
};

export default Home;