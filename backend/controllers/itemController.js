const Item = require("../models/item");

const Category = require("../models/Category");

const SubCategory = require("../models/SubCategory");

const cloudinary = require("../config/cloudinary");

const streamifier = require("streamifier");

const MAX_IMAGES = 4;

// =====================================================
// DEFAULT RESTAURANT NAME
// =====================================================

const DEFAULT_RESTAURANT_NAME =
  "Tomato Restaurant";

// =====================================================
// SYNC LOCK
// =====================================================

let defaultSyncPromise = null;

// =====================================================
// NORMALIZE NAME
// =====================================================

const normalizeName = (name) => {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};

// =====================================================
// CREATE UNIQUE SYNC KEY
// FOOD NAME + CATEGORY
// =====================================================

const createItemSyncKey = (
  name,
  categoryId
) => {
  return `${normalizeName(name)}|${String(
    categoryId || ""
  )}`;
};

// =====================================================
// NORMALIZE BOOLEAN
// =====================================================

const normalizeBoolean = (value) => {
  if (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "TRUE" ||
    value === "True" ||
    value === "yes" ||
    value === "YES" ||
    value === "Yes"
  ) {
    return true;
  }

  return false;
};

// =====================================================
// UPLOAD IMAGE TO CLOUDINARY
// =====================================================

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const stream =
      cloudinary.uploader.upload_stream(
        {
          folder:
            "tomato-food-app/food-images",

          resource_type: "image",
        },

        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

    streamifier
      .createReadStream(file.buffer)
      .pipe(stream);
  });
};

// =====================================================
// DELETE CLOUDINARY IMAGE
// =====================================================

const deleteCloudinaryImage = async (
  imageUrl
) => {
  if (
    !imageUrl ||
    typeof imageUrl !== "string"
  ) {
    return;
  }

  try {
    const uploadIndex =
      imageUrl.indexOf("/upload/");

    if (uploadIndex === -1) {
      return;
    }

    let publicId =
      imageUrl.substring(
        uploadIndex +
          "/upload/".length
      );

    const parts =
      publicId.split("/");

    // Remove Cloudinary version
    // Example: v123456789
    if (
      parts[0] &&
      /^v\d+$/.test(parts[0])
    ) {
      publicId =
        parts.slice(1).join("/");
    }

    // Remove extension
    publicId =
      publicId.replace(
        /\.[^/.]+$/,
        ""
      );

    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(
      publicId
    );

    console.log(
      "Cloudinary image deleted:",
      publicId
    );
  } catch (error) {
    console.log(
      "Cloudinary delete error:",
      error.message
    );
  }
};

// =====================================================
// NORMALIZE IMAGES
// =====================================================

const normalizeImages = (images) => {
  if (Array.isArray(images)) {
    return images.filter(Boolean);
  }

  if (typeof images === "string") {
    try {
      const parsed =
        JSON.parse(images);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }

      if (parsed) {
        return [parsed];
      }
    } catch (error) {
      if (
        images.startsWith("http") ||
        images.startsWith("/")
      ) {
        return [images];
      }

      return [];
    }
  }

  return [];
};

// =====================================================
// STOCK HELPER
// =====================================================

const toStock = (
  value,
  defaultValue = 0
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const stock = Number(value);

  if (
    !Number.isFinite(stock) ||
    stock < 0
  ) {
    return defaultValue;
  }

  return Math.floor(stock);
};

// =====================================================
// AVAILABILITY HELPER
// =====================================================

const getUserAvailability = (
  availability,
  stock
) => {
  const normalizedAvailability =
    normalizeBoolean(
      availability
    );

  const normalizedStock =
    toStock(stock, 0);

  return (
    normalizedAvailability === true &&
    normalizedStock > 0
  );
};

// =====================================================
// RESTAURANT NAME HELPER
// =====================================================

const normalizeRestaurantName = (
  restaurantName
) => {
  const value = String(
    restaurantName || ""
  ).trim();

  return (
    value ||
    DEFAULT_RESTAURANT_NAME
  );
};

// =====================================================
// SEARCH FOOD / RESTAURANT ONLINE
// OPENSTREETMAP / NOMINATIM
// NO GOOGLE API KEY REQUIRED
// =====================================================

