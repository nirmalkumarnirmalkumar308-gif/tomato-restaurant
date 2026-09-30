import React, { useEffect, useState } from "react";
import {
  getItems,
  updateItem,
  getCategories,
  getSubCategories,
} from "./api";

const EditItem = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [selectedId, setSelectedId] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  const loadItems = async () => {
    try {
      const res = await getItems();
      setItems(res.data);
    } catch (error) {
      console.log(
        "Items Error:",
        error.response?.data || error.message
      );
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      console.log(
        "Category Error:",
        error.response?.data || error.message
      );
    }
  };

  const handleSelectItem = async (e) => {
    const id = e.target.value;

    setSelectedId(id);

    if (!id) {
      clearForm();
      return;
    }

    const item = items.find(
      (item) => item.id === Number(id)
    );

    if (!item) {
      return;
    }

    setCategoryId(String(item.category_id));
    setSubCategoryId(
      String(item.sub_category_id)
    );

    setName(item.name);
    setPrice(item.price);
    setDescription(item.description || "");

    try {
      const res = await getSubCategories(
        item.category_id
      );

      setSubCategories(res.data);
    } catch (error) {
      console.log(error);
      setSubCategories([]);
    }
  };

  const handleCategoryChange = async (e) => {
    const id = e.target.value;

    setCategoryId(id);
    setSubCategoryId("");

    if (!id) {
      setSubCategories([]);
      return;
    }

    try {
      const res = await getSubCategories(id);
      setSubCategories(res.data);
    } catch (error) {
      console.log(error);
      setSubCategories([]);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedId) {
      alert("Please select an item");
      return;
    }

    try {
      const res = await updateItem(selectedId, {
        category_id: Number(categoryId),
        sub_category_id: Number(subCategoryId),
        name: name,
        price: Number(price),
        description: description,
      });

      console.log(res.data);

      alert("Item updated successfully");

      loadItems();

    } catch (error) {
      console.log(
        "Update Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Error updating item"
      );
    }
  };

  const clearForm = () => {
    setSelectedId("");
    setCategoryId("");
    setSubCategoryId("");
    setSubCategories([]);
    setName("");
    setPrice("");
    setDescription("");
  };

  return (
    <div className="edit-item-container">

      <h2>Edit Food Item</h2>

      {/* SELECT ITEM */}
      <div>
        <label>Select Item</label>

        <select
          value={selectedId}
          onChange={handleSelectItem}
        >
          <option value="">
            Select Item
          </option>

          {items.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.name}
            </option>
          ))}
        </select>
      </div>


      <form onSubmit={handleUpdate}>

        {/* CATEGORY */}
        <div>
          <label>Category</label>

          <select
            value={categoryId}
            onChange={handleCategoryChange}
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>


        {/* SUB CATEGORY */}
        <div>
          <label>Sub Category</label>

          <select
            value={subCategoryId}
            onChange={(e) =>
              setSubCategoryId(e.target.value)
            }
            disabled={!categoryId}
          >
            <option value="">
              Select Sub Category
            </option>

            {subCategories.map((subCategory) => (
              <option
                key={subCategory.id}
                value={subCategory.id}
              >
                {subCategory.name}
              </option>
            ))}
          </select>
        </div>


        {/* NAME */}
        <div>
          <label>Item Name</label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        </div>


        {/* PRICE */}
        <div>
          <label>Price</label>

          <input
            type="number"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
          />
        </div>


        {/* DESCRIPTION */}
        <div>
          <label>Description</label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />
        </div>


        <button type="submit">
          Update Item
        </button>

      </form>

    </div>
  );
};

export default EditItem;