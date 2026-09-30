import React, { useEffect, useState } from "react";
import axios from "axios";

const SubCategoryManagement = () => {

  const [categories, setCategories] = useState([]);

  const [subCategories, setSubCategories] =
    useState([]);

  const [categoryId, setCategoryId] =
    useState("");

  const [name, setName] =
    useState("");


  const API =
    "http://localhost:4000";


  // =========================
  // GET CATEGORIES
  // =========================

  const getCategories = async () => {

    try {

      const response = await axios.get(
        `${API}/api/categories`
      );

      console.log(
        "Categories:",
        response.data
      );

      setCategories(response.data);

    } catch (error) {

      console.log(
        "Category Error:",
        error
      );

    }
  };


  // =========================
  // GET SUB CATEGORIES
  // =========================

  const getSubCategories = async () => {

    try {

      const response = await axios.get(
        `${API}/api/subcategories`
      );

      setSubCategories(
        response.data
      );

    } catch (error) {

      console.log(
        "SubCategory Error:",
        error
      );

    }
  };


  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {

    getCategories();

    getSubCategories();

  }, []);


  // =========================
  // ADD SUB CATEGORY
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!categoryId) {

      alert(
        "Please select category"
      );

      return;
    }


    if (!name.trim()) {

      alert(
        "Please enter sub category name"
      );

      return;
    }


    try {

      const response =
        await axios.post(
          `${API}/api/subcategories`,
          {
            category_id:
              Number(categoryId),

            name:
              name.trim()
          }
        );


      alert(
        response.data.message
      );


      setCategoryId("");

      setName("");


      getSubCategories();

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Error adding sub category"
      );

    }
  };


  return (

    <div
      style={{
        width: "80%",
        margin: "40px auto"
      }}
    >

      <h1>
        Sub Category Management
      </h1>

      <p>
        Add food sub categories
      </p>


      <form
        onSubmit={handleSubmit}
      >

        {/* CATEGORY */}

        <div
          style={{
            marginBottom: "20px"
          }}
        >

          <label>
            <b>Category</b>
          </label>

          <br />

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(
                e.target.value
              )
            }
            style={{
              width: "300px",
              padding: "12px",
              marginTop: "8px"
            }}
          >

            <option value="">
              Select Category
            </option>


            {categories.map(
              (category) => (

                <option
                  key={category.id}
                  value={category.id}
                >

                  {category.name}

                </option>

              )
            )}

          </select>

        </div>


        {/* SUB CATEGORY */}

        <div
          style={{
            marginBottom: "20px"
          }}
        >

          <label>
            <b>
              Sub Category Name
            </b>
          </label>

          <br />

          <input
            type="text"
            placeholder="Example: Starters"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            style={{
              width: "300px",
              padding: "12px",
              marginTop: "8px"
            }}
          />

        </div>


        <button
          type="submit"
          style={{
            padding:
              "12px 25px",
            cursor: "pointer"
          }}
        >

          Add Sub Category

        </button>

      </form>


      {/* LIST */}

      <h2
        style={{
          marginTop: "40px"
        }}
      >
        Sub Categories
      </h2>


      {subCategories.map(
        (subCategory) => {

          const category =
            categories.find(
              (cat) =>
                cat.id ===
                subCategory.category_id
            );


          return (

            <div
              key={subCategory.id}
              style={{
                padding: "12px",
                marginBottom: "8px",
                border:
                  "1px solid #ddd"
              }}
            >

              <b>
                {category?.name}
              </b>

              {" → "}

              {subCategory.name}

            </div>

          );

        }
      )}

    </div>

  );
};


export default SubCategoryManagement;