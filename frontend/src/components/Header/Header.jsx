import React, { useEffect, useRef, useState } from "react";
import "./Header.css";

const Header = () => {
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const suggestions = [
    "Chicken",
    "Paneer",
    "Biryani",
    "Pizza",
    "Burger",
    "Salad",
    "Pasta",
    "Noodles",
    "Rolls",
    "Cake",
  ];

  const scrollToMenu = () => {
    const menuSection = document.getElementById("menu-section");

    if (menuSection) {
      menuSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const scrollToPopular = () => {
    const popularSection = document.getElementById("popular-section");

    if (popularSection) {
      popularSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      scrollToMenu();
      return;
    }

    localStorage.setItem("foodSearch", value);

    window.dispatchEvent(
      new CustomEvent("foodSearch", {
        detail: value,
      })
    );

    setShowSuggestions(false);

    setTimeout(() => {
      scrollToPopular();
    }, 100);
  };

  const handleSuggestion = (item) => {
    setSearch(item);

    localStorage.setItem("foodSearch", item);

    window.dispatchEvent(
      new CustomEvent("foodSearch", {
        detail: item,
      })
    );

    setShowSuggestions(false);

    setTimeout(() => {
      scrollToPopular();
    }, 100);
  };

  const handleClear = () => {
    setSearch("");

    localStorage.removeItem("foodSearch");

    window.dispatchEvent(
      new CustomEvent("foodSearch", {
        detail: "",
      })
    );
  };

  useEffect(() => {
    const savedSearch = localStorage.getItem("foodSearch");

    if (savedSearch) {
      setSearch(savedSearch);
    }

    const handleOutsideClick = (e) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const filteredSuggestions = suggestions.filter((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="header">
      <div className="header-contents">

        <div className="hero-badge">
          🔥 Fresh & Delicious Food
        </div>

        <h2>
          Order your
          <br />
          favourite food here
        </h2>

        <p>
          Choose from a diverse menu featuring a delectable
          array of dishes crafted with the finest ingredients,
          expertly prepared to deliver exceptional taste and
          freshness.
        </p>

        {/* ADVANCED SEARCH */}
        <div
          className="hero-search-wrapper"
          ref={searchRef}
        >
          <form
            className="hero-search"
            onSubmit={handleSearch}
          >
            <span className="search-icon">🔍</span>

            <input
              type="text"
              placeholder="Search food, category..."
              value={search}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={handleClear}
              >
                ✕
              </button>
            )}

            <button
              type="submit"
              className="search-submit"
            >
              Search
            </button>
          </form>

          {/* SUGGESTIONS */}
          {showSuggestions &&
            filteredSuggestions.length > 0 && (
              <div className="search-suggestions">

                <div className="suggestion-title">
                  🔎 Popular searches
                </div>

                {filteredSuggestions.map(
                  (item, index) => (
                    <button
                      key={index}
                      type="button"
                      className="suggestion-item"
                      onClick={() =>
                        handleSuggestion(item)
                      }
                    >
                      <span>🍴</span>
                      <span>{item}</span>
                    </button>
                  )
                )}

              </div>
            )}
        </div>

        {/* BUTTONS */}
        <div className="hero-buttons">

          <button
            className="view-menu-btn"
            onClick={scrollToMenu}
          >
            View Menu
            <span>→</span>
          </button>

          <button
            className="popular-btn"
            onClick={scrollToPopular}
          >
            🔥 Popular Dishes
          </button>

        </div>

        {/* FEATURES */}
        <div className="hero-features">

          <div className="hero-feature">
            <div className="feature-icon">
              ⚡
            </div>

            <div>
              <strong>Fast Delivery</strong>
              <small>Quick & fresh delivery</small>
            </div>
          </div>

          <div className="hero-feature">
            <div className="feature-icon">
              🥗
            </div>

            <div>
              <strong>Fresh Food</strong>
              <small>Fresh ingredients</small>
            </div>
          </div>

          <div className="hero-feature">
            <div className="feature-icon">
              ⭐
            </div>

            <div>
              <strong>Top Rated</strong>
              <small>Customer favourites</small>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Header;