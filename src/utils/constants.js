import moment from "moment";
import { getUserInfoFromStorage } from "./storage";
let IS_DEV;
if (typeof window !== "undefined") {
  IS_DEV = [
    "testflight.getbani.com",
    "localhost",
    "playground.bani.africa",
  ].includes(window?.location?.hostname);
}
export { IS_DEV };
export const pageCount = 60;
// export const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
export const MAINTENANCE_MODE = false;
const user = getUserInfoFromStorage();
export const IS_ADMIN = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
export const STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
].map((item) => {
  return { label: item, value: item };
});

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((item, i) => {
  return { label: item, value: i + 1 };
});
export const GENDERS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Non-binary", value: "NON_BINARY" },
  { label: "Prefer not to say", value: "UNSPECIFIED" },
];
export const SURVEY_QUESTIONS = [
  {
    question: "What is your skin type?",
    options: [
      { label: "This is an option", value: "1" },
      { label: "This is an option", value: "2" },
      { label: "This is an option", value: "3" },
    ],
  },
  {
    question: "What is your hair type?",
    options: [
      { label: "This is an option", value: "4" },
      { label: "This is an option", value: "5" },
      { label: "This is an option", value: "6" },
    ],
  },
  {
    question: "What is your eye color?",
    options: [
      { label: "This is an option", value: "7" },
      { label: "This is an option", value: "8" },
      { label: "This is an option", value: "9" },
    ],
  },
];

export const blogs = [
  {
    title: "The best gifts for a friend in summer",
    author: "Jane Isiah",
    date: new Date(),
    body: "Great Summer gifts for that one friend this summer. ",
    images: ["/images/laroch.jpeg"],
  },
  {
    title: "The best gifts for a friend in summer",
    author: "Jane Isiah",
    date: new Date(),
    body: "Great Summer gifts for that one friend this summer. ",
    images: ["/images/blog-img-2.jpeg"],
  },
  {
    title: "The best gifts for a friend in summer",
    author: "Jane Isiah",
    date: new Date(),
    body: "Great Summer gifts for that one friend this summer. ",
    images: ["/images/blog-image-3.jpeg"],
  },
  {
    title: "The best gifts for a friend in summer",
    author: "Jane Isiah",
    date: new Date(),
    body: "Great Summer gifts for that one friend this summer. ",
    images: ["/images/blog-img-4.jpeg"],
  },
].map((item, i) => {
  return { id: i + 1, ...item };
});
export const products = [].map((item, i) => {
  return { id: i + 1, ...item };
});
export const brandProducts = [].map((item, i) => {
  return { id: i + 1, ...item };
});

export const skincareCategories = [
  { name: "Moisturisers", image: "/images/moisturizer.jpeg" },
  { name: "Toner", image: "/images/toner.jpeg" },
  { name: "Moisturizers", image: "/images/moisturizer-2.jpeg" },
  { name: "Face + Body", image: "/images/face-body.jpeg" },
].map((item, i) => {
  return { id: i + 1, ...item };
});
export const reviews = [
  {
    title: "Great Product",
    body: "Used this on vacation and I absolutely loved it.",
    date: moment().subtract(1, "day"),
    rating: 4,
    user: "Janet Ashley",
  },
  {
    title: "Great Product",
    body: "Used this on vacation and I absolutely loved it.",
    date: moment().subtract(1, "day"),
    rating: 4,
    user: "Janet Ashley",
  },
  {
    title: "Great Product",
    body: "Used this on vacation and I absolutely loved it.",
    date: moment().subtract(1, "day"),
    rating: 4,
    user: "Janet Ashley",
  },
].map((item, i) => {
  return { id: i + 1, ...item };
});

