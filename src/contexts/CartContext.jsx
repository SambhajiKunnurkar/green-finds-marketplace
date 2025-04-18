import { createContext, useContext, useReducer, useEffect, useNavigate } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

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
  const { currentUser, token } = useAuth();
  const [cart, dispatch] = useReducer(cartReducer, []);
  const navigate = useNavigate();

  // Load cart from server when user authentication changes
  useEffect(() => {
    const fetchCart = async () => {
      if (currentUser) {
        try {
          const response = await fetch("http://localhost:5000/api/cart", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            dispatch({ type: "INITIALIZE", payload: data.items });
          }
        } catch (error) {
          console.error("Error fetching cart:", error);
          toast.error("Failed to load your cart");
        }
      } else {
        // Clear cart when logged out
        dispatch({ type: "CLEAR_CART" });
      }
    };

    fetchCart();
  }, [currentUser, token]);

  // Sync cart changes with the server
  const syncCartWithServer = async (updatedCart) => {
    if (!currentUser) return;

    try {
      await fetch("http://localhost:5000/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: updatedCart }),
      });
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
      await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id, quantity }),
      });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const removeFromCart = async (productId) => {
    if (!currentUser) {
      toast.error("Please log in to manage your cart");
      return;
    }

    dispatch({ type: "REMOVE_ITEM", payload: productId });
    
    try {
      await fetch(`http://localhost:5000/api/cart/remove/${productId}`, {
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
        await fetch(`http://localhost:5000/api/cart/update/${productId}`, {
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
        await fetch("http://localhost:5000/api/cart/clear", {
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
