import { createContext, useContext, useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

// Define a default context value with empty functions to prevent null errors
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

// Define the API base URL
const API_BASE_URL = "/api";

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return action.payload;
    case "ADD_ITEM":
      const itemExists = state.find(item => item.product._id === action.payload.product._id);
      if (itemExists) {
        return state.map(item => 
          item.product._id === action.payload.product._id 
            ? { ...item, quantity: item.quantity + action.payload.quantity } 
            : item
        );
      } else {
        return [...state, action.payload];
      }
    case "REMOVE_ITEM":
      return state.filter(item => item.product._id !== action.payload);
    case "UPDATE_QUANTITY":
      return state.map(item => 
        item.product._id === action.payload.productId 
          ? { ...item, quantity: action.payload.quantity } 
          : item
      );
    case "CLEAR_CART":
      return [];
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { currentUser, token, demoMode } = useAuth() || {};
  const [cart, dispatch] = useReducer(cartReducer, []);
  const navigate = useNavigate();

  // Load cart from server when user authentication changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!currentUser) return;
      
      try {
        // Set timeout to prevent long-running requests
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
        } else {
          console.error("Failed to fetch cart:", response.status);
          // If server error, keep existing cart
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        // Keep existing cart on error
      }
    };

    // Clear cart if user logs out
    if (!currentUser) {
      dispatch({ type: "CLEAR_CART" });
    } else {
      fetchCart();
    }
  }, [currentUser, token]);

  // Function to sync cart with server
  const syncCartWithServer = async (updatedCart) => {
    if (!currentUser || demoMode) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch(`${API_BASE_URL}/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: updatedCart }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.error("Error syncing cart with server:", error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!currentUser) {
      toast.error("Please log in to add items to cart", {
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
        },
      });
      return;
    }

    dispatch({ type: "ADD_ITEM", payload: { product, quantity } });
    
    try {
      if (demoMode) {
        // In demo mode, just show a success message without API call
        toast.success(`${product.name} added to cart (Demo Mode)`);
        return;
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        toast.success(`${product.name} added to cart (Demo Mode)`);
      }, 5000);
      
      await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id, quantity }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Still show success since we've updated the local cart
      toast.success(`${product.name} added to cart (Offline Mode)`);
    }
  };

  const removeFromCart = async (productId) => {
    if (!currentUser) {
      toast.error("Please log in to manage your cart");
      return;
    }

    dispatch({ type: "REMOVE_ITEM", payload: productId });
    
    try {
      await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item from cart");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
    
    if (currentUser) {
      try {
        await fetch(`${API_BASE_URL}/cart/update/${productId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        });
      } catch (error) {
        console.error("Error updating cart:", error);
        toast.error("Failed to update cart");
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: "CLEAR_CART" });
    
    if (currentUser) {
      try {
        await fetch(`${API_BASE_URL}/cart/clear`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Cart cleared");
      } catch (error) {
        console.error("Error clearing cart:", error);
        toast.error("Failed to clear cart");
      }
    } else {
      toast.success("Cart cleared");
    }
  };

  // Calculate total number of items and price
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