export const categories = [
  {
    name: "Product Type",
    sub_categories: [
      { name: "Serums" },
      { name: "Cleansers" },
      { name: "Toners" },
      { name: "Masks and Patched" },
      { name: "Augustinus Bader (4)" },
      { name: "Serums" },
      { name: "Cleansers" },
      { name: "Toners" },
      { name: "Masks and Patched" },
      { name: "Augustinus Bader (4)" },
    ],
  },
  {
    name: "Skin Type",
    sub_categories: [
      { name: "Dehydration" },
      { name: "Dark Circles & Puffiness" },
      { name: "Dullness" },
      { name: "Pigmentation" },
      { name: "Lack of Firmness" },
      { name: "Dehydration" },
      { name: "Dark Circles & Puffiness" },
      { name: "Dullness" },
      { name: "Pigmentation" },
      { name: "Lack of Firmness" },
    ],
  },
  {
    name: "Skin Color",
    sub_categories: [
      { name: "Dehydration" },
      { name: "Dark Circles & Puffiness" },
      { name: "Dullness" },
      { name: "Pigmentation" },
      { name: "Lack of Firmness" },
      { name: "Dehydration" },
      { name: "Dark Circles & Puffiness" },
      { name: "Dullness" },
      { name: "Pigmentation" },
      { name: "Lack of Firmness" },
    ],
  },
].map((item, i) => {
  return { id: i + 1, ...item };
});

export const DISCOUNT_TYPES = {
  BUY_X_GET_X_FREE: "BUY_X_GET_X_FREE",
  BUY_X_GET_Y_FREE: "BUY_X_GET_Y_FREE",
  FIXED: "FIXED",
  FREE_SHIPPING: "FREE_SHIPPING",
  PERCENTAGE: "PERCENTAGE",
};
export const NAIRA = "₦‎";

export const CHECKOUT_MODAL_TYPES = {
  ADDRESS: "ADDRESS",
  MESSAGES: "MESSAGES",
  AVAILABILITY: "MESSAGES",
};

export const PAYMENT_METHODS = {
  BANI: "BANI",
  CARD: "CARD",
  WALLET: "WALLET",
  ZILLA: "ZILLA",
};
export const DELIVERY_METHODS = {
  INSTANT: "INSTANT",
  STANDARD: "STANDARD",
  PICKUP: "PICKUP",
};

export const MEDIA_PAGE_TYPES = { BRAND: "BRAND", PRODUCT: "PRODUCT" };

export const LOGIN_SUCCESS_ACTIONS = {
  CHECK_OUT: "CHECK_OUT",
  NOTIFY_BACK_IN_STOCK: "NOTIFY_BACK_IN_STOCK",
  REVIEW_PRODUCT: "REVIEW_PRODUCT",
};

export const ADDRESS_TYPES = { HOME: "Home", WORK: "Work", OTHER: "Other" };

export const ORDER_SOURCE_OPTIONS = [
  { label: "App", value: "APP" },
  { label: "Facebook", value: "FACEBOOK" },
  { label: "Instagram", value: "INSTAGRAM" },
  { label: "Store", value: "STORE" },
  { label: "Web", value: "WEB" },
  { label: "Whatsapp", value: "WHATSAPP" },
];

export const STORE_PAYMENT_METHOD_OPTIONS = [
  { label: "MoniePoint POS", value: "MONIEPOINT_POS" },
  { label: "MoniePoint Transfer", value: "MONIEPOINT_TRANSFER" },
  { label: "Providus Transfer", value: "PROVIDUS_TRANSFER" },
  { label: "Providus POS", value: "PROVIDUS_POS" },
];

export const guestUserData = {
  user: {
    firstName: "guest",
    lastName: "guest",
    phoneNumber: "07012345678",
    email: process.env.NEXT_PUBLIC_GUEST_EMAIL,
    role: "GUEST",
    user_role: "GUEST_USER",
    gender: "MALE",
    isAffiliateMarketer: false,
  },
  accessToken: process.env.NEXT_PUBLIC_GUEST_TOKEN,
};
export const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const ALL_ROLES = {
  CUSTOMER: "CUSTOMER",
  GENERAL_ADMIN: "GENERAL_ADMIN",
  GENERAL_STAFF: "GENERAL_STAFF",
  BRAND_STAFF: "BRAND_STAFF",
  GUEST: "GUEST",
  WAREHOUSE_ADMIN: "WAREHOUSE_ADMIN",
  WAREHOUSE_STAFF: "WAREHOUSE_STAFF",
  MARKETER: "MARKETER",
  DEVELOPER: "DEVELOPER",
  ALL_BRAND_STAFF: "ALL_BRAND_STAFF",
};
