import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (product, variant) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.productId === product._id && item.variantId === variant._id
      );

      if (existing) {
        return prev.map((item) =>
          item.productId === product._id && item.variantId === variant._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product._id,
          variantId: variant._id,
          title: product.title,
          sku: variant.sku,
          variantLabel: `${variant.size || "-"} / ${variant.color || "-"}`,
          price: Number(variant.price) || 0,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQty = (productId, variantId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (productId, variantId) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId, variantId) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      subtotal,
      totalQuantity,
      addToCart,
      increaseQty,
      decreaseQty,
      removeItem,
      clearCart,
    }),
    [items, subtotal, totalQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}