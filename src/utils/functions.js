import { warningToast } from "components/general/toast/toast";
import { isEmpty } from "lodash";
import { toJS } from "mobx";
import moment from "moment";

export const hideSideNav = () => {
  document.querySelector(".sidenav")?.classList.add("hidden-sidenav");
};

export const showSideNav = () => {
  document.querySelector(".sidenav")?.classList.remove("hidden-sidenav");
};

export const updateQuantityById = (newItem, array) => {
  // Check if the array contains an object with the same 'id'
  const index = array.findIndex((item) => item.name === newItem.name);

  if (index !== -1) {
    // If a matching object is found, update its 'quantity'
    array[index].quantity += newItem.quantity;
    array[index].price = newItem.price;
    array[index].name = newItem.name;
    array[index].image = newItem.image;
    array[index].selectedProductSubscription =
      newItem.selectedProductSubscription;
  } else {
    // If no matching object is found, push the new object to the array
    array.push(newItem);
  }

  return array;
};

export const sumQuantities = (array = [], field) => {
  return array?.reduce(
    (total, current) => total + parseFloat(current[field]),
    0
  );
};

export const sumPrices = (array = []) => {
  return array?.reduce(
    (total, current) =>
      total +
      parseFloat(
        current?.discountValue ? current?.discountPrice : current?.price
      ) *
        current?.quantity,
    0
  );
};

export const replaceObjectById = (array, idToReplace, newObject) => {
  return array.map((item) => {
    if (item.name === idToReplace) {
      // Replace the object with the matching id
      return newObject;
    }
    return item;
  });
};

export const moveCountryToFirst = (countries) => {
  // Find the index of the entry for Nigeria
  const nigeriaIndex = countries.findIndex(
    (country) => country?.country === "NG" || country.value === "NG"
  );

  // Move the entry for Nigeria to the first position if found
  if (nigeriaIndex !== -1) {
    const nigeriaCountry = countries.splice(nigeriaIndex, 1)[0];
    countries.unshift(nigeriaCountry);
  }

  return countries;
};

export const convertToJs = (obj) => toJS(JSON.parse(JSON.stringify(obj)));

export const flattenCategories = (categories) => {
  const flattened = [];

  function flatten(category) {
    flattened.push({ name: category.name, id: category.id }); // Push the current category's name

    if (category.subCategories && category.subCategories.length > 0) {
      category.subCategories.forEach((subcategory) => {
        flatten(subcategory); // Recursively flatten subCategories
      });
    }
  }

  categories.forEach((category) => {
    flatten(category);
  });

  return flattened;
};

export const handleGetSubCategories = (categories) => {
  let subCategories = [];
  categories?.map((item) => {
    if (!isEmpty(item?.subCategories)) {
      subCategories = [...subCategories, ...item.subCategories];
    }
  });
  return subCategories;
};

export const searchObjectsByCharacter = ({ input, array, key }) => {
  // Convert the search input to lowercase for case-insensitive search
  const searchInput = input?.toLowerCase?.();

  // Use filter() to find objects that match the search criteria
  const matchingObjects = array.filter((obj) => {
    if (obj?.[key]?.toString?.()?.toLowerCase()?.includes(searchInput)) {
      return true; // Return true if a match is found
    }

    return false; // Return false if no match is found for any property
  });

  return matchingObjects;
};

export const mergeSubCategories = (inputArray) =>
  inputArray.flatMap((item) =>
    item.categories.flatMap((category) => {
      const newSubCategories = category?.subCategories?.map((sub) => {
        return { ...sub, headerNavId: item?.id };
      });
      return newSubCategories;
    })
  );

export const mergeBrands = (inputArray) =>
  inputArray.flatMap((item) => item.brands);

// Removed mergeProductChoices - obsolete with new variant structure

export const groupedBrandsByFirstLetter = (brands = []) =>
  brands.reduce((accumulator, currentObject, index) => {
    // Get the first letter of the name field
    const firstLetter = currentObject?.brandName?.[0]?.toUpperCase();

    // Find if the accumulator already has an entry for the first letter
    let entry = accumulator.find((e) => e.title === firstLetter);

    // If there's no entry for the first letter, create one
    if (!entry) {
      entry = { title: firstLetter, items: [], id: index };
      accumulator.push(entry);
    }

    // Push the current object to the items array of the found or new entry
    entry.items.push(currentObject);

    return accumulator;
  }, []);

export const isAddressInLagos = (lat, lng) => {
  // Define the boundaries of Lagos (you'll need to specify the exact coordinates)
  const LAGOS_BOUNDARIES = {
    NORTH: 6.702799,
    SOUTH: 6.389088,
    EAST: 3.421499,
    WEST: 2.886003,
  };

  return (
    lat >= LAGOS_BOUNDARIES.SOUTH &&
    lat <= LAGOS_BOUNDARIES.NORTH &&
    lng >= LAGOS_BOUNDARIES.WEST &&
    lng <= LAGOS_BOUNDARIES.EAST
  );
};

export const updateLikes = (like, prevLikes = []) => {
  const newLikes = prevLikes?.find((item) => item?.id === like?.id)
    ? prevLikes?.filter((item) => item?.id !== like?.id)
    : [...prevLikes, like];

  return newLikes;
};

export const updateAddresses = (address, prevAddresses = []) => {
  const newLikes = prevAddresses?.find((item) => item === address)
    ? prevAddresses?.filter((item) => item !== address)
    : [...prevAddresses, address];

  return newLikes;
};

/**
 * Checks if the current time is between 10 AM and 5 PM, Monday to Saturday.
 * @returns {boolean} - True if within the time range and day, false otherwise.
 */
export const isWithinInstantDeliveryOperatingHours = () => {
  const now = moment();
  const currentHour = now.hour();
  const currentDay = now.day(); // Sunday - Saturday : 0 - 6

  return (
    currentHour >= 10 && currentHour < 17 && currentDay >= 1 && currentDay <= 6
  );
};

// Removed moveOutOfStockProductsBack - now handled by new price structure

// Removed insertAvailableProduct - obsolete with new price array structure

export const handleNativeShare = async ({ title, text, url }) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url,
      });
    } else {
      warningToast("Web Share API is not supported");
    }
  } catch (error) {
    warningToast("Web Share API is not supported");
  }
};
