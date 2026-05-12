import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('part_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('part_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (part, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === part.id);
      if (existing) {
        return prev.map(item => 
          item.id === part.id 
          ? { ...item, quantity: Math.min(item.quantity + quantity, part.stockQuantity) } 
          : item
        );
      }
      return [...prev, { ...part, quantity: Math.min(quantity, part.stockQuantity) }];
    });
  };

  const removeFromCart = (partId) => {
    setCart(prev => prev.filter(item => item.id !== partId));
  };

  const updateQuantity = (partId, quantity) => {
    setCart(prev => prev.map(item => 
      item.id === partId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      subtotal, 
      itemCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};
