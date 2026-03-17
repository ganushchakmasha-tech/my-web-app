import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('newbrand_cart')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('newbrand_cart', JSON.stringify(cart));
  }, [cart]);

  function getTierPrice(product, qty) {
    const tiers = [...product.tiers].reverse();
    for (const tier of tiers) {
      if (qty >= tier.qty) return tier.price;
    }
    return product.price;
  }

  function addToCart(product, qty, label = null, variant = null) {
    setCart(prev => {
      const existing = prev.find(i =>
        i.id === product.id && i.label === label && i.variant?.id === variant?.id
      );
      if (existing) {
        const newQty = existing.qty + qty;
        return prev.map(i =>
          i.id === product.id && i.label === label && i.variant?.id === variant?.id
            ? { ...i, qty: newQty, unitPrice: getTierPrice(product, newQty) }
            : i
        );
      }
      return [...prev, { ...product, qty, label, variant, unitPrice: getTierPrice(product, qty) }];
    });
  }

  function updateQty(id, qty, product) {
    if (qty < 1) return removeFromCart(id);
    setCart(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, qty, unitPrice: getTierPrice(product, qty) }
          : i
      )
    );
  }

  function updateLabel(id, label) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, label: label || null } : i));
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const categorySpend = cart.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + i.unitPrice * i.qty;
    return acc;
  }, {});

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, updateLabel, removeFromCart, clearCart, total, itemCount, getTierPrice, categorySpend }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
