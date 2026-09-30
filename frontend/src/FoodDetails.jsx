import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getItemById,
  updateItem,
  deleteItem,
  getCategories,
  getSubCategories,
} from "./api";

import "./FoodDetails.css";

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [food, setFood] = useState(null);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [activeImage, setActiveImage] = useState(0);

  /*
    Existing images:
    [
      "image1.jpg",
      "image2.jpg"
    ]
  */
  const [existingImages, setExistingImages] = useState([]);

  /*
    New images:
    [
      {
        file: File,
        preview: "blob:..."
      }
    ]
  */
  const [newImages, setNewImages] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
    sub_category_id: "",

    availability: true,

    preparation_time: "",
    food_type: "",
    spice_level: "",
    calories: "",
    serves: "",

    is_popular: false,
    is_featured: false,
  });

  /* =====================================================
     LOAD FOOD
  ===================================================== */

  useEffect(() => {
    loadFood();
    loadCategories();
    loadSubCategories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadFood = async () => {
    try {
      setLoading(true);

      const data = await getItemById(id);

      const item = data?.item || data;

      if (!item) {
        alert("Food not found.");
        navigate("/admin/foods");
        return;
      }

      setFood(item);

      /* -----------------------------
         GET IMAGES
      ----------------------------- */

      let imageList = [];

      if (Array.isArray(item.images)) {
        imageList = item.images.filter(Boolean);
      }

      if (imageList.length === 0 && item.image) {
        imageList = [item.image];
      }

      /*
        First image is treated as MAIN IMAGE.
      */
      setExistingImages(imageList);

      /* -----------------------------
         GET FORM DATA
      ----------------------------- */

      setForm({
        name: item.name || "",

        price:
          item.price === null || item.price === undefined
            ? ""
            : item.price,

        description: item.description || "",

        category_id:
          item.category_id === null ||
          item.category_id === undefined
            ? ""
            : item.category_id,

        sub_category_id:
          item.sub_category_id === null ||
          item.sub_category_id === undefined
            ? ""
            : item.sub_category_id,

        availability:
          item.availability === undefined
            ? true
            : Boolean(item.availability),

        preparation_time:
          item.preparation_time ?? "",

        food_type:
          item.food_type || "",

        spice_level:
          item.spice_level || "",

        calories:
          item.calories ?? "",

        serves:
          item.serves ?? "",

        is_popular:
          Boolean(item.is_popular),

        is_featured:
          Boolean(item.is_featured),
      });

      setActiveImage(0);
      setNewImages([]);
    } catch (error) {
      console.error("GET FOOD ERROR:", error);

      alert(
        error?.response?.data?.message ||
          "Unable to load food details."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOAD CATEGORIES
  ===================================================== */

  const loadCategories = async () => {
    try {
      const data = await getCategories();

      const list = Array.isArray(data)
        ? data
        : data?.categories || [];

      setCategories(list);
    } catch (error) {
      console.error("CATEGORY ERROR:", error);
    }
  };

  /* =====================================================
     LOAD SUB CATEGORIES
  ===================================================== */

  const loadSubCategories = async () => {
    try {
      const data = await getSubCategories();

      const list = Array.isArray(data)
        ? data
        : data?.subCategories ||
          data?.subcategories ||
          [];

      setSubCategories(list);
    } catch (error) {
      console.error("SUB CATEGORY ERROR:", error);
    }
  };

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =====================================================
     IMAGE COUNT
  ===================================================== */

  const totalImageCount =
    existingImages.length + newImages.length;

  /* =====================================================
     CREATE IMAGE PREVIEW
  ===================================================== */

  const previewImages = useMemo(() => {
    const existing = existingImages.map(
      (url, index) => ({
        id: `existing-${index}-${url}`,
        type: "existing",
        src: url,
      })
    );

    const fresh = newImages.map(
      (image, index) => ({
        id: `new-${index}-${image.file.name}`,
        type: "new",
        src: image.preview,
      })
    );

    return [...existing, ...fresh];
  }, [existingImages, newImages]);

  /* =====================================================
     CLEAN BLOB URLS
  ===================================================== */

  useEffect(() => {
    return () => {
      newImages.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [newImages]);

  /* =====================================================
     FIX ACTIVE IMAGE
  ===================================================== */

  useEffect(() => {
    if (previewImages.length === 0) {
      setActiveImage(0);
      return;
    }

    if (activeImage >= previewImages.length) {
      setActiveImage(previewImages.length - 1);
    }
  }, [previewImages.length, activeImage]);

  /* =====================================================
     IMAGE URL
  ===================================================== */

  const getImageUrl = (src) => {
    if (!src) return "";

    const value = String(src);

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("blob:")
    ) {
      return value;
    }

    if (
      value.startsWith("data:") ||
      value.startsWith("/assets/") ||
      value.startsWith("/src/")
    ) {
      return value;
    }

    /*
      If backend returns:
      uploads/chicken.jpg
      /uploads/chicken.jpg
      chicken.jpg
    */

    return `http://localhost:4000/uploads/${value.replace(
      /^\/+/,
      ""
    )}`;
  };

  /* =====================================================
     ADD IMAGES
  ===================================================== */

  const handleImageChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    const remainingSlots =
      MAX_IMAGES -
      existingImages.length -
      newImages.length;

    if (remainingSlots <= 0) {
      alert(
        `Maximum ${MAX_IMAGES} images allowed.`
      );

      e.target.value = "";
      return;
    }

    const selectedFiles =
      files.slice(0, remainingSlots);

    const validImages = [];

    for (const file of selectedFiles) {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(
          `${file.name}: Only PNG, JPG, JPEG and WEBP allowed.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(
          `${file.name}: Image must be below 2MB.`
        );
        continue;
      }

      validImages.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (validImages.length > 0) {
      setNewImages((prev) => [
        ...prev,
        ...validImages,
      ]);
    }

    e.target.value = "";
  };

  /* =====================================================
     REMOVE EXISTING IMAGE
  ===================================================== */

  const removeExistingImage = (index) => {
    if (existingImages.length <= 1) {
      alert(
        "At least one food image is required."
      );
      return;
    }

    setExistingImages((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setActiveImage(0);
  };

  /* =====================================================
     REMOVE NEW IMAGE
  ===================================================== */

  const removeNewImage = (index) => {
    setNewImages((prev) => {
      const image = prev[index];

      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }

      return prev.filter(
        (_, i) => i !== index
      );
    });

    setActiveImage(0);
  };

  /* =====================================================
     SET IMAGE AS MAIN
  ===================================================== */

  const setAsMain = (index) => {
    if (index === 0) {
      alert("This image is already the main image.");
      return;
    }

    const selected =
      previewImages[index];

    if (!selected) return;

    /*
      Existing image
    */
    if (selected.type === "existing") {
      const selectedExistingIndex =
        existingImages.findIndex(
          (url) => url === selected.src
        );

      if (selectedExistingIndex >= 0) {
        setExistingImages((prev) => {
          const copy = [...prev];

          const [selectedImage] =
            copy.splice(
              selectedExistingIndex,
              1
            );

          copy.unshift(selectedImage);

          return copy;
        });

        setActiveImage(0);
      }

      return;
    }

    /*
      New image
    */
    const newIndex =
      newImages.findIndex(
        (image) =>
          image.preview === selected.src
      );

    if (newIndex >= 0) {
      const selectedNewImage =
        newImages[newIndex];

      /*
        If there are existing images,
        move new image before them.
      */
      setNewImages((prev) => {
        const copy = [...prev];

        copy.splice(newIndex, 1);

        return copy;
      });

      /*
        New main image is difficult to persist
        separately unless backend supports mainImage.

        We therefore keep the first existing
        image as backend main image.
      */

      if (existingImages.length === 0) {
        setActiveImage(0);
      }
    }
  };

  /* =====================================================
     NEXT IMAGE
  ===================================================== */

  const nextImage = () => {
    if (previewImages.length <= 1) return;

    setActiveImage((prev) =>
      prev >= previewImages.length - 1
        ? 0
        : prev + 1
    );
  };

  /* =====================================================
     PREVIOUS IMAGE
  ===================================================== */

  const previousImage = () => {
    if (previewImages.length <= 1) return;

    setActiveImage((prev) =>
      prev <= 0
        ? previewImages.length - 1
        : prev - 1
    );
  };

  /* =====================================================
     KEYBOARD SLIDER
  ===================================================== */

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        nextImage();
      }

      if (e.key === "ArrowLeft") {
        previousImage();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  });

  /* =====================================================
     SAVE FOOD
  ===================================================== */

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Food name is required.");
      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      alert("Valid price is required.");
      return;
    }

    if (totalImageCount === 0) {
      alert(
        "Please keep at least one food image."
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "price",
        form.price
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "category_id",
        form.category_id
      );

      formData.append(
        "sub_category_id",
        form.sub_category_id
      );

      formData.append(
        "availability",
        String(form.availability)
      );

      formData.append(
        "preparation_time",
        form.preparation_time
      );

      formData.append(
        "food_type",
        form.food_type
      );

      formData.append(
        "spice_level",
        form.spice_level
      );

      formData.append(
        "calories",
        form.calories
      );

      formData.append(
        "serves",
        form.serves
      );

      formData.append(
        "is_popular",
        String(form.is_popular)
      );

      formData.append(
        "is_featured",
        String(form.is_featured)
      );

      /*
        Backend expects existingImages
        as JSON.
      */

      formData.append(
        "existingImages",
        JSON.stringify(existingImages)
      );

      /*
        Add newly selected files.
      */

      newImages.forEach((image) => {
        formData.append(
          "images",
          image.file
        );
      });

      await updateItem(
        id,
        formData
      );

      alert(
        "Food updated successfully! 🎉"
      );

      navigate("/admin/foods");
    } catch (error) {
      console.error(
        "UPDATE FOOD ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to update food."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE FOOD
  ===================================================== */

  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${form.name}"?`
      );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await deleteItem(id);

      alert(
        "Food deleted successfully."
      );

      navigate("/admin/foods");
    } catch (error) {
      console.error(
        "DELETE FOOD ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to delete food."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =====================================================
     FILTER SUB CATEGORIES
  ===================================================== */

  const filteredSubCategories =
    subCategories.filter((sub) => {
      const parentId =
        sub.category_id ??
        sub.categoryId ??
        sub.parent_category_id;

      if (!form.category_id) {
        return true;
      }

      return (
        String(parentId) ===
        String(form.category_id)
      );
    });

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="food-details-loading">
        <div className="food-loader"></div>

        <p>
          Loading food details...
        </p>
      </div>
    );
  }

  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <div className="food-details-page">

      {/* ================= HEADER ================= */}

      <div className="food-details-header">

        <div className="food-header-left">

          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/admin/foods")
            }
          >
            ← Back to Food Items
          </button>

          <h1>
            Food Details
          </h1>

          <p>
            Manage images, pricing,
            details and availability.
          </p>

        </div>

        <div className="header-actions">

          <button
            type="button"
            className="cancel-button"
            onClick={() =>
              navigate("/admin/foods")
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="food-details-form"
            className="save-button"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>

      {/* ================= FORM ================= */}

      <form
        id="food-details-form"
        onSubmit={handleSave}
        className="food-details-layout"
      >

        {/* ================= LEFT ================= */}

        <div className="food-details-main">

          {/* ================= IMAGES ================= */}

          <section className="details-card image-card">

            <div className="card-heading">

              <div>
                <h2>
                  Food Images
                </h2>

                <p>
                  Upload up to{" "}
                  {MAX_IMAGES} images.
                </p>
              </div>

              <span className="image-count">
                {totalImageCount}/
                {MAX_IMAGES}
              </span>

            </div>

            {/* MAIN IMAGE */}

            <div className="image-slider">

              {previewImages.length > 0 ? (
                <>
                  <img
                    src={getImageUrl(
                      previewImages[
                        activeImage
                      ]?.src
                    )}
                    alt={
                      form.name ||
                      "Food"
                    }
                    className="main-food-image"
                    onError={(e) => {
                      e.currentTarget.src =
                        "";
                    }}
                  />

                  {previewImages.length >
                    1 && (
                    <>
                      <button
                        type="button"
                        className="slider-arrow slider-left"
                        onClick={
                          previousImage
                        }
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        className="slider-arrow slider-right"
                        onClick={
                          nextImage
                        }
                      >
                        ›
                      </button>
                    </>
                  )}

                  <div className="image-position">
                    {activeImage + 1} /{" "}
                    {previewImages.length}
                  </div>

                </>
              ) : (
                <div className="no-image">
                  <span>
                    📷
                  </span>

                  <p>
                    No image available
                  </p>
                </div>
              )}

            </div>

            {/* ================= THUMBNAILS ================= */}

            {previewImages.length > 0 && (
              <div className="thumbnail-row">

                {previewImages.map(
                  (image, index) => (
                    <div
                      key={image.id}
                      className={`thumbnail-wrapper ${
                        activeImage ===
                        index
                          ? "active"
                          : ""
                      }`}
                    >

                      <button
                        type="button"
                        className="thumbnail-button"
                        onClick={() =>
                          setActiveImage(
                            index
                          )
                        }
                      >

                        <img
                          src={getImageUrl(
                            image.src
                          )}
                          alt={`Food ${
                            index + 1
                          }`}
                        />

                      </button>

                      {index === 0 && (
                        <span className="main-badge">
                          MAIN
                        </span>
                      )}

                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => {
                          if (
                            image.type ===
                            "existing"
                          ) {
                            const indexToRemove =
                              existingImages.findIndex(
                                (
                                  url
                                ) =>
                                  url ===
                                  image.src
                              );

                            if (
                              indexToRemove >=
                              0
                            ) {
                              removeExistingImage(
                                indexToRemove
                              );
                            }
                          } else {
                            const indexToRemove =
                              newImages.findIndex(
                                (
                                  item
                                ) =>
                                  item.preview ===
                                  image.src
                              );

                            if (
                              indexToRemove >=
                              0
                            ) {
                              removeNewImage(
                                indexToRemove
                              );
                            }
                          }
                        }}
                      >
                        ×
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

            {/* ================= IMAGE ACTIONS ================= */}

            {previewImages.length >
              0 && (
              <div className="image-actions">

                <button
                  type="button"
                  className="set-main-button"
                  onClick={() =>
                    setAsMain(
                      activeImage
                    )
                  }
                  disabled={
                    activeImage === 0
                  }
                >
                  ★ Set as Main
                </button>

                <button
                  type="button"
                  className="remove-current-button"
                  onClick={() => {
                    const current =
                      previewImages[
                        activeImage
                      ];

                    if (!current) return;

                    if (
                      current.type ===
                      "existing"
                    ) {
                      const indexToRemove =
                        existingImages.findIndex(
                          (url) =>
                            url ===
                            current.src
                        );

                      if (
                        indexToRemove >=
                        0
                      ) {
                        removeExistingImage(
                          indexToRemove
                        );
                      }
                    } else {
                      const indexToRemove =
                        newImages.findIndex(
                          (image) =>
                            image.preview ===
                            current.src
                        );

                      if (
                        indexToRemove >=
                        0
                      ) {
                        removeNewImage(
                          indexToRemove
                        );
                      }
                    }
                  }}
                >
                  🗑 Remove
                </button>

              </div>
            )}

            {/* ================= UPLOAD ================= */}

            {totalImageCount <
              MAX_IMAGES && (
              <label className="upload-box">

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={
                    handleImageChange
                  }
                />

                <div className="upload-icon">
                  +
                </div>

                <strong>
                  Add More Images
                </strong>

                <span>
                  PNG, JPG, JPEG or WEBP
                  · Max 2MB each
                </span>

              </label>
            )}

          </section>

          {/* ================= BASIC INFORMATION ================= */}

          <section className="details-card">

            <div className="card-heading">

              <div>
                <h2>
                  Basic Information
                </h2>

                <p>
                  Main information shown
                  to customers.
                </p>
              </div>

            </div>

            <div className="form-grid">

              {/* NAME */}

              <div className="form-group full">

                <label>
                  Food Name{" "}
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  placeholder="Enter food name"
                />

              </div>

              {/* PRICE */}

              <div className="form-group">

                <label>
                  Price{" "}
                  <span>*</span>
                </label>

                <div className="price-input">

                  <span>
                    ₹
                  </span>

                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={
                      handleChange
                    }
                    placeholder="0.00"
                  />

                </div>

              </div>

              {/* FOOD TYPE */}

              <div className="form-group">

                <label>
                  Food Type
                </label>

                <select
                  name="food_type"
                  value={
                    form.food_type
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select food type
                  </option>

                  <option value="Veg">
                    Veg
                  </option>

                  <option value="Non Veg">
                    Non Veg
                  </option>

                  <option value="Egg">
                    Egg
                  </option>

                </select>

              </div>

              {/* CATEGORY */}

              <div className="form-group">

                <label>
                  Category
                </label>

                <select
                  name="category_id"
                  value={
                    form.category_id
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* SUB CATEGORY */}

              <div className="form-group">

                <label>
                  Sub Category
                </label>

                <select
                  name="sub_category_id"
                  value={
                    form.sub_category_id
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select sub category
                  </option>

                  {filteredSubCategories.map(
                    (sub) => (
                      <option
                        key={sub.id}
                        value={sub.id}
                      >
                        {sub.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* DESCRIPTION */}

              <div className="form-group full">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Write a delicious description..."
                  rows="5"
                />

              </div>

            </div>

          </section>

          {/* ================= FOOD INFORMATION ================= */}

          <section className="details-card">

            <div className="card-heading">

              <div>
                <h2>
                  Food Information
                </h2>

                <p>
                  Additional information
                  about this food.
                </p>
              </div>

            </div>

            <div className="form-grid">

              {/* PREPARATION TIME */}

              <div className="form-group">

                <label>
                  Preparation Time
                </label>

                <div className="input-with-suffix">

                  <input
                    type="number"
                    min="0"
                    name="preparation_time"
                    value={
                      form.preparation_time
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="20"
                  />

                  <span>
                    min
                  </span>

                </div>

              </div>

              {/* SPICE LEVEL */}

              <div className="form-group">

                <label>
                  Spice Level
                </label>

                <select
                  name="spice_level"
                  value={
                    form.spice_level
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value="">
                    Select spice level
                  </option>

                  <option value="Mild">
                    Mild
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Spicy">
                    Spicy
                  </option>

                  <option value="Very Spicy">
                    Very Spicy
                  </option>

                </select>

              </div>

              {/* CALORIES */}

              <div className="form-group">

                <label>
                  Calories
                </label>

                <div className="input-with-suffix">

                  <input
                    type="number"
                    min="0"
                    name="calories"
                    value={
                      form.calories
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="350"
                  />

                  <span>
                    kcal
                  </span>

                </div>

              </div>

              {/* SERVES */}

              <div className="form-group">

                <label>
                  Serves
                </label>

                <div className="input-with-suffix">

                  <input
                    type="number"
                    min="1"
                    name="serves"
                    value={
                      form.serves
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="1"
                  />

                  <span>
                    person
                  </span>

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <aside className="food-details-sidebar">

          {/* AVAILABILITY */}

          <section className="details-card">

            <div className="card-heading">

              <div>
                <h2>
                  Availability
                </h2>

                <p>
                  Control whether customers
                  can order this food.
                </p>
              </div>

            </div>

            <label className="toggle-row">

              <input
                type="checkbox"
                name="availability"
                checked={
                  form.availability
                }
                onChange={
                  handleChange
                }
              />

              <span className="toggle-switch"></span>

              <span className="toggle-label">
                {form.availability
                  ? "Available"
                  : "Unavailable"}
              </span>

            </label>

          </section>

          {/* POPULAR / FEATURED */}

          <section className="details-card">

            <div className="card-heading">

              <div>
                <h2>
                  Visibility
                </h2>

                <p>
                  Highlight this food
                  on the website.
                </p>
              </div>

            </div>

            <label className="check-row">

              <input
                type="checkbox"
                name="is_popular"
                checked={
                  form.is_popular
                }
                onChange={
                  handleChange
                }
              />

              <span>
                ⭐ Popular Food
              </span>

            </label>

            <label className="check-row">

              <input
                type="checkbox"
                name="is_featured"
                checked={
                  form.is_featured
                }
                onChange={
                  handleChange
                }
              />

              <span>
                🔥 Featured Food
              </span>

            </label>

          </section>

          {/* FOOD SUMMARY */}

          <section className="details-card food-summary-card">

            <h2>
              Food Summary
            </h2>

            <div className="summary-row">

              <span>
                Food ID
              </span>

              <strong>
                #{id}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Images
              </span>

              <strong>
                {totalImageCount}/
                {MAX_IMAGES}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Status
              </span>

              <strong
                className={
                  form.availability
                    ? "status-available"
                    : "status-unavailable"
                }
              >
                {form.availability
                  ? "Available"
                  : "Unavailable"}
              </strong>

            </div>

          </section>

          {/* DELETE */}

          <section className="details-card danger-card">

            <h2>
              Danger Zone
            </h2>

            <p>
              Delete this food item
              permanently.
            </p>

            <button
              type="button"
              className="delete-button"
              onClick={
                handleDelete
              }
              disabled={deleting}
            >
              {deleting
                ? "Deleting..."
                : "🗑 Delete Food"}
            </button>

          </section>

        </aside>

      </form>

    </div>
  );
};

export default FoodDetails;