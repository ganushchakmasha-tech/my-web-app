import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getTierPrice } = useCart();
  const product = products.find(p => p.id === Number(id));

  const [qty, setQty] = useState('');
  const [added, setAdded] = useState(false);

  if (!product) return (
    <div className="not-found">
      <p>Product not found.</p>
      <Link to="/products">← Back to catalogue</Link>
    </div>
  );

  const parsedQty = Math.max(product.minOrder, parseInt(qty) || product.minOrder);
  const unitPrice = getTierPrice(product, parsedQty);
  const lineTotal = unitPrice * parsedQty;

  function handleAdd() {
    addToCart(product, parsedQty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="detail-page">
      <div className="container">
        <Link to="/products" className="back-link">← Catalogue</Link>

        <div className="detail-layout">
          <div className="detail-image">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="detail-info">
            <span className="detail-category">{product.category}</span>
            <h1>{product.name}</h1>
            <span className="detail-sku">SKU {product.sku}</span>
            <p className="detail-desc">{product.description}</p>

            <div className="tier-table">
              <h3>Volume Pricing</h3>
              <table>
                <thead>
                  <tr>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Saving</th>
                  </tr>
                </thead>
                <tbody>
                  {product.tiers.map((tier, i) => {
                    const next = product.tiers[i + 1];
                    const rangeLabel = next
                      ? `${tier.qty.toLocaleString()} – ${(next.qty - 1).toLocaleString()}`
                      : `${tier.qty.toLocaleString()}+`;
                    const saving = i === 0 ? 0 : Math.round((1 - tier.price / product.tiers[0].price) * 100);
                    const isActive = parsedQty >= tier.qty && (!next || parsedQty < next.qty);
                    return (
                      <tr key={tier.qty} className={isActive ? 'active-tier' : ''}>
                        <td>{rangeLabel}</td>
                        <td>€{tier.price.toFixed(2)}</td>
                        <td>{saving > 0 ? <span className="saving-badge">−{saving}%</span> : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="order-box">
              <div className="order-row">
                <label>Quantity (units)</label>
                <div className="qty-input">
                  <input
                    type="number"
                    min={product.minOrder}
                    step={product.minOrder}
                    value={qty}
                    placeholder={product.minOrder.toString()}
                    onChange={e => setQty(e.target.value)}
                  />
                  <span className="moq-hint">Min. {product.minOrder.toLocaleString()}</span>
                </div>
              </div>

              <div className="order-summary">
                <div><span>Unit price</span><span>€{unitPrice.toFixed(2)}</span></div>
                <div className="total-row"><span>Line total</span><strong>€{lineTotal.toFixed(2)}</strong></div>
              </div>

              <div className="order-actions">
                <button className="btn-add" onClick={handleAdd}>
                  {added ? 'Added to Basket' : 'Add to Basket'}
                </button>
                <button className="btn-quote" onClick={() => navigate(`/quote?sku=${product.sku}`)}>
                  Request Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
