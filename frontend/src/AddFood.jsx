import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./AddFood.css";

const API_URL = "http://localhost:4000/api";

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

// =====================================================
// TOKEN
// =====================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("userToken") ||
    ""
  );
};

// =====================================================
// API JSON HELPER
// =====================================================

const apiRequest = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType =
    response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    data = {
      message: text,
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
};

// =====================================================
// NORMALIZE BOOLEAN
// =====================================================

const normalizeBoolean = (value) => {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "TRUE" ||
    value === "True" ||
    value === "yes" ||
    value === "YES" ||
    value === "Yes"
  );
};

// =====================================================
// IMAGE URL
// =====================================================

const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  const imageString = String(image).trim();

  if (!imageString) {
    return "";
  }

  if (
    imageString.startsWith("http://") ||
    imageString.startsWith("https://") ||
    imageString.startsWith("data:") ||
    imageString.startsWith("blob:")
  ) {
    return imageString;
  }

  return `http://localhost:4000/${imageString.replace(
    /^\/+/,
    ""
  )}`;
};

// =====================================================
// FOOD IMAGES
// =====================================================

const getFoodImages = (food) => {
  if (!food) {
    return [];
  }

  let images = [];

  if (Array.isArray(food.images)) {
    images = food.images;
  } else if (typeof food.images === "string") {
    try {
      const parsed = JSON.parse(food.images);

      if (Array.isArray(parsed)) {
        images = parsed;
      }
    } catch {
      images = [];
    }
  }

  if (images.length === 0 && food.image) {
    images = [food.image];
  }

  return images.filter(Boolean);
};

// =====================================================
// INITIAL FORM
// =====================================================

const INITIAL_FORM = {
  category_id: "",
  sub_category_id: "",

  restaurant_name: "Tomato Restaurant",

  name: "",
  price: "",
  description: "",

  stock_quantity: 0,

  availability: true,

  food_type: "VEG",

  preparation_time: 20,

  spice_level: "MEDIUM",

  calories: "",

  serves: 1,

  is_popular: false,

  is_featured: false,

  sort_order: 0,
};

// =====================================================
// COMPONENT
// =====================================================

