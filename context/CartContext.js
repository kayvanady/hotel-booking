"use client";

import { createContext, useContext, useEffect, useState } from "react";

const cartContext = createContext();

export default function CartProvider({ children }) {
  const [roomCart, setRoomCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("roomCart");

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setRoomCart(
            parsed.map((item) => {
              if (item.totalPrice != null) return item;

              const pricePerNight = Number(item.pricePerNight);
              const nights = Number(item.nights);

              if (!Number.isFinite(pricePerNight) || !Number.isFinite(nights)) {
                return item;
              }

              return { ...item, totalPrice: pricePerNight * nights };
            }),
          );
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      localStorage.removeItem("roomCart");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem("roomCart", JSON.stringify(roomCart));
  }, [roomCart, isLoaded]);

  const addToCart = (booking) => {
    const exists = roomCart.some(
      (item) =>
        item.roomId === booking.roomId &&
        item.checkIn === booking.checkIn &&
        item.checkOut === booking.checkOut,
    );

    if (exists) {
      return false;
    }

    const cartItem = {
      ...booking,
      cartItemId: crypto.randomUUID(),
    };

    setRoomCart((prev) => [...prev, cartItem]);

    return true;
  };

  const removeCart = (cartItemId) => {
    setRoomCart((prev) =>
      prev.filter((item) => item.cartItemId !== cartItemId),
    );
  };

  const clearCart = () => {
    setRoomCart([]);
  };

  const inCart = (roomId, checkIn, checkOut) => {
    return roomCart.some(
      (item) =>
        item.roomId === roomId &&
        item.checkIn === checkIn &&
        item.checkOut === checkOut,
    );
  };

  const totalPrice = roomCart.reduce(
    (sum, item) => sum + (Number(item.totalPrice) || 0),
    0,
  );

  return (
    <cartContext.Provider
      value={{
        addToCart,
        removeCart,
        clearCart,
        inCart,
        totalPrice,
        roomCart,
        isLoaded,
      }}
    >
      {children}
    </cartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(cartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
