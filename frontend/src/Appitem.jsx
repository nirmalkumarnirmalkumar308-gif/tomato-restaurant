const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "http://localhost:4000/api/items",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_id: Number(categoryId),
          sub_category_id: Number(subCategoryId),
          name: name,
          price: Number(price),
          description: description,
        }),
      }
    );

    const data = await response.json();

    console.log("Backend Response:", data);

    if (!response.ok) {
      throw new Error(data.error || data.message);
    }

    alert("Item created successfully");

  } catch (error) {
    console.error("Error creating item:", error);
    alert(error.message);
  }
};