import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      alert("Please fill all fields.");
      return;
    }

    alert("Thank you! Your message has been sent.");

    setForm({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <section className="contact" id="contact">

      <div className="contact-container">

        {/* LEFT */}

        <div className="contact-info">

          <span>GET IN TOUCH</span>

          <h2>
            We'd love to
            <br />
            <strong>hear from you.</strong>
          </h2>

          <p>
            Have a question, suggestion, or need help with
            your order? Our team is always happy to help.
          </p>

          <div className="contact-details">

            <div className="contact-detail">

              <div>📞</div>

              <section>
                <small>Call us</small>
                <strong>+91 70106 38522</strong>
              </section>

            </div>

            <div className="contact-detail">

              <div>✉️</div>

              <section>
                <small>Email us</small>
                <strong>support@tomatofood.com</strong>
              </section>

            </div>

            <div className="contact-detail">

              <div>📍</div>

              <section>
                <small>Location</small>
                <strong>Coimbatore, Tamil Nadu</strong>
              </section>

            </div>

          </div>

        </div>


        {/* RIGHT FORM */}

        <form
          className="contact-form"
          onSubmit={handleSubmit}
        >

          <h3>Send us a message</h3>

          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={form.email}
            onChange={handleChange}
          />

          <textarea
            name="message"
            placeholder="Write your message..."
            value={form.message}
            onChange={handleChange}
            rows="5"
          />

          <button type="submit">
            Send Message →
          </button>

        </form>

      </div>

    </section>
  );
};

export default Contact;