const searchFoodOnline = async (
  req,
  res
) => {
  try {
    const searchQuery = String(
      req.query.q || ""
    ).trim();

    if (!searchQuery) {
      return res.status(400).json({
        success: false,

        message:
          "Food or restaurant search query is required",
      });
    }

    console.log(
      "========================================"
    );

    console.log(
      "OPENSTREETMAP SEARCH:",
      searchQuery
    );

    console.log(
      "========================================"
    );

    // =================================================
    // NOMINATIM SEARCH URL
    // =================================================

    const nominatimUrl =
      "https://nominatim.openstreetmap.org/search" +
      `?q=${encodeURIComponent(
        searchQuery
      )}` +
      "&format=jsonv2" +
      "&addressdetails=1" +
      "&limit=10";

    // =================================================
    // CALL OPENSTREETMAP
    // =================================================

    const response =
      await fetch(
        nominatimUrl,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",

            // Required identification
            // for Nominatim requests
            "User-Agent":
              "TomatoFoodApp/1.0",
          },
        }
      );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.log(
        "NOMINATIM ERROR:",
        errorText
      );

      return res.status(
        response.status || 500
      ).json({
        success: false,

        message:
          "OpenStreetMap search failed",

        error:
          errorText ||
          "Unknown OpenStreetMap error",
      });
    }

    const data =
      await response.json();

    // =================================================
    // ENSURE ARRAY
    // =================================================

    const places =
      Array.isArray(data)
        ? data
        : [];

    // =================================================
    // ALLOWED FOOD TYPES
    // =================================================

    const allowedTypes = [
      "restaurant",
      "cafe",
      "fast_food",
      "food_court",
      "ice_cream",
      "bakery",
    ];

    // =================================================
    // FILTER RESTAURANT / FOOD PLACES
    // =================================================

    const filteredPlaces =
      places.filter(
        (place) => {
          const category =
            String(
              place.category ||
                place.class ||
                ""
            ).toLowerCase();

          const type =
            String(
              place.type || ""
            ).toLowerCase();

          // Direct OSM food category
          if (
            category === "amenity" &&
            allowedTypes.includes(
              type
            )
          ) {
            return true;
          }

          // Additional food-related names
          const displayName =
            String(
              place.name ||
                place.display_name ||
                ""
            ).toLowerCase();

          const foodWords = [
            "restaurant",
            "cafe",
            "food",
            "hotel",
            "biryani",
            "tiffin",
            "mess",
            "bakery",
            "kitchen",
            "hotel",
            "canteen",
            "dhaba",
          ];

          return foodWords.some(
            (word) =>
              displayName.includes(
                word
              )
          );
        }
      );

    // =================================================
    // FALLBACK
    // =================================================

    const finalPlaces =
      filteredPlaces.length > 0
        ? filteredPlaces
        : places;

    // =================================================
    // FORMAT RESULTS
    // =================================================

    const results =
      finalPlaces.map(
        (place, index) => {
          const address =
            place.address || {};

          const restaurantName =
            place.name ||
            place.display_name
              ?.split(",")[0] ||
            "Restaurant";

          const city =
            address.city ||
            address.town ||
            address.municipality ||
            address.village ||
            "";

          const state =
            address.state || "";

          const country =
            address.country || "";

          return {
            id:
              place.place_id ||
              `osm-${index}`,

            place_id:
              place.place_id ||
              `osm-${index}`,

            restaurant_name:
              restaurantName,

            name:
              restaurantName,

            address:
              place.display_name ||
              "Address unavailable",

            // OSM does not provide
            // Google-style ratings
            rating: null,

            rating_count: 0,

            price_level: null,

            image: null,

            latitude:
              place.lat
                ? Number(place.lat)
                : null,

            longitude:
              place.lon
                ? Number(place.lon)
                : null,

            city,

            state,

            country,

            osm_type:
              place.osm_type ||
              null,

            osm_id:
              place.osm_id ||
              null,

            category:
              place.category ||
              place.class ||
              null,

            type:
              place.type ||
              null,
          };
        }
      );

    console.log(
      "OPENSTREETMAP RESULTS:",
      results.length
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      query:
        searchQuery,

      count:
        results.length,

      results,
    });
  } catch (error) {
    console.log(
      "OPENSTREETMAP SEARCH ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Error searching restaurants using OpenStreetMap",

      error:
        error.message,
    });
  }
};

// =====================================================
// CREATE ITEM
// =====================================================

