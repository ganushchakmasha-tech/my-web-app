import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import './Cart.css';

// Returns { "variantName · bottleType": totalQty } across all cart items
function buildFormatGroups(cartItems) {
  return cartItems.reduce((acc, i) => {
    if (!i.bottleType) return acc;
    const key = `${i.variant?.name ?? 'Standard'} · ${i.bottleType}`;
    if (!acc[key]) acc[key] = { key, items: [], totalQty: 0, bottleType: i.bottleType, variantName: i.variant?.name ?? 'Standard' };
    acc[key].items.push(i);
    acc[key].totalQty += i.qty;
    return acc;
  }, {});
}

function CartItemLabel({ item, updateLabel, savedDesigns, loggedIn }) {
  const [editing, setEditing] = useState(!item.label);
  const [draft, setDraft] = useState(item.label || '');

  function save() {
    updateLabel(item.id, draft.trim());
    setEditing(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') { setDraft(item.label || ''); setEditing(false); }
  }

  if (!editing && item.label) {
    return (
      <div className="cart-label-display">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        <span>{item.label}</span>
        <button className="label-edit-btn" onClick={() => { setDraft(item.label); setEditing(true); }}>Edit</button>
      </div>
    );
  }

  return (
    <div className="cart-label-editor">
      {!item.label && <span className="cart-label-required">Brand label required</span>}
      {loggedIn && savedDesigns.length > 0 && (
        <div className="cart-saved-designs">
          {savedDesigns.map(d => (
            <button
              key={d}
              className={`cart-design-chip ${draft === d ? 'active' : ''}`}
              onClick={() => { setDraft(d); updateLabel(item.id, d); setEditing(false); }}
            >
              {d}
            </button>
          ))}
        </div>
      )}
      <div className="cart-label-input-row">
        <input
          type="text"
          className="cart-label-input"
          placeholder="e.g. Glow by Jane"
          maxLength={60}
          value={draft}
          autoFocus={!item.label}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="cart-label-save" onClick={save} disabled={!draft.trim()}>Save</button>
      </div>
      {!loggedIn && (
        <p className="cart-label-signin"><Link to="/account">Sign in</Link> to use saved designs</p>
      )}
      <a
        href="https://label-studio.example.com"
        target="_blank"
        rel="noopener noreferrer"
        className="cart-label-design-link"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        Design custom label
      </a>
    </div>
  );
}

function LabelPrintingPanel({ cart }) {
  const { products, LABEL_MIN_QTY } = useProducts();
  const formatGroupsMap = buildFormatGroups(cart);
  const groups = Object.values(formatGroupsMap);
  if (groups.length === 0) return null;

  const cartProductIds = new Set(cart.map(i => i.id));

  return (
    <div className="label-print-panel">
      <div className="label-print-header">
        <span className="label-print-title">Label Printing — Mix &amp; Match</span>
        <span className="label-print-subtitle">
          {LABEL_MIN_QTY} units of the same bottle format required · combine any products freely
        </span>
      </div>

      {groups.map(group => {
        const met = group.totalQty >= LABEL_MIN_QTY;
        const pct = Math.min(100, (group.totalQty / LABEL_MIN_QTY) * 100);
        const need = LABEL_MIN_QTY - group.totalQty;

        const compatible = products.filter(p =>
          p.bottleType === group.bottleType &&
          !cartProductIds.has(p.id) &&
          p.variants.some(v => v.name === group.variantName)
        );

        return (
          <div key={group.key} className={`label-format-group ${met ? 'label-format-group--met' : ''}`}>
            <div className="label-format-top">
              <div className="label-format-name">
                {met && <span className="label-format-check">✓</span>}
                <strong>{group.variantName}</strong>
                <span className="label-format-type">{group.bottleType}</span>
              </div>
              <span className={`label-format-count ${met ? 'label-format-count--met' : ''}`}>
                {group.totalQty} / {LABEL_MIN_QTY}
              </span>
            </div>

            <div className="label-format-bar-wrap">
              <div className="label-format-bar">
                <div className="label-format-fill" style={{ width: `${pct}%`, background: met ? '#7ab87a' : undefined }} />
              </div>
            </div>

            <div className="label-format-products">
              {group.items.map(i => (
                <span key={i.id} className="label-format-product-chip">
                  {i.name} <em>×{i.qty}</em>
                </span>
              ))}
            </div>

            {!met && compatible.length > 0 && (
              <div className="label-format-suggestions">
                <span className="label-format-suggestions-label">
                  {need} more unit{need !== 1 ? 's' : ''} needed — compatible products:
                </span>
                <div className="label-format-suggestion-list">
                  {compatible.slice(0, 4).map(p => (
                    <Link key={p.id} to={`/products/${p.id}`} className="label-compat-chip">
                      {p.name}
                    </Link>
                  ))}
                  {compatible.length > 4 && (
                    <Link to="/products" className="label-compat-chip label-compat-chip--more">
                      +{compatible.length - 4} more
                    </Link>
                  )}
                </div>
              </div>
            )}

            {!met && compatible.length === 0 && (
              <p className="label-format-no-compat">
                Add {need} more unit{need !== 1 ? 's' : ''} of the same products above to reach the printing minimum.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CategoryGroup({ category, items, updateQty, updateLabel, removeFromCart, savedDesigns, loggedIn, confirmed }) {
  const { categoryConfig } = useProducts();
  const config = categoryConfig[category];
  const spend = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const met = !config || spend >= config.minAmount;
  const pct = config ? Math.min(100, (spend / config.minAmount) * 100) : 100;
  const remaining = config ? config.minAmount - spend : 0;

  return (
    <div className={`category-group ${met ? 'met' : 'unmet'}`}>
      <div className="category-group-header">
        <div className="category-group-title">
          <span className="category-name">{category}</span>
          <span className={`category-status ${met ? 'status-met' : 'status-unmet'}`}>
            {met ? 'Minimum reached' : `$${remaining.toFixed(2)} short`}
          </span>
        </div>
        {config && (
          <div className="category-progress-wrap">
            <div className="category-progress-bar">
              <div className="category-progress-fill" style={{ width: `${pct}%`, background: met ? '#7ab87a' : undefined }} />
            </div>
            <span className="category-progress-label">
              ${spend.toFixed(2)} / ${config.minAmount.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {items.map(item => {
        const step = item.minOrder || 1;
        return (
          <div className={`cart-item ${!item.label ? 'cart-item--unlabelled' : ''}`} key={item.id}>
            <Link to={`/products/${item.id}`} className="cart-item-img-link">
              <img src={item.image} alt={item.name} />
            </Link>
            <div className="cart-item-info">
              <span className="cart-item-sku">{item.sku}</span>
              <Link to={`/products/${item.id}`} className="cart-item-name-link">
                <h3>{item.name}</h3>
              </Link>
              {item.variant && <span className="cart-item-variant">{item.variant.name}</span>}
              {confirmed && <p className="cart-item-price">${item.unitPrice.toFixed(2)} / unit</p>}
              <CartItemLabel
                item={item}
                updateLabel={updateLabel}
                savedDesigns={savedDesigns}
                loggedIn={loggedIn}
              />
            </div>
            <div className="cart-item-qty">
              <label>Qty</label>
              <div className="cart-qty-stepper">
                <button
                  className="cart-qty-btn"
                  onClick={() => updateQty(item.id, Math.max(step, item.qty - step), item)}
                  disabled={item.qty <= step}
                >−</button>
                <input
                  type="number"
                  className="cart-qty-input"
                  min={step}
                  step={step}
                  value={item.qty}
                  onChange={e => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v >= step) updateQty(item.id, Math.round(v / step) * step, item);
                  }}
                />
                <button
                  className="cart-qty-btn"
                  onClick={() => updateQty(item.id, item.qty + step, item)}
                >+</button>
              </div>
              <span className="cart-item-unit">units · min {step}</span>
            </div>
            <div className="cart-item-total">
              {confirmed ? `$${(item.unitPrice * item.qty).toFixed(2)}` : '—'}
            </div>
            <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
          </div>
        );
      })}

    </div>
  );
}

export default function Cart() {
  const { cart, updateQty, updateLabel, removeFromCart, total } = useCart();
  const { loggedIn, confirmed, savedDesigns } = useAuth();
  const { categoryConfig, LABEL_MIN_QTY } = useProducts();
  const navigate = useNavigate();

  const groups = cart.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const unmetCategories = Object.entries(groups).filter(([cat, items]) => {
    const config = categoryConfig[cat];
    if (!config) return false;
    const spend = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
    return spend < config.minAmount;
  });

  const formatGroupsMap = buildFormatGroups(cart);
  const unmetFormatGroups = Object.values(formatGroupsMap).filter(g => g.totalQty < LABEL_MIN_QTY);

  const unlabelledItems = cart.filter(i => !i.label);
  const canOrder = unmetCategories.length === 0 && unmetFormatGroups.length === 0 && unlabelledItems.length === 0;

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container empty-cart">
          <div className="empty-icon">◯</div>
          <h2>Your cart is empty</h2>
          <p>Browse the catalogue to add products to your cart.</p>
          <Link to="/products" className="btn-primary">View Catalogue</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Your Cart</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {Object.entries(groups).map(([category, items]) => (
              <CategoryGroup
                key={category}
                category={category}
                items={items}
                updateQty={updateQty}
                updateLabel={updateLabel}
                removeFromCart={removeFromCart}
                savedDesigns={savedDesigns}
                loggedIn={loggedIn}
                confirmed={confirmed}
              />
            ))}
            <LabelPrintingPanel cart={cart} />
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            {cart.map(item => (
              <div className="summary-line" key={item.id}>
                <span>{item.name} × {item.qty.toLocaleString()}</span>
                <span>{confirmed ? `$${(item.unitPrice * item.qty).toFixed(2)}` : '—'}</span>
              </div>
            ))}
            <div className="summary-total">
              <span>Subtotal</span>
              <strong>{confirmed ? `$${total.toFixed(2)}` : '—'}</strong>
            </div>

            <p className="summary-note">Shipping and taxes calculated at checkout. Net 30 terms available.</p>

            {!canOrder && (
              <div className="order-blockers">
                <p className="order-blockers-title">Before you can place this order:</p>
                <ul>
                  {unlabelledItems.length > 0 && (
                    <li>
                      Add a brand label to {unlabelledItems.length} item{unlabelledItems.length !== 1 ? 's' : ''}
                      {' '}({unlabelledItems.map(i => i.name).join(', ')})
                    </li>
                  )}
                  {unmetFormatGroups.map(g => {
                    const need = LABEL_MIN_QTY - g.totalQty;
                    return (
                      <li key={g.key}>
                        <strong>{g.variantName} {g.bottleType}:</strong> {need.toLocaleString()} more unit{need !== 1 ? 's' : ''} needed for label printing
                      </li>
                    );
                  })}
                  {unmetCategories.map(([cat, items]) => (
                    <li key={cat}>
                      <strong>{cat}:</strong> ${(categoryConfig[cat].minAmount - items.reduce((s, i) => s + i.unitPrice * i.qty, 0)).toFixed(2)} more needed to reach the category minimum
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="btn-order"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