const AddFood = () => {
  // ===================================================
  // FORM
  // ===================================================

  const [form, setForm] = useState(INITIAL_FORM);

  // ===================================================
  // DATA
  // ===================================================

  const [foods, setFoods] = useState([]);

  const [categories, setCategories] = useState([]);

  const [subCategories, setSubCategories] = useState([]);

  // ===================================================
  // IMAGES
  // ===================================================

  const [selectedImages, setSelectedImages] = useState([]);

  const [imagePreviews, setImagePreviews] = useState([]);

  const [existingImages, setExistingImages] = useState([]);

  // ===================================================
  // EDIT
  // ===================================================

  const [editingFood, setEditingFood] = useState(null);

  // ===================================================
  // LOADING
  // ===================================================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [searching, setSearching] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // ===================================================
  // FREE ONLINE RESTAURANT SEARCH
  // ===================================================

  const [onlineSearch, setOnlineSearch] = useState("");

  const [onlineResults, setOnlineResults] = useState([]);

  const [showOnlineResults, setShowOnlineResults] =
    useState(false);

  // ===================================================
  // UI
  // ===================================================

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(true);

  const [showEditModal, setShowEditModal] =
    useState(false);

  // ===================================================
  // REFS
  // ===================================================

  const addImageInputRef = useRef(null);

  const editImageInputRef = useRef(null);

  // ===================================================
  // LOAD DATA
  // ===================================================

  useEffect(() => {
    loadData();
  }, []);

  // ===================================================
  // LOAD DATA
  // ===================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        foodsResponse,
        categoriesResponse,
      ] = await Promise.all([
        apiRequest(`${API_URL}/items`),
        apiRequest(`${API_URL}/categories`),
      ]);

      const foodData = Array.isArray(foodsResponse)
        ? foodsResponse
        : foodsResponse?.items || [];

      const categoryData = Array.isArray(
        categoriesResponse
      )
        ? categoriesResponse
        : categoriesResponse?.categories || [];

      setFoods(foodData);
      setCategories(categoryData);
    } catch (err) {
      console.error(
        "LOAD ADD FOOD DATA ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to load food data"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD SUB CATEGORIES
  // ===================================================

  const loadSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }

    try {
      const data = await apiRequest(
        `${API_URL}/subcategories?category_id=${categoryId}`
      );

      const list = Array.isArray(data)
        ? data
        : data?.subcategories ||
          data?.items ||
          [];

      setSubCategories(list);
    } catch (err) {
      console.error(
        "SUB CATEGORY ERROR:",
        err
      );

      setSubCategories([]);

      setError(
        err.message ||
          "Failed to load sub categories"
      );
    }
  };

  // ===================================================
  // FORM CHANGE
  // ===================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (name === "category_id") {
      setForm((prev) => ({
        ...prev,
        category_id: value,
        sub_category_id: "",
      }));

      loadSubCategories(value);
    }

    if (name === "stock_quantity") {
      const stock = Number(value);

      if (
        Number.isFinite(stock) &&
        stock <= 0
      ) {
        setForm((prev) => ({
          ...prev,
          stock_quantity: value,
          availability: false,
        }));
      }
    }
  };

  // ===================================================
  // AVAILABILITY
  // ===================================================

  const effectiveAvailability =
    Number(form.stock_quantity) > 0 &&
    normalizeBoolean(form.availability);

  // ===================================================
  // IMAGE VALIDATION
  // ===================================================

  const validateImage = (file) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      return "Only PNG, JPG, JPEG and WEBP images are allowed";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Each image must be maximum 2MB";
    }

    return null;
  };

  // ===================================================
  // ADD IMAGE FILES
  // ===================================================

  const handleImageSelection = (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    setError("");

    const errors = [];

    const validFiles = [];

    files.forEach((file) => {
      const validation =
        validateImage(file);

      if (validation) {
        errors.push(
          `${file.name}: ${validation}`
        );
      } else {
        validFiles.push(file);
      }
    });

    const totalImages =
      selectedImages.length +
      validFiles.length +
      existingImages.length;

    if (totalImages > MAX_IMAGES) {
      setError(
        `Maximum ${MAX_IMAGES} images are allowed`
      );

      return;
    }

    if (errors.length > 0) {
      setError(errors.join("\n"));
    }

    if (validFiles.length === 0) {
      return;
    }

    const newPreviews =
      validFiles.map((file) =>
        URL.createObjectURL(file)
      );

    setSelectedImages((prev) => [
      ...prev,
      ...validFiles,
    ]);

    setImagePreviews((prev) => [
      ...prev,
      ...newPreviews,
    ]);

    event.target.value = "";
  };

  // ===================================================
  // REMOVE NEW IMAGE
  // ===================================================

  const removeSelectedImage = (index) => {
    setImagePreviews((prev) => {
      const preview = prev[index];

      if (
        preview &&
        preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(preview);
      }

      return prev.filter(
        (_, i) => i !== index
      );
    });

    setSelectedImages((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  // ===================================================
  // REMOVE EXISTING IMAGE
  // ===================================================

  const removeExistingImage = (index) => {
    setExistingImages((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  // ===================================================
  // RESET FORM
  // ===================================================

  const resetForm = () => {
    imagePreviews.forEach((preview) => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });

    setForm(INITIAL_FORM);

    setSubCategories([]);

    setSelectedImages([]);

    setImagePreviews([]);

    setExistingImages([]);

    setEditingFood(null);

    setError("");

    setMessage("");

    setOnlineSearch("");

    setOnlineResults([]);

    setShowOnlineResults(false);
  };

  // ===================================================
  // FREE ONLINE RESTAURANT SEARCH
  //
  // Backend:
  // /api/items/search-food
  //
  // Uses OpenStreetMap/Nominatim.
  // No Google API.
  // No payment.
  // ===================================================

  const searchFoodOnline = async () => {
    const query = onlineSearch.trim();

    if (!query) {
      setError(
        "Enter a food or restaurant name to search"
      );

      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Admin login token not found. Please login again."
      );

      return;
    }

    try {
      setSearching(true);

      setError("");

      setMessage("");

      setOnlineResults([]);

      setShowOnlineResults(true);

      const data = await apiRequest(
        `${API_URL}/items/search-food?q=${encodeURIComponent(
          query
        )}`
      );

      /*
       * Support both:
       *
       * {
       *   restaurants: []
       * }
       *
       * and older:
       *
       * {
       *   results: []
       * }
       */

      const rawResults =
        Array.isArray(data?.restaurants)
          ? data.restaurants
          : Array.isArray(data?.results)
          ? data.results
          : [];

      const results = rawResults.map(
        (result, index) => ({
          id:
            result.id ||
            result.place_id ||
            `restaurant-${index}`,

          place_id:
            result.place_id ||
            result.id ||
            `restaurant-${index}`,

          restaurant_name:
            result.restaurant_name ||
            result.name ||
            "Restaurant",

          name:
            result.name ||
            result.restaurant_name ||
            "Restaurant",

          address:
            result.address ||
            result.display_name ||
            "Address unavailable",

          rating:
            result.rating ?? null,

          rating_count:
            result.rating_count ||
            result.user_ratings_total ||
            0,

          price_level:
            result.price_level ||
            result.priceLevel ||
            null,

          image:
            result.image ||
            null,

          latitude:
            result.latitude ||
            result.lat ||
            null,

          longitude:
            result.longitude ||
            result.lon ||
            null,

          city:
            result.city || "",

          state:
            result.state || "",

          country:
            result.country || "",
        })
      );

      setOnlineResults(results);

      if (results.length === 0) {
        setMessage(
          `No restaurants found for "${query}". Try a restaurant name or location.`
        );
      }
    } catch (err) {
      console.error(
        "ONLINE FOOD SEARCH ERROR:",
        err
      );

      setOnlineResults([]);

      setError(
        err.message ||
          "Online restaurant search failed"
      );
    } finally {
      setSearching(false);
    }
  };

  // ===================================================
  // ENTER SEARCH
  // ===================================================

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      searchFoodOnline();
    }
  };

  // ===================================================
  // USE ONLINE RESTAURANT
  // ===================================================

  const useOnlineRestaurant = (result) => {
    const restaurantName =
      result?.restaurant_name ||
      result?.name ||
      "Tomato Restaurant";

    setForm((prev) => ({
      ...prev,

      restaurant_name:
        restaurantName,

      name:
        prev.name ||
        onlineSearch.trim(),
    }));

    setOnlineSearch("");

    setOnlineResults([]);

    setShowOnlineResults(false);

    setMessage(
      `Restaurant "${restaurantName}" added to the food form.`
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===================================================
  // CREATE ITEM
  // ===================================================

  const handleAddFood = async (event) => {
    event.preventDefault();

    setError("");

    setMessage("");

    if (!form.category_id) {
      setError(
        "Please select a category"
      );

      return;
    }

    if (!form.sub_category_id) {
      setError(
        "Please select a sub category"
      );

      return;
    }

    if (!form.name.trim()) {
      setError(
        "Food name is required"
      );

      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      setError(
        "Please enter a valid price"
      );

      return;
    }

    const stock =
      Number(form.stock_quantity);

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        "Stock quantity must be a whole number greater than or equal to 0"
      );

      return;
    }

    if (selectedImages.length === 0) {
      setError(
        "Please upload at least one food image"
      );

      return;
    }

    if (
      selectedImages.length >
      MAX_IMAGES
    ) {
      setError(
        "Maximum 4 images are allowed"
      );

      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin login token not found. Please login again."
        );
      }

      const formData = new FormData();

      formData.append(
        "category_id",
        form.category_id
      );

      formData.append(
        "sub_category_id",
        form.sub_category_id
      );

      formData.append(
        "restaurant_name",
        form.restaurant_name ||
          "Tomato Restaurant"
      );

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "price",
        Number(form.price)
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "stock_quantity",
        stock
      );

      formData.append(
        "availability",
        effectiveAvailability
          ? "true"
          : "false"
      );

      formData.append(
        "food_type",
        form.food_type
      );

      formData.append(
        "preparation_time",
        Number(
          form.preparation_time || 20
        )
      );

      formData.append(
        "spice_level",
        form.spice_level
      );

      formData.append(
        "calories",
        form.calories === ""
          ? ""
          : Number(form.calories)
      );

      formData.append(
        "serves",
        Number(form.serves || 1)
      );

      formData.append(
        "is_popular",
        form.is_popular
          ? "true"
          : "false"
      );

      formData.append(
        "is_featured",
        form.is_featured
          ? "true"
          : "false"
      );

      formData.append(
        "sort_order",
        Number(form.sort_order || 0)
      );

      selectedImages.forEach((file) => {
        formData.append(
          "images",
          file
        );
      });

      const response = await fetch(
        `${API_URL}/items`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to create food"
        );
      }

      setMessage(
        "Food item added successfully."
      );

      resetForm();

      await loadData();
    } catch (err) {
      console.error(
        "ADD FOOD ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to add food"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // OPEN EDIT
  // ===================================================

  const openEditModal = async (food) => {
    setError("");

    setMessage("");

    setEditingFood(food);

    const stock = Number(
      food.stock_quantity ?? 0
    );

    const availability =
      normalizeBoolean(
        food.availability
      );

    const foodType =
      food.food_type ||
      food.foodType ||
      "VEG";

    const preparationTime =
      food.preparation_time ??
      food.preparationTime ??
      20;

    const spiceLevel =
      food.spice_level ||
      "MEDIUM";

    const calories =
      food.calories ?? "";

    const serves =
      food.serves ?? 1;

    const isPopular =
      normalizeBoolean(
        food.is_popular ??
          food.isPopular
      );

    const isFeatured =
      normalizeBoolean(
        food.is_featured ??
          food.isFeatured
      );

    const sortOrder =
      food.sort_order ?? 0;

    const categoryId =
      food.category_id ??
      food.Category?.id ??
      "";

    const subCategoryId =
      food.sub_category_id ??
      food.SubCategory?.id ??
      "";

    setForm({
      category_id:
        String(categoryId),

      sub_category_id:
        String(subCategoryId),

      restaurant_name:
        food.restaurant_name ||
        "Tomato Restaurant",

      name:
        food.name || "",

      price:
        food.price ?? "",

      description:
        food.description || "",

      stock_quantity:
        stock,

      availability:
        stock > 0 &&
        availability,

      food_type:
        foodType,

      preparation_time:
        preparationTime,

      spice_level:
        spiceLevel,

      calories:
        calories,

      serves:
        serves,

      is_popular:
        isPopular,

      is_featured:
        isFeatured,

      sort_order:
        sortOrder,
    });

    const oldImages =
      getFoodImages(food);

    setExistingImages(
      oldImages
    );

    setSelectedImages([]);

    setImagePreviews([]);

    setShowEditModal(true);

    await loadSubCategories(
      categoryId
    );
  };

  // ===================================================
  // UPDATE ITEM
  // ===================================================

  const handleUpdateFood = async (
    event
  ) => {
    event.preventDefault();

    if (!editingFood) {
      return;
    }

    setError("");

    setMessage("");

    if (!form.category_id) {
      setError(
        "Please select a category"
      );

      return;
    }

    if (!form.sub_category_id) {
      setError(
        "Please select a sub category"
      );

      return;
    }

    if (!form.name.trim()) {
      setError(
        "Food name is required"
      );

      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      setError(
        "Please enter a valid price"
      );

      return;
    }

    const stock =
      Number(form.stock_quantity);

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        "Stock quantity must be a whole number greater than or equal to 0"
      );

      return;
    }

    const totalImages =
      existingImages.length +
      selectedImages.length;

    if (totalImages === 0) {
      setError(
        "Food must have at least one image"
      );

      return;
    }

    if (
      totalImages > MAX_IMAGES
    ) {
      setError(
        "Maximum 4 images are allowed"
      );

      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin login token not found. Please login again."
        );
      }

      const formData =
        new FormData();

      formData.append(
        "category_id",
        form.category_id
      );

      formData.append(
        "sub_category_id",
        form.sub_category_id
      );

      formData.append(
        "restaurant_name",
        form.restaurant_name ||
          "Tomato Restaurant"
      );

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "price",
        Number(form.price)
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "stock_quantity",
        stock
      );

      formData.append(
        "availability",
        effectiveAvailability
          ? "true"
          : "false"
      );

      formData.append(
        "food_type",
        form.food_type
      );

      formData.append(
        "preparation_time",
        Number(
          form.preparation_time || 20
        )
      );

      formData.append(
        "spice_level",
        form.spice_level
      );

      formData.append(
        "calories",
        form.calories === ""
          ? ""
          : Number(form.calories)
      );

      formData.append(
        "serves",
        Number(form.serves || 1)
      );

      formData.append(
        "is_popular",
        form.is_popular
          ? "true"
          : "false"
      );

      formData.append(
        "is_featured",
        form.is_featured
          ? "true"
          : "false"
      );

      formData.append(
        "sort_order",
        Number(form.sort_order || 0)
      );

      formData.append(
        "existingImages",
        JSON.stringify(
          existingImages
        )
      );

      selectedImages.forEach(
        (file) => {
          formData.append(
            "images",
            file
          );
        }
      );

      const response =
        await fetch(
          `${API_URL}/items/${editingFood.id}`,
          {
            method: "PUT",

            headers: {
              Authorization: `Bearer ${token}`,
            },

            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to update food"
        );
      }

      setMessage(
        "Food item updated successfully."
      );

      closeEditModal();

      await loadData();
    } catch (err) {
      console.error(
        "UPDATE FOOD ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to update food"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // DELETE FOOD
  // ===================================================

  const handleDeleteFood = async (
    food
  ) => {
    if (!food?.id) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${food.name}" permanently?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      setError("");

      setMessage("");

      await apiRequest(
        `${API_URL}/items/${food.id}`,
        {
          method: "DELETE",
        }
      );

      setMessage(
        "Food item deleted successfully."
      );

      if (
        editingFood?.id === food.id
      ) {
        closeEditModal();
      }

      await loadData();
    } catch (err) {
      console.error(
        "DELETE FOOD ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to delete food"
      );
    } finally {
      setDeleting(false);
    }
  };

  // ===================================================
  // CLOSE EDIT
  // ===================================================

  const closeEditModal = () => {
    imagePreviews.forEach(
      (preview) => {
        if (
          preview.startsWith("blob:")
        ) {
          URL.revokeObjectURL(
            preview
          );
        }
      }
    );

    setShowEditModal(false);

    setEditingFood(null);

    setExistingImages([]);

    setSelectedImages([]);

    setImagePreviews([]);

    setForm(INITIAL_FORM);

    setSubCategories([]);
  };

  // ===================================================
  // CATEGORY NAME
  // ===================================================

  const getCategoryName = (food) => {
    return (
      food?.Category?.name ||
      food?.category?.name ||
      categories.find(
        (category) =>
          String(category.id) ===
          String(food?.category_id)
      )?.name ||
      "—"
    );
  };

  // ===================================================
  // SUB CATEGORY NAME
  // ===================================================

  const getSubCategoryName = (food) => {
    return (
      food?.SubCategory?.name ||
      food?.subCategory?.name ||
      "—"
    );
  };

  // ===================================================
  // AVAILABILITY
  // ===================================================

  const getFoodAvailability = (food) => {
    const stock = Number(
      food?.stock_quantity ?? 0
    );

    const available =
      normalizeBoolean(
        food?.availability
      );

    return (
      stock > 0 &&
      available
    );
  };

  // ===================================================
  // IMAGE COUNT
  // ===================================================

  const getImageCount = (food) => {
    return getFoodImages(food).length;
  };

  // ===================================================
  // PRICE LABEL
  // ===================================================

  const getPriceLevel = (level) => {
    if (!level) {
      return "Price unavailable";
    }

    const map = {
      PRICE_LEVEL_FREE: "Free",

      PRICE_LEVEL_INEXPENSIVE:
        "Inexpensive",

      PRICE_LEVEL_MODERATE:
        "Moderate",

      PRICE_LEVEL_EXPENSIVE:
        "Expensive",

      PRICE_LEVEL_VERY_EXPENSIVE:
        "Very Expensive",
    };

    return (
      map[level] ||
      String(level)
        .replace(
          "PRICE_LEVEL_",
          ""
        )
        .replaceAll("_", " ")
    );
  };

  // ===================================================
  // FILTERED FOOD COUNT
  // ===================================================

  const availableCount =
    useMemo(() => {
      return foods.filter(
        (food) =>
          getFoodAvailability(food)
      ).length;
    }, [foods]);

  // ===================================================
  // CLEANUP
  // ===================================================

  useEffect(() => {
    return () => {
      imagePreviews.forEach(
        (preview) => {
          if (
            preview.startsWith("blob:")
          ) {
            URL.revokeObjectURL(
              preview
            );
          }
        }
      );
    };
  }, [imagePreviews]);

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="add-food-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="add-food-header">

        <div>
          <span className="add-food-eyebrow">
            ADMIN PANEL
          </span>

          <h1>
            Food Management
          </h1>

          <p>
            Add, manage and update your
            restaurant food items.
          </p>
        </div>

        <div className="add-food-header-stats">

          <div className="food-header-stat">
            <strong>
              {foods.length}
            </strong>

            <span>
              Total Foods
            </span>
          </div>

          <div className="food-header-stat">
            <strong>
              {availableCount}
            </strong>

            <span>
              Available
            </span>
          </div>

        </div>

      </div>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <div className="add-food-alert success">
          <span>✓</span>
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="add-food-alert error">
          <span>!</span>
          <p>{error}</p>
        </div>
      )}

      {/* =================================================
          FREE ONLINE SEARCH
      ================================================= */}

      <section className="online-search-card">

        <div className="online-search-heading">

          <div className="online-search-icon">
            🔎
          </div>

          <div>
            <span>
              FREE RESTAURANT SEARCH
            </span>

            <h2>
              Find food & restaurants
            </h2>

            <p>
              Search restaurants using
              OpenStreetMap. No Google
              payment or API key required.
            </p>
          </div>

        </div>

        <div className="online-search-bar">

          <div className="online-search-input-wrap">

            <span>🍛</span>

            <input
              type="text"
              value={onlineSearch}
              onChange={(event) =>
                setOnlineSearch(
                  event.target.value
                )
              }
              onKeyDown={
                handleSearchKeyDown
              }
              placeholder="Search restaurant, food or location..."
            />

            {onlineSearch && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setOnlineSearch("");
                  setOnlineResults([]);
                  setShowOnlineResults(
                    false
                  );
                }}
              >
                ×
              </button>
            )}

          </div>

          <button
            type="button"
            className="online-search-btn"
            onClick={
              searchFoodOnline
            }
            disabled={searching}
          >
            {searching ? (
              <>
                <span className="button-spinner" />
                Searching...
              </>
            ) : (
              <>
                🔍 Search
              </>
            )}
          </button>

        </div>

        {showOnlineResults && (
          <div className="online-results">

            <div className="online-results-header">

              <div>
                <strong>
                  Restaurant Results
                </strong>

                <span>
                  {onlineResults.length} found
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowOnlineResults(
                    false
                  )
                }
              >
                Close
              </button>

            </div>

            {onlineResults.length ===
            0 ? (
              <div className="online-empty">

                <div>
                  🔍
                </div>

                <h3>
                  No restaurants found
                </h3>

                <p>
                  Try a restaurant name,
                  food name or location.
                </p>

              </div>
            ) : (
              <div className="online-result-grid">

                {onlineResults.map(
                  (
                    result,
                    index
                  ) => (
                    <div
                      className="online-result-card"
                      key={
                        result.place_id ||
                        result.id ||
                        index
                      }
                    >

                      <div className="online-result-image">

                        {result.image ? (
                          <img
                            src={
                              result.image
                            }
                            alt={
                              result.restaurant_name
                            }
                            onError={(
                              event
                            ) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="online-result-image-placeholder">
                            🍽️
                          </div>
                        )}

                        <span className="online-result-number">
                          #{index + 1}
                        </span>

                      </div>

                      <div className="online-result-content">

                        <h3>
                          {
                            result.restaurant_name
                          }
                        </h3>

                        {result.rating !==
                          null && (
                          <div className="online-rating">

                            <span>
                              ⭐
                            </span>

                            <strong>
                              {
                                result.rating
                              }
                            </strong>

                            {result.rating_count >
                              0 && (
                              <small>
                                (
                                {
                                  result.rating_count
                                }
                                )
                              </small>
                            )}

                          </div>
                        )}

                        <p className="online-address">
                          📍{" "}
                          {result.address ||
                            "Address unavailable"}
                        </p>

                        {result.city && (
                          <div className="online-meta">

                            <span>
                              🏙️{" "}
                              {
                                result.city
                              }
                            </span>

                          </div>
                        )}

                        <button
                          type="button"
                          className="use-restaurant-btn"
                          onClick={() =>
                            useOnlineRestaurant(
                              result
                            )
                          }
                        >
                          <span>
                            +
                          </span>

                          Use This Restaurant
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        )}

      </section>

      {/* =================================================
          ADD FOOD FORM
      ================================================= */}

      <section className="food-form-card">

        <div className="section-title-row">

          <div>
            <span>
              FOOD DETAILS
            </span>

            <h2>
              Add New Food
            </h2>

            <p>
              Create a complete food item
              with stock and availability.
            </p>
          </div>

          <button
            type="button"
            className="collapse-form-btn"
            onClick={() =>
              setShowForm(
                (prev) => !prev
              )
            }
          >
            {showForm
              ? "Hide Form"
              : "Show Form"}
          </button>

        </div>

        {showForm && (
          <form
            onSubmit={
              handleAddFood
            }
            className="food-form"
          >

            {/* BASIC DETAILS */}

            <div className="form-section">

              <div className="form-section-title">

                <span>01</span>

                <div>
                  <h3>
                    Basic Information
                  </h3>

                  <p>
                    Enter the main food
                    details.
                  </p>
                </div>

              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Restaurant Name
                  </label>

                  <input
                    type="text"
                    name="restaurant_name"
                    value={
                      form.restaurant_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Restaurant name"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Food Name
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Eg: Chicken Biryani"
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Category
                    <span>*</span>
                  </label>

                  <select
                    name="category_id"
                    value={
                      form.category_id
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Category
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

                <div className="form-group">

                  <label>
                    Sub Category
                    <span>*</span>
                  </label>

                  <select
                    name="sub_category_id"
                    value={
                      form.sub_category_id
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !form.category_id
                    }
                    required
                  >

                    <option value="">
                      {form.category_id
                        ? "Select Sub Category"
                        : "Select Category First"}
                    </option>

                    {subCategories.map(
                      (subCategory) => (
                        <option
                          key={
                            subCategory.id
                          }
                          value={
                            subCategory.id
                          }
                        >
                          {
                            subCategory.name
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Price
                    <span>*</span>
                  </label>

                  <div className="input-prefix">

                    <span>₹</span>

                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      value={
                        form.price
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="0.00"
                      required
                    />

                  </div>

                </div>

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

                    <option value="VEG">
                      🟢 Veg
                    </option>

                    <option value="NON-VEG">
                      🔴 Non-Veg
                    </option>

                  </select>

                </div>

              </div>

            </div>

            {/* STOCK */}

            <div className="form-section">

              <div className="form-section-title">

                <span>02</span>

                <div>
                  <h3>
                    Stock & Availability
                  </h3>

                  <p>
                    Control whether
                    customers can order
                    this food.
                  </p>
                </div>

              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Stock Quantity
                    <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="stock_quantity"
                    min="0"
                    step="1"
                    value={
                      form.stock_quantity
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                  <small className="field-help">
                    Stock 0 automatically
                    becomes Not Available.
                  </small>

                </div>

                <div className="form-group">

                  <label>
                    Availability
                  </label>

                  <div
                    className={`availability-switch ${
                      effectiveAvailability
                        ? "available"
                        : "unavailable"
                    }`}
                  >

                    <button
                      type="button"
                      className="availability-toggle"
                      onClick={() => {

                        if (
                          Number(
                            form.stock_quantity
                          ) <= 0
                        ) {

                          setError(
                            "Add stock quantity before marking this food Available."
                          );

                          return;
                        }

                        setForm(
                          (prev) => ({
                            ...prev,
                            availability:
                              !normalizeBoolean(
                                prev.availability
                              ),
                          })
                        );

                      }}
                    >

                      <span />

                    </button>

                    <div>

                      <strong>
                        {effectiveAvailability
                          ? "Available"
                          : "Not Available"}
                      </strong>

                      <small>

                        {Number(
                          form.stock_quantity
                        ) <= 0
                          ? "Out of stock"
                          : effectiveAvailability
                          ? "Customers can order"
                          : "Hidden from ordering"}

                      </small>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* EXTRA DETAILS */}

            <div className="form-section">

              <div className="form-section-title">

                <span>03</span>

                <div>
                  <h3>
                    Food Information
                  </h3>

                  <p>
                    Add preparation and
                    nutrition details.
                  </p>
                </div>

              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Preparation Time
                  </label>

                  <div className="input-suffix">

                    <input
                      type="number"
                      name="preparation_time"
                      min="1"
                      value={
                        form.preparation_time
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      min
                    </span>

                  </div>

                </div>

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

                    <option value="MILD">
                      🌶️ Mild
                    </option>

                    <option value="MEDIUM">
                      🌶️ Medium
                    </option>

                    <option value="HOT">
                      🌶️ Hot
                    </option>

                    <option value="EXTRA HOT">
                      🌶️ Extra Hot
                    </option>

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Calories
                  </label>

                  <div className="input-suffix">

                    <input
                      type="number"
                      name="calories"
                      min="0"
                      value={
                        form.calories
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Eg: 450"
                    />

                    <span>
                      kcal
                    </span>

                  </div>

                </div>

                <div className="form-group">

                  <label>
                    Serves
                  </label>

                  <div className="input-suffix">

                    <input
                      type="number"
                      name="serves"
                      min="1"
                      value={
                        form.serves
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <span>
                      person
                    </span>

                  </div>

                </div>

                <div className="form-group form-group-full">

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
                    placeholder="Describe the food, ingredients, taste..."
                    rows="4"
                  />

                </div>

              </div>

            </div>

            {/* FEATURES */}

            <div className="form-section">

              <div className="form-section-title">

                <span>04</span>

                <div>
                  <h3>
                    Food Features
                  </h3>

                  <p>
                    Highlight food items
                    across your application.
                  </p>
                </div>

              </div>

              <div className="feature-options">

                <label
                  className={`feature-option ${
                    form.is_popular
                      ? "active"
                      : ""
                  }`}
                >

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

                  <div className="feature-check">
                    ✓
                  </div>

                  <div>

                    <strong>
                      ⭐ Popular Food
                    </strong>

                    <small>
                      Show this food in
                      popular items.
                    </small>

                  </div>

                </label>

                <label
                  className={`feature-option ${
                    form.is_featured
                      ? "active"
                      : ""
                  }`}
                >

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

                  <div className="feature-check">
                    ✓
                  </div>

                  <div>

                    <strong>
                      ✨ Featured Food
                    </strong>

                    <small>
                      Highlight this food
                      as featured.
                    </small>

                  </div>

                </label>

              </div>

              <div className="form-group sort-order-field">

                <label>
                  Sort Order
                </label>

                <input
                  type="number"
                  name="sort_order"
                  min="0"
                  value={
                    form.sort_order
                  }
                  onChange={
                    handleChange
                  }
                />

                <small className="field-help">
                  Lower numbers appear
                  first.
                </small>

              </div>

            </div>

            {/* IMAGES */}

            <div className="form-section">

              <div className="form-section-title">

                <span>05</span>

                <div>
                  <h3>
                    Food Images
                  </h3>

                  <p>
                    Upload up to 4 images.
                    Maximum 2MB each.
                  </p>
                </div>

              </div>

              <div className="image-upload-area">

                <input
                  ref={
                    addImageInputRef
                  }
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  hidden
                  onChange={
                    handleImageSelection
                  }
                />

                <button
                  type="button"
                  className="image-upload-box"
                  onClick={() =>
                    addImageInputRef.current?.click()
                  }
                  disabled={
                    selectedImages.length >=
                    MAX_IMAGES
                  }
                >

                  <span>
                    📸
                  </span>

                  <strong>
                    Upload Food Images
                  </strong>

                  <small>
                    PNG, JPG, JPEG, WEBP
                  </small>

                  <small>
                    {selectedImages.length}/
                    {MAX_IMAGES} selected
                  </small>

                </button>

                {imagePreviews.length >
                  0 && (
                  <div className="image-preview-grid">

                    {imagePreviews.map(
                      (
                        preview,
                        index
                      ) => (
                        <div
                          className="image-preview-card"
                          key={
                            preview
                          }
                        >

                          <img
                            src={
                              preview
                            }
                            alt={`Food preview ${
                              index + 1
                            }`}
                          />

                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() =>
                              removeSelectedImage(
                                index
                              )
                            }
                          >
                            ×
                          </button>

                          {index ===
                            0 && (
                            <span className="main-image-badge">
                              Main
                            </span>
                          )}

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

            </div>

            {/* SUBMIT */}

            <div className="form-submit-area">

              <button
                type="button"
                className="secondary-btn"
                onClick={
                  resetForm
                }
              >
                Reset
              </button>

              <button
                type="submit"
                className="primary-submit-btn"
                disabled={
                  saving
                }
              >

                {saving ? (
                  <>
                    <span className="button-spinner" />
                    Adding Food...
                  </>
                ) : (
                  <>
                    + Add Food
                  </>
                )}

              </button>

            </div>

          </form>
        )}

      </section>

      {/* =================================================
          FOOD LIST
      ================================================= */}

      <section className="food-list-card">

        <div className="section-title-row">

          <div>

            <span>
              MENU INVENTORY
            </span>

            <h2>
              Food Items
            </h2>

            <p>
              Manage all food items,
              stock and availability.
            </p>

          </div>

          <div className="food-list-count">
            {foods.length} Items
          </div>

        </div>

        {loading ? (
          <div className="food-table-loading">

            <div className="large-spinner" />

            <p>
              Loading food items...
            </p>

          </div>
        ) : foods.length === 0 ? (
          <div className="food-table-empty">

            <div>
              🍽️
            </div>

            <h3>
              No food items found
            </h3>

            <p>
              Add your first food item
              using the form above.
            </p>

          </div>
        ) : (
          <div className="food-table-wrapper">

            <table className="food-table">

              <thead>

                <tr>

                  <th>
                    Food
                  </th>

                  <th>
                    Restaurant
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Features
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {foods.map(
                  (food) => {

                    const images =
                      getFoodImages(
                        food
                      );

                    const firstImage =
                      images[0];

                    const available =
                      getFoodAvailability(
                        food
                      );

                    const stock =
                      Number(
                        food.stock_quantity ??
                          0
                      );

                    return (
                      <tr
                        key={
                          food.id
                        }
                      >

                        <td>

                          <div className="table-food-cell">

                            <div className="table-food-image">

                              {firstImage ? (
                                <img
                                  src={getImageUrl(
                                    firstImage
                                  )}
                                  alt={
                                    food.name
                                  }
                                  onError={(
                                    event
                                  ) => {
                                    event.currentTarget.style.display =
                                      "none";
                                  }}
                                />
                              ) : (
                                <span>
                                  🍽️
                                </span>
                              )}

                            </div>

                            <div className="table-food-info">

                              <strong>
                                {
                                  food.name
                                }
                              </strong>

                              <small>
                                ID: #
                                {
                                  food.id
                                }
                              </small>

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="restaurant-cell">
                            🏪{" "}
                            {food.restaurant_name ||
                              "Tomato Restaurant"}
                          </span>

                        </td>

                        <td>

                          <div className="category-cell">

                            <strong>
                              {getCategoryName(
                                food
                              )}
                            </strong>

                            <small>
                              {getSubCategoryName(
                                food
                              )}
                            </small>

                          </div>

                        </td>

                        <td>

                          <strong className="price-cell">
                            ₹
                            {Number(
                              food.price ||
                                0
                            ).toFixed(
                              2
                            )}
                          </strong>

                        </td>

                        <td>

                          <span
                            className={`stock-badge ${
                              stock <=
                              0
                                ? "stock-zero"
                                : stock <=
                                  5
                                ? "stock-low"
                                : "stock-good"
                            }`}
                          >
                            {stock}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`status-badge ${
                              available
                                ? "status-available"
                                : "status-unavailable"
                            }`}
                          >

                            <span />

                            {available
                              ? "Available"
                              : stock <=
                                0
                              ? "Out of Stock"
                              : "Not Available"}

                          </span>

                        </td>

                        <td>

                          <div className="feature-badges">

                            {normalizeBoolean(
                              food.is_popular
                            ) && (
                              <span className="mini-feature popular">
                                ⭐ Popular
                              </span>
                            )}

                            {normalizeBoolean(
                              food.is_featured
                            ) && (
                              <span className="mini-feature featured">
                                ✨ Featured
                              </span>
                            )}

                            {images.length >
                              0 && (
                              <span className="mini-feature images">
                                📸{" "}
                                {
                                  images.length
                                }
                              </span>
                            )}

                          </div>

                        </td>

                        <td>

                          <div className="table-actions">

                            <button
                              type="button"
                              className="table-edit-btn"
                              onClick={() =>
                                openEditModal(
                                  food
                                )
                              }
                            >
                              ✏️ Edit
                            </button>

                            <button
                              type="button"
                              className="table-delete-btn"
                              onClick={() =>
                                handleDeleteFood(
                                  food
                                )
                              }
                              disabled={
                                deleting
                              }
                            >
                              🗑️
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {showEditModal &&
        editingFood && (
          <div
            className="edit-food-overlay"
            onMouseDown={(
              event
            ) => {

              if (
                event.target ===
                event.currentTarget
              ) {
                closeEditModal();
              }

            }}
          >

            <div className="edit-food-modal">

              <div className="edit-modal-header">

                <div>

                  <span>
                    EDIT FOOD
                  </span>

                  <h2>
                    {
                      editingFood.name
                    }
                  </h2>

                </div>

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={
                    closeEditModal
                  }
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={
                  handleUpdateFood
                }
                className="edit-food-form"
              >

                <div className="edit-form-grid">

                  <div className="form-group">

                    <label>
                      Restaurant Name
                    </label>

                    <input
                      type="text"
                      name="restaurant_name"
                      value={
                        form.restaurant_name
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Food Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={
                        form.name
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>

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
                      required
                    >

                      <option value="">
                        Select Category
                      </option>

                      {categories.map(
                        (
                          category
                        ) => (
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
                      required
                    >

                      <option value="">
                        Select Sub Category
                      </option>

                      {subCategories.map(
                        (
                          subCategory
                        ) => (
                          <option
                            key={
                              subCategory.id
                            }
                            value={
                              subCategory.id
                            }
                          >
                            {
                              subCategory.name
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Price
                    </label>

                    <div className="input-prefix">

                      <span>
                        ₹
                      </span>

                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        value={
                          form.price
                        }
                        onChange={
                          handleChange
                        }
                        required
                      />

                    </div>

                  </div>

                  <div className="form-group">

                    <label>
                      Stock Quantity
                    </label>

                    <input
                      type="number"
                      name="stock_quantity"
                      min="0"
                      value={
                        form.stock_quantity
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>

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

                      <option value="VEG">
                        🟢 Veg
                      </option>

                      <option value="NON-VEG">
                        🔴 Non-Veg
                      </option>

                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Preparation Time
                    </label>

                    <input
                      type="number"
                      name="preparation_time"
                      min="1"
                      value={
                        form.preparation_time
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

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

                      <option value="MILD">
                        Mild
                      </option>

                      <option value="MEDIUM">
                        Medium
                      </option>

                      <option value="HOT">
                        Hot
                      </option>

                      <option value="EXTRA HOT">
                        Extra Hot
                      </option>

                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Calories
                    </label>

                    <input
                      type="number"
                      name="calories"
                      min="0"
                      value={
                        form.calories
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Serves
                    </label>

                    <input
                      type="number"
                      name="serves"
                      min="1"
                      value={
                        form.serves
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Sort Order
                    </label>

                    <input
                      type="number"
                      name="sort_order"
                      min="0"
                      value={
                        form.sort_order
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="form-group form-group-full">

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
                      rows="4"
                    />

                  </div>

                </div>

                {/* AVAILABILITY */}

                <div className="edit-availability-row">

                  <div>

                    <strong>
                      Availability
                    </strong>

                    <small>

                      {Number(
                        form.stock_quantity
                      ) <= 0
                        ? "Stock is zero — automatically unavailable"
                        : effectiveAvailability
                        ? "Customers can order this food"
                        : "Customers cannot order this food"}

                    </small>

                  </div>

                  <button
                    type="button"
                    className={`edit-availability-toggle ${
                      effectiveAvailability
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {

                      if (
                        Number(
                          form.stock_quantity
                        ) <= 0
                      ) {

                        setError(
                          "Stock must be greater than 0."
                        );

                        return;
                      }

                      setForm(
                        (prev) => ({
                          ...prev,
                          availability:
                            !normalizeBoolean(
                              prev.availability
                            ),
                        })
                      );

                    }}
                  >

                    <span />

                  </button>

                </div>

                {/* FEATURES */}

                <div className="edit-features">

                  <label>

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

                    ⭐ Popular

                  </label>

                  <label>

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

                    ✨ Featured

                  </label>

                </div>

                {/* EXISTING IMAGES */}

                <div className="edit-images-section">

                  <div className="edit-images-title">

                    <div>

                      <strong>
                        Food Images
                      </strong>

                      <small>
                        {
                          existingImages.length +
                          selectedImages.length
                        }
                        /4 images
                      </small>

                    </div>

                    <input
                      ref={
                        editImageInputRef
                      }
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      multiple
                      hidden
                      onChange={
                        handleImageSelection
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        editImageInputRef.current?.click()
                      }
                      disabled={
                        existingImages.length +
                          selectedImages.length >=
                        MAX_IMAGES
                      }
                    >
                      + Add Images
                    </button>

                  </div>

                  <div className="edit-images-grid">

                    {existingImages.map(
                      (
                        image,
                        index
                      ) => (
                        <div
                          className="edit-image-card"
                          key={
                            image +
                            index
                          }
                        >

                          <img
                            src={getImageUrl(
                              image
                            )}
                            alt={`Existing food ${
                              index + 1
                            }`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeExistingImage(
                                index
                              )
                            }
                          >
                            ×
                          </button>

                          {index ===
                            0 && (
                            <span>
                              Main
                            </span>
                          )}

                        </div>
                      )
                    )}

                    {imagePreviews.map(
                      (
                        preview,
                        index
                      ) => (
                        <div
                          className="edit-image-card new"
                          key={
                            preview
                          }
                        >

                          <img
                            src={
                              preview
                            }
                            alt={`New food ${
                              index + 1
                            }`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeSelectedImage(
                                index
                              )
                            }
                          >
                            ×
                          </button>

                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* MODAL ACTIONS */}

                <div className="edit-modal-actions">

                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={
                      closeEditModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="modal-save-btn"
                    disabled={
                      saving
                    }
                  >

                    {saving ? (
                      <>
                        <span className="button-spinner" />
                        Saving...
                      </>
                    ) : (
                      <>
                        ✓ Save Changes
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  );
};

export default AddFood;