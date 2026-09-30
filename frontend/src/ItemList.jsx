import React, { useEffect, useState } from "react";
import { getItems, deleteItem } from "./api";

const ItemList = () => {
  const [items, setItems] = useState([]);

  const loadItems = async () => {
    try {
      const res = await getItems();

      console.log("Items:", res.data);

      setItems(res.data);
    } catch (error) {
      console.log(
        "Get Items Error:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteItem(id);

      alert("Item deleted successfully");

      loadItems();
    } catch (error) {
      console.log(
        "Delete Error:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="item-list-container">

      <h2>Food Items</h2>

      {items.length === 0 ? (
        <p>No food items found</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="item-card"
          >
            <h3>{item.name}</h3>

            <p>
              Price: ₹{item.price}
            </p>

            <p>
              {item.description}
            </p>

            <button
              onClick={() =>
                handleDelete(item.id)
              }
            >
              Delete
            </button>
          </div>
        ))
      )}

    </div>
  );
};

export default ItemList;