import { useState, useCallback } from "react";

interface CartItem {
  id: string;
  packId: string;
  title: string;
  producer: string;
  price: number;
  quantity: number;
  preview_url: string;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = () => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token");
    }
    return false;
  };

  // Get appropriate cart endpoint based on auth status
  const getCartEndpoint = () => {
    return isAuthenticated() ? "/api/cart" : "/api/guest-cart";
  };

  const fetchCart = useCallback(async () => {
    try {
      const headers: any = {};
      if (isAuthenticated()) {
        const token = localStorage.getItem("token");
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const response = await fetch(getCartEndpoint(), { headers });
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      const data = await response.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(
    async (packIdOrPack: string | any, quantity: number = 1) => {
      // Handle both packId string and pack object
      const packId =
        typeof packIdOrPack === "string"
          ? packIdOrPack
          : packIdOrPack.id;
      const packData =
        typeof packIdOrPack === "object" ? packIdOrPack : null;

      console.log("Adding to cart:", { packId, packData, quantity });
      console.log("Is authenticated:", isAuthenticated());

      try {
        const headers: any = { "Content-Type": "application/json" };
        if (isAuthenticated()) {
          const token = localStorage.getItem("token");
          console.log(
            "Using auth token:",
            token ? "token present" : "no token"
          );
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
        }

        console.log("Cart endpoint:", getCartEndpoint());
        console.log("Request headers:", headers);

        const response = await fetch(getCartEndpoint(), {
          method: "POST",
          headers,
          body: JSON.stringify({ packId, quantity }),
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Cart API error:", errorData);
          throw new Error(`Failed to add to cart: ${response.status}`);
        }

        const data = await response.json();
        console.log("Cart API response:", data);

        // Optimistic update - add item immediately to state if we have pack data
        if (packData) {
          setCartItems((prevItems) => {
            // Check if item already exists
            const existingItem = prevItems.find(
              (item) => item.packId === packId
            );
            if (existingItem) {
              // Update quantity if exists
              return prevItems.map((item) =>
                item.packId === packId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              );
            } else {
              // Add new item - create a cart item structure
              const newCartItem = {
                id: `temp-${Date.now()}`, // Temporary ID, will be updated on next fetch
                packId: packId,
                title: packData.title,
                producer: packData.producer,
                price: packData.price,
                quantity: quantity,
                preview_url: packData.preview_url,
              };
              return [...prevItems, newCartItem];
            }
          });
        } else {
          // If no pack data, fall back to fetching cart
          await fetchCart();
        }

        return data;
      } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
      }
    },
    [fetchCart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        return removeItem(itemId);
      }

      try {
        const headers: any = { "Content-Type": "application/json" };
        if (isAuthenticated()) {
          const token = localStorage.getItem("token");
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
        }

        const response = await fetch(getCartEndpoint(), {
          method: "PUT",
          headers,
          body: JSON.stringify({ itemId, quantity }),
        });

        if (!response.ok) {
          throw new Error("Failed to update quantity");
        }

        await fetchCart(); // Refresh cart
      } catch (error) {
        console.error("Error updating quantity:", error);
        throw error;
      }
    },
    [fetchCart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      // Optimistic update - remove item immediately from state
      const itemToRemove = cartItems.find((item) => item.id === itemId);
      if (!itemToRemove) return;

      const originalCartItems = [...cartItems];
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );

      try {
        const headers: any = { "Content-Type": "application/json" };
        if (isAuthenticated()) {
          const token = localStorage.getItem("token");
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
        }

        const response = await fetch(getCartEndpoint(), {
          method: "DELETE",
          headers,
          body: JSON.stringify({ itemId }),
        });

        if (!response.ok) {
          throw new Error("Failed to remove item");
        }

        // Success - the optimistic update was correct
      } catch (error) {
        // Revert the optimistic update on error
        setCartItems(originalCartItems);
        console.error("Error removing item:", error);
        throw error;
      }
    },
    [cartItems]
  );

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const clearCart = useCallback(async () => {
    try {
      // Remove all items one by one
      const promises = cartItems.map((item) => removeItem(item.id));
      await Promise.all(promises);
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }, [cartItems, removeItem]);

  return {
    cartItems,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getCartTotal,
    getItemCount,
    isAuthenticated: isAuthenticated(),
  };
}
