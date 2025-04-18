
import { createContext, useContext, useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { cartReducer, API_BASE_URL } from "../utils/cartUtils";
import { useCartOperations } from "../hooks/useCartOperations";

const defaultContextValue = {
  cart: [],
  addToCart: () => console.warn("CartContext not initialized"),
  removeFromCart: () => console.warn("CartContext not initialized"),
  updateQuantity: () => console.warn("CartContext not initialized"),
  clearCart: () => console.warn("CartContext not initialized"),
  cartItemCount: 0,
  cartTotal: 0
};

const CartContext = createContext(defaultContextValue);

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const { currentUser, token, demoMode } = useAuth() || {};
  const [cart, dispatch] = useReducer(cartReducer, []);
  const navigate = useNavigate();

  const {
    syncCartWithServer,
    addToCart: addToCartOperation,
    removeFromCart: removeFromCartOperation,
    updateQuantity: updateQuantityOperation,
    clearCart: clearCartOperation
  } = useCartOperations(currentUser, token, demoMode, navigate);

  // Load cart from server when user authentication changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!currentUser) return;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          dispatch({ type: "INITIALIZE", payload: data.items || [] });
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    if (!currentUser) {
      dispatch({ type: "CLEAR_CART" });
    } else {
      fetchCart();
    }
  }, [currentUser, token]);

  const addToCart = async (product, quantity = 1) => {
    const result = await addToCartOperation(product, quantity);
    if (result) {
      dispatch({ type: "ADD_ITEM", payload: result });
    }
  };

  const removeFromCart = async (productId) => {
    if (await removeFromCartOperation(productId)) {
      dispatch({ type: "REMOVE_ITEM", payload: productId });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
    await updateQuantityOperation(productId, quantity);
  };

  const clearCart = async () => {
    if (await clearCartOperation()) {
      dispatch({ type: "CLEAR_CART" });
    }
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartItemCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

