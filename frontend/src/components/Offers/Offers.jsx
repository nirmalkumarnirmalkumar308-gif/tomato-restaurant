import React from "react";
import "./Offers.css";

const Offers = () => {
  const offers = [
    {
      icon: "🎉",
      title: "20% OFF",
      description: "Get 20% off on your first order.",
      code: "WELCOME20",
    },
    {
      icon: "🚚",
      title: "FREE DELIVERY",
      description: "Free delivery on orders above ₹500.",
      code: "FREE500",
    },
    {
      icon: "🍕",
      title: "BUY 1 GET 1",
      description: "Enjoy selected dishes with our special offer.",
      code: "B1G1",
    },
  ];

  const handleOffer = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          alert(`Offer code "${code}" copied!`);
        })
        .catch(() => {
          alert(`Use offer code: ${code}`);
        });
    } else {
      alert(`Use offer code: ${code}`);
    }
  };

  return (
    <section className="offers" id="offers">

      <div className="offers-title">
        <span>BEST DEALS</span>

        <h2>Today's Special Offers</h2>

        <p>
          Grab our exclusive deals and enjoy your favourite
          food at the best prices.
        </p>
      </div>

      <div className="offers-list">

        {offers.map((offer) => (
          <div className="offer-card" key={offer.code}>

            <div className="offer-icon">
              {offer.icon}
            </div>

            <div className="offer-content">

              <h3>{offer.title}</h3>

              <p>{offer.description}</p>

              <div className="offer-bottom">

                <span>
                  Code: <strong>{offer.code}</strong>
                </span>

                <button
                  onClick={() => handleOffer(offer.code)}
                >
                  Copy Code
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
};

export default Offers;