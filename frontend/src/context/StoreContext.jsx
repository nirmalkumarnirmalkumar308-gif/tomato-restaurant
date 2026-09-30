import React, {
  createContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

// =====================================================
// CREATE CONTEXT
// =====================================================

export const StoreContext = createContext(null);

// =====================================================
// API
// =====================================================

const API_URL = "http://localhost:4000/api";

// =====================================================
// STORE CONTEXT PROVIDER
// =====================================================

const StoreContextProvider = ({ children }) => {
  const [food_list, setFoodList] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState({});

  // ===================================================
  // LOAD CART
  // ===================================================

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem("cartItems");

      if (savedCart) {
        const parsedCart =
          JSON.parse(savedCart);

        if (
          parsedCart &&
          typeof parsedCart === "object"
        ) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error(
        "Cart load error:",
        error
      );

      setCartItems({});
    }
  }, []);

  // ===================================================
  // SAVE CART
  // ===================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "cartItems",
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error(
        "Cart save error:",
        error
      );
    }
  }, [cartItems]);

  // ===================================================
  // NORMALIZE BOOLEAN
  // ===================================================

  const normalizeBoolean = (value) => {
    return (
      value === true ||
      value === 1 ||
      value === "1" ||
      value === "true" ||
      value === "TRUE"
    );
  };

  // ===================================================
  // CHECK AVAILABILITY
  // ===================================================

  const normalizeAvailability = (item) => {
    if (!item) {
      return false;
    }

    // If stock_quantity exists,
    // stock must be greater than 0
    if (
      item.stock_quantity !== undefined &&
      item.stock_quantity !== null
    ) {
      const stock = Number(
        item.stock_quantity
      );

      if (
        !Number.isNaN(stock) &&
        stock <= 0
      ) {
        return false;
      }
    }

    // If backend doesn't send availability,
    // consider item available
    if (
      item.availability === undefined ||
      item.availability === null
    ) {
      return true;
    }

    return (
      item.availability === true ||
      item.availability === 1 ||
      item.availability === "1" ||
      item.availability === "true" ||
      item.availability === "TRUE"
    );
  };

  // ===================================================
  // NORMALIZE IMAGES
  // ===================================================

  const normalizeImages = (
    images,
    image
  ) => {
    let finalImages = [];

    if (Array.isArray(images)) {
      finalImages = images;
    } else if (
      typeof images === "string"
    ) {
      try {
        const parsed =
          JSON.parse(images);

        if (Array.isArray(parsed)) {
          finalImages = parsed;
        }
      } catch {
        if (images.trim()) {
          finalImages = [images];
        }
      }
    }

    if (
      finalImages.length === 0 &&
      image
    ) {
      finalImages = [image];
    }

    return finalImages.filter(Boolean);
  };

  // ===================================================
  // FORMAT FOOD ITEM
  // ===================================================

  const formatFoodItem = (item) => {
    if (!item) {
      return null;
    }

    const images = normalizeImages(
      item.images,
      item.image
    );

    return {
      ...item,

      id: item.id,

      name: item.name || "",

      price: Number(
        item.price || 0
      ),

      description:
        item.description || "",

      category_id:
        item.category_id ?? null,

      sub_category_id:
        item.sub_category_id ?? null,

      restaurant_name:
        item.restaurant_name || "",

      food_type:
        item.food_type || "",

      stock_quantity:
        Number(
          item.stock_quantity ?? 0
        ),

      availability:
        normalizeAvailability(item),

      is_popular:
        normalizeBoolean(
          item.is_popular
        ),

      is_featured:
        normalizeBoolean(
          item.is_featured
        ),

      images,

      image:
        item.image ||
        images[0] ||
        "",
    };
  };

  // ===================================================
  // EXTRACT ARRAY
  // ===================================================

  const extractArray = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (
      Array.isArray(data?.items)
    ) {
      return data.items;
    }

    if (
      Array.isArray(data?.food_list)
    ) {
      return data.food_list;
    }

    if (
      Array.isArray(data?.categories)
    ) {
      return data.categories;
    }

    if (
      Array.isArray(data?.data)
    ) {
      return data.data;
    }

    return [];
  };

  // ===================================================
  // FETCH ITEMS
  // ===================================================

  const getItems = async () => {
    try {
      setLoading(true);

      const response =
        await axios.get(
          `${API_URL}/items`
        );

      const items =
        extractArray(
          response.data
        );

      const formattedItems =
        items
          .map(formatFoodItem)
          .filter(Boolean);

      setFoodList(
        formattedItems
      );

      return formattedItems;
    } catch (error) {
      console.error(
        "Food items fetch error:",
        error
      );

      setFoodList([]);

      return [];
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // FETCH CATEGORIES
  // ===================================================

  const getCategories = async () => {
    try {
      const response =
        await axios.get(
          `${API_URL}/categories`
        );

      const categoryData =
        Array.isArray(
          response.data
        )
          ? response.data
          : Array.isArray(
              response.data?.categories
            )
          ? response.data.categories
          : Array.isArray(
              response.data?.data
            )
          ? response.data.data
          : [];

      setCategories(
        categoryData
      );

      return categoryData;
    } catch (error) {
      console.error(
        "Categories fetch error:",
        error
      );

      setCategories([]);

      return [];
    }
  };

  // ===================================================
  // INITIAL DATA
  // ===================================================

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        getItems(),
        getCategories(),
      ]);
    };

    loadData();
  }, []);

  // ===================================================
  // ADD TO CART
  // ===================================================

  const addToCart = (
    itemId,
    quantity = 1
  ) => {
    const id = String(itemId);

    const item =
      food_list.find(
        (food) =>
          String(food.id) === id
      );

    if (!item) {
      console.warn(
        "Food item not found:",
        itemId
      );

      return;
    }

    // Individual item availability
    if (!item.availability) {
      alert(
        `${item.name} is currently unavailable`
      );

      return;
    }

    const currentQuantity =
      Number(
        cartItems[id] || 0
      );

    const stock =
      Number(
        item.stock_quantity ?? 0
      );

    const requestedQuantity =
      currentQuantity +
      Number(quantity);

    if (
      stock > 0 &&
      requestedQuantity > stock
    ) {
      alert(
        `Only ${stock} quantity available`
      );

      return;
    }

    setCartItems((prev) => ({
      ...prev,

      [id]:
        Number(prev[id] || 0) +
        Number(quantity),
    }));
  };

  // ===================================================
  // REMOVE FROM CART
  // ===================================================

  const removeFromCart = (
    itemId
  ) => {
    const id = String(itemId);

    setCartItems((prev) => {
      const updated = {
        ...prev,
      };

      const current =
        Number(
          updated[id] || 0
        );

      if (current <= 1) {
        delete updated[id];
      } else {
        updated[id] =
          current - 1;
      }

      return updated;
    });
  };

  // ===================================================
  // REMOVE COMPLETE ITEM
  // ===================================================

  const removeItem = (
    itemId
  ) => {
    const id = String(itemId);

    setCartItems((prev) => {
      const updated = {
        ...prev,
      };

      delete updated[id];

      return updated;
    });
  };

  // ===================================================
  // CLEAR CART
  // ===================================================

  const clearCart = () => {
    setCartItems({});

    localStorage.removeItem(
      "cartItems"
    );
  };

  // ===================================================
  // TOTAL CART AMOUNT
  // ===================================================

  const getTotalCartAmount = () => {
    let total = 0;

    Object.entries(
      cartItems
    ).forEach(
      ([id, quantity]) => {
        const item =
          food_list.find(
            (food) =>
              String(food.id) ===
              String(id)
          );

        if (item) {
          total +=
            Number(
              item.price || 0
            ) *
            Number(
              quantity || 0
            );
        }
      }
    );

    return total;
  };

  // ===================================================
  // TOTAL CART ITEMS
  // ===================================================

  const getTotalCartItems = () => {
    return Object.values(
      cartItems
    ).reduce(
      (total, quantity) =>
        total +
        Number(
          quantity || 0
        ),
      0
    );
  };

  // ===================================================
  // DELIVERY FEE
  // ===================================================

  const getDeliveryFee = () => {
    const subtotal =
      getTotalCartAmount();

    if (subtotal <= 0) {
      return 0;
    }

    if (subtotal >= 500) {
      return 0;
    }

    return 40;
  };

  // ===================================================
  // TAX
  // ===================================================

  const getTaxAmount = () => {
    const subtotal =
      getTotalCartAmount();

    return subtotal * 0.05;
  };

  // ===================================================
  // GRAND TOTAL
  // ===================================================

  const getGrandTotal = () => {
    const subtotal =
      getTotalCartAmount();

    const delivery =
      getDeliveryFee();

    const tax =
      getTaxAmount();

    return (
      subtotal +
      delivery +
      tax
    );
  };

  // ===================================================
  // GET FOOD BY ID
  // ===================================================

  const getFoodById = (
    itemId
  ) => {
    return food_list.find(
      (item) =>
        String(item.id) ===
        String(itemId)
    );
  };

  // ===================================================
  // REFRESH FOOD LIST
  // ===================================================

  const refreshFoodList =
    async () => {
      return await getItems();
    };

  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const contextValue = {
    API_URL,

    food_list,
    setFoodList,

    categories,
    setCategories,

    loading,

    cartItems,
    setCartItems,

    addToCart,
    removeFromCart,
    removeItem,
    clearCart,

    getTotalCartAmount,
    getTotalCartItems,

    getDeliveryFee,
    getTaxAmount,
    getGrandTotal,

    getFoodById,
    refreshFoodList,
  };

  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <StoreContext.Provider
      value={contextValue}
    >
      {children}
    </StoreContext.Provider>
  );
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default StoreContextProvider;