import React, { useEffect, useState } from "react";
import axios from "axios";

const CategoryManagement = () => {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);

  const API = "http://localhost:4000";

  // GET ALL CATEGORIES
  const getCategories = async () => {
    try {
      const response = await axios.get(
        `${API}/api/categories`
      );

      setCategories(response.data);
    } catch (error) {
      console.log("Category Error:", error);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  // ADD CATEGORY
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter category name");
      return;
    }

    try {
      const response = await axios.post(
        `${API}/api/categories`,
        {
          name: name.trim()
        }
      );

      alert(response.data.message);

      setName("");

      // Refresh category list
      getCategories();

    } catch (error) {
      console.log(error);

      if (
        error.response?.data?.error?.includes(
          "Duplicate"
        )
      ) {
        alert("Category already exists");
      } else {
        alert(
          error.response?.data?.message ||
          "Error adding category"
        );
      }
    }
  };

  return (
    <div
      style={{
        width: "80%",
        margin: "40px auto"
      }}
    >

      <h1>Category Management</h1>

      <p>Add your food categories</p>


      {/* ADD CATEGORY */}

      <form onSubmit={handleSubmit}>

        <label>
          <b>Category Name</b>
        </label>

        <br />

        <input
          type="text"
          placeholder="Enter category name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          style={{
            width: "300px",
            padding: "12px",
            marginTop: "10px",
            marginRight: "10px"
          }}
        />

        <button
          type="submit"
          style={{
            padding: "12px 20px",
            cursor: "pointer"
          }}
        >
          Add Category
        </button>

      </form>


      {/* CATEGORY LIST */}

      <h2
        style={{
          marginTop: "40px"
        }}
      >
        Categories
      </h2>


      {categories.length === 0 ? (

        <p>No categories found</p>

      ) : (

        <div>

          {categories.map((category) => (

            <div
              key={category.id}
              style={{
                padding: "12px",
                marginBottom: "10px",
                border: "1px solid #ddd",
                borderRadius: "8px"
              }}
            >

              {category.id}.{" "}

              <b>
                {category.name}
              </b>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default CategoryManagement;