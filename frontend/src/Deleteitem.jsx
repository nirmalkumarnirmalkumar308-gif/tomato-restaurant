import React, { useEffect, useState } from "react";
import { getItems, deleteItem } from "./api";

const DeleteItem = () => {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");

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

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) {
      alert("Please select an item");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteItem(selectedId);

      alert("Item deleted successfully");

      setSelectedId("");

      loadItems();

    } catch (error) {
      console.log(
        "Delete Error:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div>

      <h2>Delete Food Item</h2>

      <select
        value={selectedId}
        onChange={(e) =>
          setSelectedId(e.target.value)
        }
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

      <button onClick={handleDelete}>
        Delete Item
      </button>

    </div>
  );
};

export default DeleteItem;