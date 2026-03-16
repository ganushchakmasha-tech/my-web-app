import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import './Cart.css';

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart, total } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);

  function handlePlaceOrder() {
    clearCart();
    setOrderPlaced(true);
  }

  if (orderPlaced) {
    return (
      <div className="cart-page">
        <div className="container order-success">
          <div className="success-icon">✓</div>
          <h2>Order Submitted</h2>
          <p>Your account manager will confirm your order within one business day.</p>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container empty-cart">
          <div className="empty-icon">◯</div>
          <h2>Your basket is empty</h2>
          <p>Browse the catalogue to add products to your order.</p>
          <Link to="/products" className="btn-primary">View Catalogue</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Your Basket</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.map(item => {
              const product = products.find(p => p.id === item.id);
              return (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-info">
                    <span className="cart-item-sku">{item.sku}</span>
                    <h3>{item.name}</h3>
                    <p className="cart-item-price">€{item.unitPrice.toFixed(2)} / unit</p>
                  </div>
                  <div className="cart-item-qty">
                    <label>Qty</label>
                    <input
                      type="number"
                      min={item.minOrder}
                      value={item.qty}
                      onChange={e => updateQty(item.id, parseInt(e.target.value) || item.minOrder, product)}
                    />
                    <span className="cart-item-unit">units</span>
                  </div>
                  <div className="cart-item-total">
                    €{(item.unitPrice * item.qty).toFixed(2)}
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            {cart.map(item => (
              <div className="summary-line" key={item.id}>
                <span>{item.name} × {item.qty.toLocaleString()}</span>
                <span>€{(item.unitPrice * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-total">
              <span>Subtotal</span>
              <strong>€{total.toFixed(2)}</strong>
            </div>
            <p className="summary-note">Shipping and applicable taxes calculated at checkout. Net 30 terms available for qualified accounts.</p>
            <button className="btn-order" onClick={handlePlaceOrder}>Place Order</button>
            <Link to="/quote" className="btn-quote-alt">Request Formal Quote</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
