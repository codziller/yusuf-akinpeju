import { warningToast } from "components/general/toast/toast";
import ProductsStore from "stores/products";

// Helper functions for new product structure
const getActivePrice = (product) => {
  return product?.prices?.find(price => price?.isActive) || {};
};

const getSalePrice = (product) => {
  const activePrice = getActivePrice(product);
  return activePrice?.salePrice || product?.salePrice || 0;
};

const getQuantityLeft = (product) => {
  const activePrice = getActivePrice(product);
  return activePrice?.quantityLeft || 0;
};

/**
 * Centralized addToBasket function for consistent product adding across the app
 * @param {Object} options - Options object
 * @param {Object} options.product - Main product object
 * @param {Object} options.selectedVariant - Selected variant (if any)
 * @param {number} options.quantity - Quantity to add
 * @param {Object} options.selectedProductSubscription - Selected subscription (if any)
 * @param {boolean} options.enableSubscription - Whether subscription is enabled
 * @param {boolean} options.userIsAdmin - Whether user is admin
 * @param {Object} options.commonStore - CommonStore instance
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {void}
 */
export const addToBasket = ({
  product,
  selectedVariant = null,
  quantity = 1,
  selectedProductSubscription = null,
  enableSubscription = false,
  userIsAdmin = false,
  commonStore,
  onSuccess,
  onError
}) => {
  const currentProduct = selectedVariant || product;
  const productQuantity = getQuantityLeft(currentProduct);
  
  // Check quantity constraints
  if (quantity > productQuantity && !userIsAdmin) {
    warningToast("You cannot add the selected quantity of this item");
    if (onError) onError();
    return;
  }

  // Check if product is out of stock
  if (productQuantity <= 0 && !userIsAdmin) {
    warningToast("This product is out of stock");
    if (onError) onError();
    return;
  }

  // Get fresh product data
  ProductsStore.getProductConfirmation({
    data: { id: currentProduct?.id },
    onSuccess: (res) => {
      const newBasketItem = {
        quantity,
        id: currentProduct?.id,
        brand: product?.brand?.brandName,
        brandId: product?.brand?.id,
        name: currentProduct?.name,
        image: currentProduct?.imageUrls?.[0] || product?.imageUrls?.[0],
        price: res?.currentSalePrice || getSalePrice(currentProduct),
        discountPrice: currentProduct?.discountPrice,
        discountValue: currentProduct?.discountValue,
        selectedVariant: selectedVariant ? {
          id: selectedVariant?.id,
          name: selectedVariant?.name,
          variantName: selectedVariant?.variantName
        } : null,
        selectedProductSubscription: enableSubscription
          ? selectedProductSubscription
          : "",
      };

      commonStore?.updateLocalBasket(newBasketItem);
      
      if (onSuccess) {
        onSuccess(newBasketItem);
      }
    },
    onError: () => {
      warningToast("Failed to add product to basket");
      if (onError) onError();
    }
  });
};

/**
 * Get product quantity left using new price structure
 * @param {Object} product - Product object
 * @returns {number} Quantity left
 */
export { getQuantityLeft };

/**
 * Get product sale price using new price structure
 * @param {Object} product - Product object
 * @returns {number} Sale price
 */
export { getSalePrice };

/**
 * Get active price object from product
 * @param {Object} product - Product object
 * @returns {Object} Active price object
 */
export { getActivePrice };