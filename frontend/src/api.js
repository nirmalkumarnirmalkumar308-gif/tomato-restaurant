import axios from "axios";

// =====================================================
// API CONFIGURATION
// =====================================================

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized request");
    }

    if (error.response?.status === 403) {
      console.log("Access denied");
    }

    return Promise.reject(error);
  }
);

// =====================================================
// CATEGORIES
// =====================================================

// Get all categories
export const getCategories = async () => {
  const response = await API.get("/categories");
  return response.data;
};

// Create category
export const createCategory = async (data) => {
  const response = await API.post(
    "/categories",
    data
  );

  return response.data;
};

// Update category
export const updateCategory = async (id, data) => {
  const response = await API.put(
    `/categories/${id}`,
    data
  );

  return response.data;
};

// Delete category
export const deleteCategory = async (id) => {
  const response = await API.delete(
    `/categories/${id}`
  );

  return response.data;
};

// Update category order
export const updateCategoryOrder = async (
  categories
) => {
  const response = await API.put(
    "/categories/order",
    {
      categories,
    }
  );

  return response.data;
};

// =====================================================
// SUB CATEGORIES
// =====================================================

// Get all sub categories
export const getAllSubCategories = async () => {
  const response = await API.get(
    "/subcategories"
  );

  return response.data;
};

// Get sub categories by category
export const getSubCategories = async (
  categoryId
) => {
  const response = await API.get(
    `/subcategories/category/${categoryId}`
  );

  return response.data;
};

// Create sub category
export const createSubCategory = async (
  data
) => {
  const response = await API.post(
    "/subcategories",
    data
  );

  return response.data;
};

// Update sub category
export const updateSubCategory = async (
  id,
  data
) => {
  const response = await API.put(
    `/subcategories/${id}`,
    data
  );

  return response.data;
};

// Delete sub category
export const deleteSubCategory = async (
  id
) => {
  const response = await API.delete(
    `/subcategories/${id}`
  );

  return response.data;
};

// Update sub category order
export const updateSubCategoryOrder = async (
  subCategories
) => {
  const response = await API.put(
    "/subcategories/order",
    {
      subCategories,
    }
  );

  return response.data;
};

// =====================================================
// FOOD ITEMS
// =====================================================

// Create food item
export const createItem = async (data) => {
  const response = await API.post(
    "/items",
    data
  );

  return response.data;
};

// Get all food items
export const getItems = async () => {
  const response = await API.get(
    "/items"
  );

  return response.data;
};

// Get single food item
export const getItemById = async (id) => {
  const response = await API.get(
    `/items/${id}`
  );

  return response.data;
};

// Update food item
export const updateItem = async (
  id,
  data
) => {
  const response = await API.put(
    `/items/${id}`,
    data
  );

  return response.data;
};

// Delete food item
export const deleteItem = async (id) => {
  const response = await API.delete(
    `/items/${id}`
  );

  return response.data;
};

// =====================================================
// DEFAULT TOMATO FOOD SYNC
// =====================================================

export const syncDefaultItems = async (
  items
) => {
  const response = await API.post(
    "/items/sync-defaults",
    {
      items,
    }
  );

  return response.data;
};

// =====================================================
// ORDERS
// =====================================================

// Create order
export const createOrder = async (
  orderData
) => {
  const response = await API.post(
    "/orders",
    orderData
  );

  return response.data;
};

// Get all orders
export const getOrders = async () => {
  const response = await API.get(
    "/orders"
  );

  return response.data;
};

// Get single order
export const getOrderById = async (id) => {
  const response = await API.get(
    `/orders/${id}`
  );

  return response.data;
};

// Update order
export const updateOrder = async (
  id,
  data
) => {
  const response = await API.put(
    `/orders/${id}`,
    data
  );

  return response.data;
};

// Delete order
export const deleteOrder = async (id) => {
  const response = await API.delete(
    `/orders/${id}`
  );

  return response.data;
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default API;

