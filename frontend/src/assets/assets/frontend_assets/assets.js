// ======================================================
// CLOUDINARY BASE URLS
// ======================================================

const cloudinaryAssetBase =
  "https://res.cloudinary.com/s6chjv3q/image/upload/tomato-food-app/old-assets";

const cloudinaryFoodBase =
  "https://res.cloudinary.com/s6chjv3q/image/upload/tomato-food-app/old-food-images";


// ======================================================
// GENERAL ASSETS - CLOUDINARY
// ======================================================

const basket_icon = `${cloudinaryAssetBase}/basket_icon.png`;
const logo = `${cloudinaryAssetBase}/logo.png`;
const header_img = `${cloudinaryAssetBase}/header_img.png`;
const search_icon = `${cloudinaryAssetBase}/search_icon.png`;

const add_icon_white = `${cloudinaryAssetBase}/add_icon_white.png`;
const add_icon_green = `${cloudinaryAssetBase}/add_icon_green.png`;
const remove_icon_red = `${cloudinaryAssetBase}/remove_icon_red.png`;

const app_store = `${cloudinaryAssetBase}/app_store.png`;
const play_store = `${cloudinaryAssetBase}/play_store.png`;

const linkedin_icon = `${cloudinaryAssetBase}/linkedin_icon.png`;
const facebook_icon = `${cloudinaryAssetBase}/facebook_icon.png`;
const twitter_icon = `${cloudinaryAssetBase}/twitter_icon.png`;

const cross_icon = `${cloudinaryAssetBase}/cross_icon.png`;
const selector_icon = `${cloudinaryAssetBase}/selector_icon.png`;
const rating_starts = `${cloudinaryAssetBase}/rating_starts.png`;

const profile_icon = `${cloudinaryAssetBase}/profile_icon.png`;
const bag_icon = `${cloudinaryAssetBase}/bag_icon.png`;
const logout_icon = `${cloudinaryAssetBase}/logout_icon.png`;
const parcel_icon = `${cloudinaryAssetBase}/parcel_icon.png`;


// ======================================================
// MENU IMAGES - CLOUDINARY
// ======================================================

const menu_1 = `${cloudinaryAssetBase}/menu_1.png`;
const menu_2 = `${cloudinaryAssetBase}/menu_2.png`;
const menu_3 = `${cloudinaryAssetBase}/menu_3.png`;
const menu_4 = `${cloudinaryAssetBase}/menu_4.png`;
const menu_5 = `${cloudinaryAssetBase}/menu_5.png`;
const menu_6 = `${cloudinaryAssetBase}/menu_6.png`;
const menu_7 = `${cloudinaryAssetBase}/menu_7.png`;
const menu_8 = `${cloudinaryAssetBase}/menu_8.png`;
const menu_9 = `${cloudinaryAssetBase}/menu_9.png`;


// ======================================================
// ASSETS
// ======================================================

export const assets = {
  logo,
  basket_icon,
  header_img,
  search_icon,

  rating_starts,

  add_icon_green,
  add_icon_white,
  remove_icon_red,

  app_store,
  play_store,

  linkedin_icon,
  facebook_icon,
  twitter_icon,

  cross_icon,
  selector_icon,

  profile_icon,
  logout_icon,
  bag_icon,
  parcel_icon,
};


// ======================================================
// MENU LIST
// ======================================================

export const menu_list = [
  {
    menu_name: "Salad",
    menu_image: menu_1,
  },

  {
    menu_name: "Rolls",
    menu_image: menu_2,
  },

  {
    menu_name: "Deserts",
    menu_image: menu_3,
  },

  {
    menu_name: "Sandwich",
    menu_image: menu_4,
  },

  {
    menu_name: "Cake",
    menu_image: menu_5,
  },

  {
    menu_name: "Pure Veg",
    menu_image: menu_6,
  },

  {
    menu_name: "Pasta",
    menu_image: menu_7,
  },

  {
    menu_name: "Noodles",
    menu_image: menu_8,
  },

  {
    menu_name: "Non Veg",
    menu_image: menu_9,
  },
];


// ======================================================
// FOOD LIST
// ======================================================

