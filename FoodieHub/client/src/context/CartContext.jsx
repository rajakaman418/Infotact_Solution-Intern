import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartRestaurant, setCartRestaurant] = useState(null);
  const [cartType, setCartType] = useState('delivery'); // 'delivery' | 'dine-in' | 'reservation'
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = useCallback((item, restaurant, type = 'delivery') => {
    // Prevent mixing restaurants in cart
    if (cartRestaurant && cartRestaurant._id !== restaurant._id) {
      return {
        success: false,
        message: `Your cart already has items from "${cartRestaurant.name}". Clear cart to add items from "${restaurant.name}"?`,
        conflict: true,
      };
    }

    setCartRestaurant(restaurant);
    setCartType(type);

    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.menuItemId === item._id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItemId === item._id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, {
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image,
        isVeg: item.isVeg,
        specialInstructions: '',
      }];
    });

    return { success: true };
  }, [cartRestaurant]);

  const removeItem = useCallback((menuItemId) => {
    setCartItems((prev) => {
      const updated = prev.filter((ci) => ci.menuItemId !== menuItemId);
      if (updated.length === 0) setCartRestaurant(null);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((menuItemId, quantity) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((ci) => ci.menuItemId === menuItemId ? { ...ci, quantity } : ci)
    );
  }, [removeItem]);

  const updateInstructions = useCallback((menuItemId, specialInstructions) => {
    setCartItems((prev) =>
      prev.map((ci) => ci.menuItemId === menuItemId ? { ...ci, specialInstructions } : ci)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartRestaurant(null);
    setCartType('delivery');
  }, []);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = cartType === 'delivery' ? (cartRestaurant?.deliveryInfo?.deliveryFee || 40) : 0;
  const taxes = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + deliveryFee + taxes;

  return (
    <CartContext.Provider value={{
      cartItems, cartRestaurant, cartType, setCartType,
      isCartOpen, setIsCartOpen,
      addItem, removeItem, updateQuantity, updateInstructions, clearCart,
      itemCount, subtotal, deliveryFee, taxes, total,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
