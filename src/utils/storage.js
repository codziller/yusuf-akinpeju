/* eslint-disable no-param-reassign */
const TOKEN = "bhtkn";
export const USER_DATA = "bhud";
const UNREGISTERED_USER_DATA = "bhuud";
const FORGOT_PASSWORD_DATA = "bhfpd";
const TRACK_MY_ORDER_DATA = "bhtmod";
export const ACCOUNT_CREATED = "ADMIN_ACCOUNT_CREATED";
export const BUSINESS_CUSTOMER_REFS = "yusuf-cr";
export const BASKET = "bhublocal";
export const FAVORITES = "bhfave";
export const ADDRESSES = "bhadd";

export const saveToken = (token) => {
  try {
    localStorage.setItem(TOKEN, token);
  } catch (e) {
    return e;
  }
};

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN);
  } catch (e) {
    return e;
  }
};

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    return e;
  }
};

export const getFromStorage = (key) => {
  try {
    localStorage.getItem(key);
  } catch (e) {
    return e;
  }
};

export const saveUserInfoToStorage = (payload) => {
  try {
    if (payload.token) {
      delete payload.token;
    }
    localStorage.setItem(USER_DATA, JSON.stringify(payload));
    return payload;
  } catch (e) {
    return e;
  }
};

export const getLocalBasket = () => {
  try {
    return JSON.parse(localStorage.getItem(BASKET));
  } catch (error) {
    return error;
  }
};

export const getLocalFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES));
  } catch (error) {
    return error;
  }
};

export const getLocalAddresses = () => {
  try {
    return JSON.parse(localStorage.getItem(ADDRESSES));
  } catch (error) {
    return error;
  }
};

export const getUserInfoFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_DATA));
  } catch (error) {
    return error;
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (e) {
    return e;
  }
};

export const saveAccountCreation = (payload) => {
  try {
    localStorage.setItem(UNREGISTERED_USER_DATA, JSON.stringify(payload));
    return payload;
  } catch (e) {
    return e;
  }
};

export const saveForgotPasswordEmail = (payload) => {
  try {
    localStorage.setItem(FORGOT_PASSWORD_DATA, JSON.stringify(payload));
    return payload;
  } catch (e) {
    return e;
  }
};

export const saveTrackMyOrderEmail = (payload) => {
  try {
    localStorage.setItem(TRACK_MY_ORDER_DATA, JSON.stringify(payload));
    return payload;
  } catch (e) {
    return e;
  }
};

export const getAccountCreation = () => {
  try {
    return JSON.parse(localStorage.getItem(UNREGISTERED_USER_DATA)) || {};
  } catch (error) {
    return error;
  }
};

export const getForgotPasswordEmail = () => {
  try {
    return JSON.parse(localStorage.getItem(FORGOT_PASSWORD_DATA)) || {};
  } catch (error) {
    return error;
  }
};

export const getTrackMyOrderEmail = () => {
  try {
    return JSON.parse(localStorage.getItem(TRACK_MY_ORDER_DATA)) || {};
  } catch (error) {
    return error;
  }
};

export const clearAccountCreation = () => {
  try {
    localStorage.removeItem(UNREGISTERED_USER_DATA);
  } catch (e) {
    return e;
  }
};

export const clearUserDetails = () => {
  try {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USER_DATA);
  } catch (e) {
    return e;
  }
};