export const food_list = [
  {
    _id: "1",
    name: "Greek salad",
    image: `${cloudinaryFoodBase}/food_1.png`,
    price: 12,
    description:
      "Fresh lettuce, cucumber, tomato and olives tossed with a light dressing.",
    category: "Salad",
  },

  {
    _id: "2",
    name: "Veg salad",
    image: `${cloudinaryFoodBase}/food_2.png`,
    price: 18,
    description:
      "Fresh mixed vegetables prepared with a healthy and refreshing dressing.",
    category: "Salad",
  },

  {
    _id: "3",
    name: "Clover Salad",
    image: `${cloudinaryFoodBase}/food_3.png`,
    price: 16,
    description:
      "A refreshing mix of fresh vegetables with a light and tasty dressing.",
    category: "Salad",
  },

  {
    _id: "4",
    name: "Chicken Salad",
    image: `${cloudinaryFoodBase}/food_4.png`,
    price: 24,
    description:
      "Tender chicken combined with fresh vegetables for a healthy and delicious meal.",
    category: "Salad",
  },

  {
    _id: "5",
    name: "Lasagna Rolls",
    image: `${cloudinaryFoodBase}/food_5.png`,
    price: 14,
    description:
      "Delicious pasta rolls filled with rich and flavorful ingredients.",
    category: "Rolls",
  },

  {
    _id: "6",
    name: "Peri Peri Rolls",
    image: `${cloudinaryFoodBase}/food_6.png`,
    price: 12,
    description:
      "Spicy and flavorful rolls filled with a delicious peri peri filling.",
    category: "Rolls",
  },

  {
    _id: "7",
    name: "Chicken Rolls",
    image: `${cloudinaryFoodBase}/food_7.png`,
    price: 20,
    description:
      "Juicy chicken wrapped in a soft roll with flavorful seasoning.",
    category: "Rolls",
  },

  {
    _id: "8",
    name: "Veg Rolls",
    image: `${cloudinaryFoodBase}/food_8.png`,
    price: 15,
    description:
      "Fresh vegetables wrapped in a soft roll with tasty seasoning.",
    category: "Rolls",
  },

  {
    _id: "9",
    name: "Ripple Ice Cream",
    image: `${cloudinaryFoodBase}/food_9.png`,
    price: 14,
    description:
      "Creamy ice cream with delicious ripple swirls for a rich sweet treat.",
    category: "Deserts",
  },

  {
    _id: "10",
    name: "Fruit Ice Cream",
    image: `${cloudinaryFoodBase}/food_10.png`,
    price: 22,
    description:
      "Smooth creamy ice cream blended with delicious fruity flavors.",
    category: "Deserts",
  },

  {
    _id: "11",
    name: "Jar Ice Cream",
    image: `${cloudinaryFoodBase}/food_11.png`,
    price: 10,
    description:
      "Creamy and indulgent ice cream served with delightful flavors.",
    category: "Deserts",
  },

  {
    _id: "12",
    name: "Vanilla Ice Cream",
    image: `${cloudinaryFoodBase}/food_12.png`,
    price: 12,
    description:
      "Classic creamy vanilla ice cream with a smooth and refreshing taste.",
    category: "Deserts",
  },

  {
    _id: "13",
    name: "Chicken Sandwich",
    image: `${cloudinaryFoodBase}/food_13.png`,
    price: 12,
    description:
      "Tender chicken layered with fresh vegetables and creamy sauce.",
    category: "Sandwich",
  },

  {
    _id: "14",
    name: "Vegan Sandwich",
    image: `${cloudinaryFoodBase}/food_14.png`,
    price: 18,
    description:
      "Fresh vegetables and flavorful plant-based ingredients in soft bread.",
    category: "Sandwich",
  },

  {
    _id: "15",
    name: "Grilled Sandwich",
    image: `${cloudinaryFoodBase}/food_15.png`,
    price: 16,
    description:
      "Crispy grilled bread filled with delicious and flavorful ingredients.",
    category: "Sandwich",
  },

  {
    _id: "16",
    name: "Bread Sandwich",
    image: `${cloudinaryFoodBase}/food_16.png`,
    price: 24,
    description:
      "Soft bread layered with fresh and tasty sandwich fillings.",
    category: "Sandwich",
  },

  {
    _id: "17",
    name: "Cup Cake",
    image: `${cloudinaryFoodBase}/food_17.png`,
    price: 14,
    description:
      "Soft and fluffy cupcake with a delicious sweet flavor.",
    category: "Cake",
  },

  {
    _id: "18",
    name: "Vegan Cake",
    image: `${cloudinaryFoodBase}/food_18.png`,
    price: 12,
    description:
      "Soft and delicious plant-based cake made with wholesome ingredients.",
    category: "Cake",
  },

  {
    _id: "19",
    name: "Butterscotch Cake",
    image: `${cloudinaryFoodBase}/food_19.png`,
    price: 20,
    description:
      "Rich and creamy cake with delicious butterscotch flavor.",
    category: "Cake",
  },

  {
    _id: "20",
    name: "Sliced Cake",
    image: `${cloudinaryFoodBase}/food_20.png`,
    price: 15,
    description:
      "Soft and moist cake slice perfect for a sweet treat.",
    category: "Cake",
  },

  {
    _id: "21",
    name: "Garlic Mushroom",
    image: `${cloudinaryFoodBase}/food_21.png`,
    price: 14,
    description:
      "Juicy mushrooms sautéed with aromatic garlic and flavorful seasoning.",
    category: "Pure Veg",
  },

  {
    _id: "22",
    name: "Fried Cauliflower",
    image: `${cloudinaryFoodBase}/food_22.png`,
    price: 22,
    description:
      "Crispy cauliflower coated with tasty seasoning and fried to perfection.",
    category: "Pure Veg",
  },

  {
    _id: "23",
    name: "Mix Veg Pulao",
    image: `${cloudinaryFoodBase}/food_23.png`,
    price: 10,
    description:
      "Fragrant rice cooked with fresh vegetables and aromatic spices.",
    category: "Pure Veg",
  },

  {
    _id: "24",
    name: "Rice Zucchini",
    image: `${cloudinaryFoodBase}/food_24.png`,
    price: 12,
    description:
      "Flavorful rice combined with fresh zucchini and light seasoning.",
    category: "Pure Veg",
  },

  {
    _id: "25",
    name: "Cheese Pasta",
    image: `${cloudinaryFoodBase}/food_25.png`,
    price: 12,
    description:
      "Creamy pasta tossed with rich cheese for a delicious comfort meal.",
    category: "Pasta",
  },

  {
    _id: "26",
    name: "Tomato Pasta",
    image: `${cloudinaryFoodBase}/food_26.png`,
    price: 18,
    description:
      "Flavorful pasta cooked in a rich and tangy tomato sauce.",
    category: "Pasta",
  },

  {
    _id: "27",
    name: "Creamy Pasta",
    image: `${cloudinaryFoodBase}/food_27.png`,
    price: 16,
    description:
      "Smooth and creamy pasta prepared with a rich and delicious sauce.",
    category: "Pasta",
  },

  {
    _id: "28",
    name: "Chicken Pasta",
    image: `${cloudinaryFoodBase}/food_28.png`,
    price: 24,
    description:
      "Tender chicken tossed with pasta and flavorful creamy sauce.",
    category: "Pasta",
  },

  {
    _id: "29",
    name: "Buttter Noodles",
    image: `${cloudinaryFoodBase}/food_29.png`,
    price: 14,
    description:
      "Delicious noodles tossed with buttery seasoning for a comforting meal.",
    category: "Noodles",
  },

  {
    _id: "30",
    name: "Veg Noodles",
    image: `${cloudinaryFoodBase}/food_30.png`,
    price: 12,
    description:
      "Stir-fried noodles mixed with fresh vegetables and flavorful seasoning.",
    category: "Noodles",
  },

  {
    _id: "31",
    name: "Somen Noodles",
    image: `${cloudinaryFoodBase}/food_31.png`,
    price: 20,
    description:
      "Light and delicate noodles served with refreshing and flavorful seasoning.",
    category: "Noodles",
  },

  {
    _id: "32",
    name: "Cooked Noodles",
    image: `${cloudinaryFoodBase}/food_32.png`,
    price: 15,
    description:
      "Deliciously cooked noodles tossed with flavorful ingredients and seasoning.",
    category: "Noodles",
  },
];