const createItem = async (
  req,
  res
) => {
  let uploadedImages = [];

  try {
    const {
      category_id,
      sub_category_id,
      restaurant_name,
      name,
      price,
      description,
      stock_quantity,
      preparation_time,
      food_type,
      spice_level,
      calories,
      serves,
      is_popular,
      is_featured,
      sort_order,
    } = req.body;

    console.log(
      "=============================="
    );

    console.log(
      "CREATE ITEM BODY:"
    );

    console.log(
      "category_id:",
      category_id
    );

    console.log(
      "sub_category_id:",
      sub_category_id
    );

    console.log(
      "restaurant_name:",
      restaurant_name
    );

    console.log(
      "name:",
      name
    );

    console.log(
      "price:",
      price
    );

    console.log(
      "stock_quantity:",
      stock_quantity
    );

    console.log(
      "=============================="
    );

    // =================================================
    // REQUIRED VALIDATION
    // =================================================

    if (!category_id) {
      return res.status(400).json({
        message:
          "Category is required",
      });
    }

    if (!sub_category_id) {
      return res.status(400).json({
        message:
          "Sub Category is required",
      });
    }

    if (
      !name ||
      !String(name).trim()
    ) {
      return res.status(400).json({
        message:
          "Food name is required",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        message:
          "Food price is required",
      });
    }

    const numericPrice =
      Number(price);

    if (
      !Number.isFinite(
        numericPrice
      ) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        message:
          "Invalid food price",
      });
    }

    // =================================================
    // RESTAURANT
    // =================================================

    const finalRestaurantName =
      normalizeRestaurantName(
        restaurant_name
      );

    // =================================================
    // STOCK
    // =================================================

    const finalStock =
      toStock(
        stock_quantity,
        0
      );

    // =================================================
    // AVAILABILITY
    // STOCK > 0 = AVAILABLE
    // STOCK = 0 = UNAVAILABLE
    // =================================================

    const finalAvailability =
      finalStock > 0;

    // =================================================
    // VERIFY CATEGORY
    // =================================================

    const category =
      await Category.findByPk(
        Number(category_id)
      );

    if (!category) {
      return res.status(400).json({
        message:
          "Selected category does not exist",
      });
    }

    // =================================================
    // VERIFY SUB CATEGORY
    // =================================================

    const subCategory =
      await SubCategory.findByPk(
        Number(sub_category_id)
      );

    if (!subCategory) {
      return res.status(400).json({
        message:
          "Selected sub category does not exist",
      });
    }

    // =================================================
    // VERIFY SUB CATEGORY BELONGS TO CATEGORY
    // =================================================

    const subCategoryParentId =
      subCategory.category_id ??
      subCategory.CategoryId ??
      subCategory.categoryId;

    if (
      subCategoryParentId !==
        undefined &&
      subCategoryParentId !== null &&
      String(
        subCategoryParentId
      ) !==
        String(category_id)
    ) {
      return res.status(400).json({
        message:
          "Selected sub category does not belong to selected category",
      });
    }

    // =================================================
    // FILES
    // =================================================

    const files =
      req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        message:
          "Please upload at least one image",
      });
    }

    if (
      files.length >
      MAX_IMAGES
    ) {
      return res.status(400).json({
        message:
          "Maximum 4 images are allowed",
      });
    }

    // =================================================
    // UPLOAD IMAGES
    // =================================================

    for (
      const file of files
    ) {
      const result =
        await uploadToCloudinary(
          file
        );

      if (
        result?.secure_url
      ) {
        uploadedImages.push(
          result.secure_url
        );
      }
    }

    // =================================================
    // CHECK UPLOAD
    // =================================================

    if (
      uploadedImages.length === 0
    ) {
      return res.status(400).json({
        message:
          "Image upload failed",
      });
    }

    // =================================================
    // CREATE ITEM
    // =================================================

    const item =
      await Item.create({
        category_id:
          Number(category_id),

        sub_category_id:
          Number(
            sub_category_id
          ),

        restaurant_name:
          finalRestaurantName,

        name:
          String(name).trim(),

        price:
          numericPrice,

        description:
          description &&
          String(
            description
          ).trim()
            ? String(
                description
              ).trim()
            : null,

        image:
          uploadedImages[0],

        images:
          uploadedImages,

        stock_quantity:
          finalStock,

        availability:
          finalAvailability,

        preparation_time:
          preparation_time === "" ||
          preparation_time ===
            undefined
            ? 20
            : Number(
                preparation_time
              ),

        food_type:
          food_type &&
          String(
            food_type
          ).trim()
            ? String(
                food_type
              ).trim()
            : null,

        spice_level:
          spice_level &&
          String(
            spice_level
          ).trim()
            ? String(
                spice_level
              ).trim()
            : "MEDIUM",

        calories:
          calories === "" ||
          calories === undefined
            ? null
            : Number(calories),

        serves:
          serves === "" ||
          serves === undefined
            ? 1
            : Number(serves),

        is_popular:
          normalizeBoolean(
            is_popular
          ),

        is_featured:
          normalizeBoolean(
            is_featured
          ),

        sort_order:
          sort_order === "" ||
          sort_order === undefined
            ? 0
            : Number(sort_order),
      });

    console.log(
      "ITEM CREATED:",
      item.toJSON()
    );

    return res.status(201).json({
      message:
        "Item created successfully",

      item,
    });
  } catch (error) {
    console.log(
      "CREATE ITEM ERROR:",
      error
    );

    // Delete uploaded images
    // if database creation fails
    for (
      const imageUrl of
      uploadedImages
    ) {
      await deleteCloudinaryImage(
        imageUrl
      );
    }

    return res.status(500).json({
      message:
        "Error creating Item",

      error:
        error.message,
    });
  }
};

