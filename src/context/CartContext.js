import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  function getTierPrice(product, qty) {
    const tiers = [...product.tiers].reverse();
    for (const tier of tiers) {
      if (qty >= tier.qty) return tier.price;
    }
    return product.price;
  }

  function addToCart(product, qty) {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        const newQty = existing.qty + qty;
        return prev.map(i =>
          i.id === product.id
            ? { ...i, qty: newQty, unitPrice: getTierPrice(product, newQty) }
            : i
        );
      }
      return [...prev, { ...product, qty, unitPrice: getTierPrice(product, qty) }];
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

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  const total = cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeFromCart, clearCart, total, itemCount, getTierPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
