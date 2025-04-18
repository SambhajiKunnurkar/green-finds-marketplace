
import { toast } from "sonner";
import { API_BASE_URL, CartItem } from "../utils/cartUtils";

export const useCartOperations = (
  currentUser: any,
  token: string,
  demoMode: boolean,
  navigate: (path: string) => void
) => {
  const syncCartWithServer = async (updatedCart: CartItem[]) => {
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

  const addToCart = async (product: any, quantity = 1) => {
    if (!currentUser) {
      toast.error("Please log in to add items to cart", {
        action: {
          label: "Login",
          onClick: () => navigate("/login"),
        },
      });
      return null;
    }

    try {
      if (demoMode) {
        toast.success(`${product.name} added to cart (Demo Mode)`);
        return { product, quantity };
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
      return { product, quantity };
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.success(`${product.name} added to cart (Offline Mode)`);
      return { product, quantity };
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!currentUser) {
      toast.error("Please log in to manage your cart");
      return false;
    }

    try {
      await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Item removed from cart");
      return true;
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item from cart");
      return false;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!currentUser) return false;

    try {
      await fetch(`${API_BASE_URL}/cart/update/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      return true;
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
      return false;
    }
  };

  const clearCart = async () => {
    try {
      if (currentUser) {
        await fetch(`${API_BASE_URL}/cart/clear`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      toast.success("Cart cleared");
      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
      return true; // Still return true to clear local cart
    }
  };

  return {
    syncCartWithServer,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
};