// =====================================================
// GET ALL ITEMS
// =====================================================

const getItems = async (
  req,
  res
) => {
  try {
    const items =
      await Item.findAll({
        include: [
          {
            model: Category,

            attributes: [
              "id",
              "name",
            ],
          },

          {
            model: SubCategory,

            attributes: [
              "id",
              "name",
              "category_id",
            ],
          },
        ],

        order: [
          [
            "sort_order",
            "ASC",
          ],

          [
            "id",
            "DESC",
          ],
        ],
      });

    const updatedItems =
      items.map(
        (item) => {
          const data =
            item.toJSON();

          // =================================================
          // RESTAURANT
          // =================================================

          data.restaurant_name =
            normalizeRestaurantName(
              data.restaurant_name
            );

          // =================================================
          // STOCK
          // =================================================

          const stock =
            toStock(
              data.stock_quantity,
              0
            );

          data.stock_quantity =
            stock;

          // =================================================
          // DATABASE AVAILABILITY
          // =================================================

          data.availability =
            normalizeBoolean(
              data.availability
            );

          // =================================================
          // USER AVAILABILITY
          // =================================================

          data.user_available =
            getUserAvailability(
              data.availability,
              stock
            );

          return data;
        }
      );

    console.log(
      "========== GET ITEMS =========="
    );

    updatedItems.forEach(
      (item) => {
        console.log(
          item.name,
          {
            id:
              item.id,

            restaurant_name:
              item.restaurant_name,

            stock_quantity:
              item.stock_quantity,

            availability:
              item.availability,

            user_available:
              item.user_available,
          }
        );
      }
    );

    console.log(
      "================================"
    );

    return res.status(200).json(
      updatedItems
    );
  } catch (error) {
    console.log(
      "GET ITEMS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Error fetching Items",

      error:
        error.message,
    });
  }
};

// =====================================================
// GET ONE ITEM
// =====================================================

const getItemById = async (
  req,
  res
) => {
  try {
    const item =
      await Item.findByPk(
        req.params.id,
        {
          include: [
            {
              model: Category,

              attributes: [
                "id",
                "name",
              ],
            },

            {
              model: SubCategory,

              attributes: [
                "id",
                "name",
                "category_id",
              ],
            },
          ],
        }
      );

    if (!item) {
      return res.status(404).json({
        message:
          "Item not found",
      });
    }

    const data =
      item.toJSON();

    // =================================================
    // RESTAURANT
    // =================================================

    data.restaurant_name =
      normalizeRestaurantName(
        data.restaurant_name
      );

    // =================================================
    // STOCK
    // =================================================

    const stock =
      toStock(
        data.stock_quantity,
        0
      );

    data.stock_quantity =
      stock;

    // =================================================
    // DATABASE AVAILABILITY
    // =================================================

    data.availability =
      normalizeBoolean(
        data.availability
      );

    // =================================================
    // USER AVAILABILITY
    // =================================================

    data.user_available =
      getUserAvailability(
        data.availability,
        stock
      );

    return res.status(200).json(
      data
    );
  } catch (error) {
    console.log(
      "GET ITEM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Error fetching Item",

      error:
        error.message,
    });
  }
};

