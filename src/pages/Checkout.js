import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import './Checkout.css';

function buildFormatGroups(cartItems) {
  return cartItems.reduce((acc, i) => {
    if (!i.bottleType) return acc;
    const key = `${i.variant?.name ?? 'Standard'} · ${i.bottleType}`;
    if (!acc[key]) acc[key] = { key, totalQty: 0, bottleType: i.bottleType, variantName: i.variant?.name ?? 'Standard' };
    acc[key].totalQty += i.qty;
    return acc;
  }, {});
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user, confirmed } = useAuth();
  const { categoryConfig, LABEL_MIN_QTY } = useProducts();
  const navigate = useNavigate();

  const [skipLabels, setSkipLabels] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    company:      user?.company || '',
    name:         user?.name    || '',
    email:        user?.email   || '',
    street:       '',
    city:         '',
    state:        '',
    zip:          '',
    po:           '',
    paymentTerms: 'Net 30',
    notes:        '',
  });

  // ── Order validation (mirrors Cart logic) ──────────────────────
  const groups = cart.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const unmetCategories = Object.entries(groups).filter(([cat, items]) => {
    const config = categoryConfig[cat];
    if (!config) return false;
    const spend = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    return spend < config.minAmount;
  });

  const formatGroupsMap = buildFormatGroups(cart);
  const unmetFormatGroups = Object.values(formatGroupsMap).filter(g => g.totalQty < LABEL_MIN_QTY);
  const unlabelledItems = cart.filter(i => !i.label);

  const canOrder =
    unmetCategories.length === 0 &&
    unmetFormatGroups.length === 0 &&
    (skipLabels || unlabelledItems.length === 0);

  // ── Handlers ───────────────────────────────────────────────────
  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!canOrder || submitting) return;
    setSubmitting(true);
    const num = 'ORD-' + (Math.floor(Math.random() * 9000) + 1000);
    setTimeout(() => {
      const order = {
        id: num,
        createdAt: new Date().toISOString(),
        status: 'pending',
        customer: { company: form.company, name: form.name, email: form.email },
        shipping: { street: form.street, city: form.city, state: form.state, zip: form.zip },
        po: form.po,
        paymentTerms: form.paymentTerms,
        notes: form.notes,
        items: cart.map(i => ({
          id: i.id, name: i.name, variant: i.variant, label: i.label,
          qty: i.qty, unitPrice: i.unitPrice, category: i.category,
        })),
        subtotal: total,
      };
      try {
        const existing = JSON.parse(localStorage.getItem('newbrand_orders') || '[]');
        localStorage.setItem('newbrand_orders', JSON.stringify([order, ...existing]));
      } catch (_) {}
      setOrderNumber(num);
      clearCart();
      setOrderPlaced(true);
      setSubmitting(false);
    }, 600);
  }

  // ── Guards ─────────────────────────────────────────────────────
  if (!confirmed) {
    return (
      <div className="checkout-page">
        <div className="container checkout-guard">
          <p>Please <Link to="/account">sign in</Link> to proceed to checkout.</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="container checkout-guard">
          <p>Your cart is empty. <Link to="/products">Browse the catalogue</Link></p>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="container checkout-success">
          <div className="checkout-success-icon">✓</div>
          <h1>Order Placed</h1>
          <p className="checkout-success-ref">Reference <strong>{orderNumber}</strong></p>
          <p className="checkout-success-note">
            Your account manager will confirm and send a proforma invoice within one business day.
          </p>
          <div className="checkout-success-detail">
            <div><span>Company</span><strong>{form.company}</strong></div>
            <div><span>Ship to</span><strong>{form.street}, {form.city}, {form.state} {form.zip}</strong></div>
            {form.po && <div><span>PO Number</span><strong>{form.po}</strong></div>}
            <div><span>Payment</span><strong>{form.paymentTerms}</strong></div>
          </div>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  // ── Checkout form ──────────────────────────────────────────────
  return (
    <div className="checkout-page">
      <div className="container">
        <Link to="/cart" className="checkout-back">← Back to cart</Link>

        <div className="checkout-layout">

          {/* ── LEFT: form ── */}
          <form id="checkout-form" className="checkout-form" onSubmit={handleSubmit} noValidate>

            <section className="co-section">
              <h2>Contact</h2>
              <div className="co-row-2">
                <div className="co-field">
                  <label>Company *</label>
                  <input name="company" required value={form.company} onChange={handleChange} placeholder="Acme Corp" />
                </div>
                <div className="co-field">
                  <label>Contact Name *</label>
                  <input name="name" required value={form.name} onChange={handleChange} placeholder="Jane Smith" />
                </div>
              </div>
              <div className="co-field">
                <label>Business Email *</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="jane@acme.com" />
              </div>
            </section>

            <section className="co-section">
              <h2>Shipping Address</h2>
              <div className="co-field">
                <label>Street Address *</label>
                <input name="street" required value={form.street} onChange={handleChange} placeholder="123 Main St" />
              </div>
              <div className="co-row-3">
                <div className="co-field co-field--grow">
                  <label>City *</label>
                  <input name="city" required value={form.city} onChange={handleChange} placeholder="New York" />
                </div>
                <div className="co-field co-field--state">
                  <label>State *</label>
                  <select name="state" required value={form.state} onChange={handleChange}>
                    <option value="">—</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="co-field co-field--zip">
                  <label>ZIP *</label>
                  <input name="zip" required value={form.zip} onChange={handleChange} placeholder="10001" maxLength={10} />
                </div>
              </div>
            </section>

            <section className="co-section">
              <h2>Order Details</h2>
              <div className="co-row-2">
                <div className="co-field">
                  <label>PO Number <span className="co-optional">(optional)</span></label>
                  <input name="po" value={form.po} onChange={handleChange} placeholder="PO-12345" />
                </div>
                <div className="co-field">
                  <label>Payment Terms</label>
                  <select name="paymentTerms" value={form.paymentTerms} onChange={handleChange}>
                    <option>Net 30</option>
                    <option>Net 60</option>
                    <option>Prepay</option>
                  </select>
                </div>
              </div>
              <div className="co-field">
                <label>Notes <span className="co-optional">(optional)</span></label>
                <textarea
                  name="notes"
                  rows={3}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Special delivery instructions, label artwork notes, etc."
                />
              </div>
            </section>

            <section className="co-section co-section--dev">
              <div className="co-dev-header">
                <span className="co-dev-badge">DEV</span>
                <span>Testing options</span>
              </div>
              <label className="co-checkbox">
                <input
                  type="checkbox"
                  checked={skipLabels}
                  onChange={e => setSkipLabels(e.target.checked)}
                />
                <span>Skip label requirement <em>(allows ordering without brand labels assigned)</em></span>
              </label>
            </section>

          </form>

          {/* ── RIGHT: summary ── */}
          <div className="checkout-summary">
            <h3>Order Summary</h3>

            <div className="co-summary-items">
              {cart.map(item => (
                <div className="co-summary-line" key={item.id}>
                  <div className="co-summary-line-info">
                    <span className="co-summary-name">{item.name}</span>
                    {item.variant && <span className="co-summary-variant">{item.variant.name}</span>}
                    {item.label && <span className="co-summary-label">{item.label}</span>}
                  </div>
                  <div className="co-summary-line-right">
                    <span className="co-summary-qty">×{item.qty.toLocaleString()}</span>
                    <span className="co-summary-price">${(item.unitPrice * item.qty).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="co-summary-total">
              <span>Subtotal</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <p className="co-summary-note">Shipping and applicable taxes invoiced separately.</p>

            <div className="co-requirements">
              <p className="co-requirements-title">Order requirements</p>
              <ul>
                {/* Category minimums */}
                {Object.entries(groups).map(([cat, items]) => {
                  const config = categoryConfig[cat];
                  if (!config) return null;
                  const spend = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
                  const met = spend >= config.minAmount;
                  const short = (config.minAmount - spend).toFixed(2);
                  return (
                    <li key={cat} className={met ? 'req-met' : 'req-unmet'}>
                      <span className="req-icon">{met ? '✓' : '✗'}</span>
                      <span>
                        {cat} minimum
                        {met ? ` — $${spend.toFixed(0)} ✓` : ` — $${short} short of $${config.minAmount.toLocaleString()}`}
                      </span>
                    </li>
                  );
                })}

                {/* Label print run per format group */}
                {Object.values(formatGroupsMap).map(g => {
                  const met = g.totalQty >= LABEL_MIN_QTY;
                  const need = LABEL_MIN_QTY - g.totalQty;
                  return (
                    <li key={g.key} className={met ? 'req-met' : 'req-unmet'}>
                      <span className="req-icon">{met ? '✓' : '✗'}</span>
                      <span>
                        Label printing · {g.variantName} {g.bottleType}
                        {met ? ` — ${g.totalQty} units ✓` : ` — ${need} more unit${need !== 1 ? 's' : ''} needed`}
                      </span>
                    </li>
                  );
                })}

                {/* Brand labels */}
                {(() => {
                  const met = skipLabels || unlabelledItems.length === 0;
                  return (
                    <li className={met ? 'req-met' : 'req-unmet'}>
                      <span className="req-icon">{met ? '✓' : '✗'}</span>
                      <span>
                        Brand labels
                        {met
                          ? ' — all items labelled ✓'
                          : <> — {unlabelledItems.length} item{unlabelledItems.length !== 1 ? 's' : ''} missing · <Link to="/cart">fix in cart</Link></>}
                      </span>
                    </li>
                  );
                })()}
              </ul>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="co-btn-place"
              disabled={!canOrder || submitting}
            >
              {submitting ? 'Placing Order…' : 'Place Order'}
            </button>
            <Link to="/cart" className="co-btn-back">← Edit Cart</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