// =====================================================
// UPDATE ITEM
// =====================================================

const updateItem = async (
  req,
  res
) => {
  let uploadedImages = [];

  try {
    const item =
      await Item.findByPk(
        req.params.id
      );

    if (!item) {
      return res.status(404).json({
        message:
          "Item not found",
      });
    }

    const {
      category_id,
      sub_category_id,
      restaurant_name,
      name,
      price,
      description,
      existingImages,
      stock_quantity,
      availability,
      preparation_time,
      food_type,
      spice_level,
      calories,
      serves,
      is_popular,
      is_featured,
      sort_order,
    } = req.body;

    console.log(
      "=============================="
    );

    console.log(
      "UPDATE ITEM BODY:"
    );

    console.log(
      "category_id:",
      category_id
    );

    console.log(
      "sub_category_id:",
      sub_category_id
    );

    console.log(
      "restaurant_name:",
      restaurant_name
    );

    console.log(
      "name:",
      name
    );

    console.log(
      "price:",
      price
    );

    console.log(
      "stock_quantity:",
      stock_quantity
    );

    console.log(
      "availability:",
      availability
    );

    console.log(
      "=============================="
    );

    // =================================================
    // VALIDATION
    // =================================================

    if (!category_id) {
      return res.status(400).json({
        message:
          "Category is required",
      });
    }

    if (!sub_category_id) {
      return res.status(400).json({
        message:
          "Sub Category is required",
      });
    }

    if (
      !name ||
      !String(name).trim()
    ) {
      return res.status(400).json({
        message:
          "Food name is required",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        message:
          "Food price is required",
      });
    }

    const numericPrice =
      Number(price);

    if (
      !Number.isFinite(
        numericPrice
      ) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        message:
          "Invalid food price",
      });
    }

    // =================================================
    // RESTAURANT
    // =================================================

    const finalRestaurantName =
      normalizeRestaurantName(
        restaurant_name ||
          item.restaurant_name
      );

    // =================================================
    // STOCK
    // =================================================

    const finalStock =
      stock_quantity ===
        undefined
        ? toStock(
            item.stock_quantity,
            0
          )
        : toStock(
            stock_quantity,
            0
          );

    // =================================================
    // AVAILABILITY
    // =================================================

    let finalAvailability;

    if (
      availability !==
      undefined
    ) {
      finalAvailability =
        normalizeBoolean(
          availability
        );
    } else {
      finalAvailability =
        normalizeBoolean(
          item.availability
        );
    }

    // =================================================
    // STOCK ZERO = ALWAYS UNAVAILABLE
    // =================================================

    if (
      finalStock <= 0
    ) {
      finalAvailability =
        false;
    }

    // =================================================
    // VERIFY CATEGORY
    // =================================================

    const category =
      await Category.findByPk(
        Number(category_id)
      );

    if (!category) {
      return res.status(400).json({
        message:
          "Selected category does not exist",
      });
    }

    // =================================================
    // VERIFY SUB CATEGORY
    // =================================================

    const subCategory =
      await SubCategory.findByPk(
        Number(sub_category_id)
      );

    if (!subCategory) {
      return res.status(400).json({
        message:
          "Selected sub category does not exist",
      });
    }

    // =================================================
    // VERIFY SUB CATEGORY BELONGS TO CATEGORY
    // =================================================

    const subCategoryParentId =
      subCategory.category_id ??
      subCategory.CategoryId ??
      subCategory.categoryId;

    if (
      subCategoryParentId !==
        undefined &&
      subCategoryParentId !== null &&
      String(
        subCategoryParentId
      ) !==
        String(category_id)
    ) {
      return res.status(400).json({
        message:
          "Selected sub category does not belong to selected category",
      });
    }

    // =================================================
    // OLD IMAGES
    // =================================================

    let oldImages =
      normalizeImages(
        item.images
      );

    if (
      oldImages.length === 0 &&
      item.image
    ) {
      oldImages = [
        item.image,
      ];
    }

    // =================================================
    // KEPT IMAGES
    // =================================================

    let keptImages = [];

    if (existingImages) {
      try {
        const parsed =
          typeof existingImages ===
          "string"
            ? JSON.parse(
                existingImages
              )
            : existingImages;

        if (
          Array.isArray(parsed)
        ) {
          keptImages =
            parsed.filter(
              Boolean
            );
        }
      } catch (error) {
        console.log(
          "EXISTING IMAGES PARSE ERROR:",
          error.message
        );

        keptImages = [];
      }
    }

    // =================================================
    // ONLY ALLOW OLD IMAGES
    // =================================================

    keptImages =
      keptImages.filter(
        (url) =>
          oldImages.includes(
            url
          )
      );

    // =================================================
    // NEW FILES
    // =================================================

    const newFiles =
      req.files || [];

    if (
      keptImages.length +
        newFiles.length >
      MAX_IMAGES
    ) {
      return res.status(400).json({
        message:
          "Maximum 4 images are allowed",
      });
    }

    // =================================================
    // UPLOAD NEW IMAGES
    // =================================================

    for (
      const file of newFiles
    ) {
      const result =
        await uploadToCloudinary(
          file
        );

      if (
        result?.secure_url
      ) {
        uploadedImages.push(
          result.secure_url
        );
      }
    }

    // =================================================
    // FINAL IMAGES
    // =================================================

    const finalImages = [
      ...keptImages,
      ...uploadedImages,
    ];

    if (
      finalImages.length === 0
    ) {
      return res.status(400).json({
        message:
          "Food must have at least one image",
      });
    }

    if (
      finalImages.length >
      MAX_IMAGES
    ) {
      return res.status(400).json({
        message:
          "Maximum 4 images are allowed",
      });
    }

    // =================================================
    // DELETE REMOVED IMAGES
    // =================================================

    const removedImages =
      oldImages.filter(
        (oldImage) =>
          !keptImages.includes(
            oldImage
          )
      );

    for (
      const removedImage of
      removedImages
    ) {
      await deleteCloudinaryImage(
        removedImage
      );
    }

    // =================================================
    // UPDATE ITEM
    // =================================================

    await item.update({
      category_id:
        Number(category_id),

      sub_category_id:
        Number(
          sub_category_id
        ),

      restaurant_name:
        finalRestaurantName,

      name:
        String(name).trim(),

      price:
        numericPrice,

      description:
        description &&
        String(description).trim()
          ? String(
              description
            ).trim()
          : null,

      image:
        finalImages[0],

      images:
        finalImages,

      stock_quantity:
        finalStock,

      availability:
        finalAvailability,

      preparation_time:
        preparation_time === "" ||
        preparation_time ===
          undefined
          ? item.preparation_time
          : Number(
              preparation_time
            ),

      food_type:
        food_type &&
        String(
          food_type
        ).trim()
          ? String(
              food_type
            ).trim()
          : null,

      spice_level:
        spice_level &&
        String(
          spice_level
        ).trim()
          ? String(
              spice_level
            ).trim()
          : "MEDIUM",

      calories:
        calories === "" ||
        calories === undefined
          ? null
          : Number(calories),

      serves:
        serves === "" ||
        serves === undefined
          ? item.serves
          : Number(serves),

      is_popular:
        is_popular !==
        undefined
          ? normalizeBoolean(
              is_popular
            )
          : item.is_popular,

      is_featured:
        is_featured !==
        undefined
          ? normalizeBoolean(
              is_featured
            )
          : item.is_featured,

      sort_order:
        sort_order === "" ||
        sort_order === undefined
          ? item.sort_order || 0
          : Number(sort_order),
    });

    console.log(
      "ITEM UPDATED:",
      item.toJSON()
    );

    return res.status(200).json({
      message:
        "Item updated successfully",

      item,
    });
  } catch (error) {
    console.log(
      "UPDATE ITEM ERROR:",
      error
    );

    // Delete newly uploaded images
    // if update failed
    for (
      const imageUrl of
      uploadedImages
    ) {
      await deleteCloudinaryImage(
        imageUrl
      );
    }

    return res.status(500).json({
      message:
        "Error updating Item",

      error:
        error.message,
    });
  }
};

// =====================================================
// DELETE ITEM
// =====================================================

const deleteItem = async (
  req,
  res
) => {
  try {
    const item =
      await Item.findByPk(
        req.params.id
      );

    if (!item) {
      return res.status(404).json({
        message:
          "Item not found",
      });
    }

    let images =
      normalizeImages(
        item.images
      );

    if (
      images.length === 0 &&
      item.image
    ) {
      images = [
        item.image,
      ];
    }

    // =================================================
    // DELETE CLOUDINARY IMAGES
    // =================================================

    for (
      const imageUrl of
      images
    ) {
      await deleteCloudinaryImage(
        imageUrl
      );
    }

    // =================================================
    // DELETE DATABASE ITEM
    // =================================================

    await item.destroy();

    return res.status(200).json({
      message:
        "Item deleted successfully",
    });
  } catch (error) {
    console.log(
      "DELETE ITEM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Error deleting Item",

      error:
        error.message,
    });
  }
};

// =====================================================
// SYNC DEFAULT FOOD ITEMS
// =====================================================

const syncDefaultItems = async (
  req,
  res
) => {
  // =================================================
  // PREVENT MULTIPLE SYNC REQUESTS
  // =================================================

  if (defaultSyncPromise) {
    console.log(
      "DEFAULT FOOD SYNC ALREADY RUNNING - WAITING..."
    );

    try {
      const result =
        await defaultSyncPromise;

      return res.status(200).json({
        ...result,

        message:
          "Default food items already synced",
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Error syncing default food items",

        error:
          error.message,
      });
    }
  }

  defaultSyncPromise =
    (async () => {
      try {
        const {
          items,
        } = req.body;

        if (
          !Array.isArray(items)
        ) {
          throw new Error(
            "Items array is required"
          );
        }

        const syncedItems = [];

        const createdItems = [];

        const existingItems = [];

        // =================================================
        // LOAD EXISTING ITEMS
        // =================================================

        const allExistingItems =
          await Item.findAll();

        const itemMap =
          new Map();

        for (
          const item of
          allExistingItems
        ) {
          const key =
            createItemSyncKey(
              item.name,
              item.category_id
            );

          if (
            !itemMap.has(key)
          ) {
            itemMap.set(
              key,
              item
            );
          }
        }

        // =================================================
        // PROCESS DEFAULT FOODS
        // =================================================

        for (
          const food of items
        ) {
          try {
            const name =
              typeof food?.name ===
              "string"
                ? food.name.trim()
                : "";

            if (!name) {
              continue;
            }

            const normalizedFoodName =
              normalizeName(
                name
              );

            const price =
              Number(
                food?.price || 0
              );

            if (price <= 0) {
              continue;
            }

            // ===========================================
            // CATEGORY NAME
            // ===========================================

            let categoryName =
              "";

            if (
              typeof food.category ===
              "string"
            ) {
              categoryName =
                food.category.trim();
            } else if (
              food.category &&
              typeof food.category ===
                "object"
            ) {
              categoryName =
                food.category.name?.trim() ||
                "";
            }

            if (!categoryName) {
              categoryName =
                "General";
            }

            // ===========================================
            // FIND / CREATE CATEGORY
            // ===========================================

            let category =
              await Category.findOne({
                where: {
                  name:
                    categoryName,
                },
              });

            if (!category) {
              category =
                await Category.create({
                  name:
                    categoryName,
                });

              console.log(
                "Created category:",
                categoryName
              );
            }

            // ===========================================
            // SUB CATEGORY NAME
            // ===========================================

            let subCategoryName =
              "";

            if (
              typeof food.subCategory ===
              "string"
            ) {
              subCategoryName =
                food.subCategory.trim();
            } else if (
              food.subCategory &&
              typeof food.subCategory ===
                "object"
            ) {
              subCategoryName =
                food.subCategory.name?.trim() ||
                "";
            }

            if (
              !subCategoryName
            ) {
              subCategoryName =
                categoryName;
            }

            // ===========================================
            // FIND / CREATE SUB CATEGORY
            // ===========================================

            let subCategory =
              await SubCategory.findOne({
                where: {
                  category_id:
                    category.id,

                  name:
                    subCategoryName,
                },
              });

            if (!subCategory) {
              subCategory =
                await SubCategory.create({
                  category_id:
                    category.id,

                  name:
                    subCategoryName,
                });

              console.log(
                "Created sub category:",
                subCategoryName
              );
            }

            // ===========================================
            // CHECK EXISTING FOOD
            // NAME + CATEGORY
            // ===========================================

            const syncKey =
              createItemSyncKey(
                normalizedFoodName,
                category.id
              );

            const existingItem =
              itemMap.get(
                syncKey
              );

            // ===========================================
            // DEFAULT IMAGE
            // ===========================================

            let image = null;

            if (
              typeof food.image ===
              "string"
            ) {
              image =
                food.image.trim() ||
                null;
            } else if (
              food.image &&
              typeof food.image ===
                "object"
            ) {
              image =
                food.image.default ||
                food.image.src ||
                null;
            }

            // ===========================================
            // DEFAULT STOCK
            // ===========================================

            const defaultStock =
              toStock(
                food?.stock_quantity ??
                  food?.stock ??
                  0,
                0
              );

            const defaultAvailability =
              defaultStock > 0;

            // ===========================================
            // RESTAURANT
            // ===========================================

            const defaultRestaurantName =
              normalizeRestaurantName(
                food?.restaurant_name
              );

            // ===========================================
            // EXISTING ITEM
            // ===========================================

            if (
              existingItem
            ) {
              existingItems.push(
                existingItem
              );

              const updateData = {
                restaurant_name:
                  existingItem.restaurant_name ||
                  defaultRestaurantName,

                category_id:
                  category.id,

                sub_category_id:
                  subCategory.id,
              };

              // =========================================
              // NEVER OVERWRITE ADMIN STOCK
              // =========================================

              if (
                existingItem.stock_quantity ===
                  undefined ||
                existingItem.stock_quantity ===
                  null
              ) {
                updateData.stock_quantity =
                  defaultStock;

                updateData.availability =
                  defaultAvailability;
              }

              // =========================================
              // ADD DEFAULT IMAGE ONLY IF NONE
              // =========================================

              if (
                !existingItem.image &&
                image
              ) {
                updateData.image =
                  image;

                updateData.images = [
                  image,
                ];
              }

              await existingItem.update(
                updateData
              );

              syncedItems.push(
                existingItem
              );

              continue;
            }

            // ===========================================
            // CREATE DEFAULT FOOD
            // ===========================================

            const newItem =
              await Item.create({
                category_id:
                  category.id,

                sub_category_id:
                  subCategory.id,

                restaurant_name:
                  defaultRestaurantName,

                name:
                  name,

                price:
                  price,

                description:
                  food.description?.trim() ||
                  null,

                image:
                  image,

                images:
                  image
                    ? [image]
                    : [],

                stock_quantity:
                  defaultStock,

                availability:
                  defaultAvailability,

                preparation_time:
                  food.preparation_time
                    ? Number(
                        food.preparation_time
                      )
                    : 20,

                food_type:
                  food.food_type?.trim() ||
                  null,

                spice_level:
                  food.spice_level?.trim() ||
                  "MEDIUM",

                calories:
                  food.calories
                    ? Number(
                        food.calories
                      )
                    : null,

                serves:
                  food.serves
                    ? Number(
                        food.serves
                      )
                    : 1,

                is_popular:
                  normalizeBoolean(
                    food.is_popular
                  ),

                is_featured:
                  normalizeBoolean(
                    food.is_featured
                  ),

                sort_order:
                  food.sort_order
                    ? Number(
                        food.sort_order
                      )
                    : 0,
              });

            itemMap.set(
              syncKey,
              newItem
            );

            createdItems.push(
              newItem
            );

            syncedItems.push(
              newItem
            );

            console.log(
              "Created default food:",
              name
            );
          } catch (
            foodError
          ) {
            console.log(
              "Error syncing food:",
              food?.name,
              foodError.message
            );
          }
        }

        return {
          message:
            "Default food items synced successfully",

          total:
            syncedItems.length,

          created:
            createdItems.length,

          alreadyExists:
            existingItems.length,

          items:
            syncedItems,
        };
      } catch (error) {
        console.log(
          "SYNC DEFAULT ITEMS ERROR:",
          error
        );

        throw error;
      }
    })();

  // =================================================
  // RETURN SYNC RESULT
  // =================================================

  try {
    const result =
      await defaultSyncPromise;

    return res.status(200).json(
      result
    );
  } catch (error) {
    return res.status(500).json({
      message:
        "Error syncing default food items",

      error:
        error.message,
    });
  } finally {
    defaultSyncPromise = null;
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  syncDefaultItems,
  searchFoodOnline,
};