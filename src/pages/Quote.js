import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Quote.css';

export default function Quote() {
  const [searchParams] = useSearchParams();
  const { cart } = useCart();
  const { user } = useAuth();
  const isSample = searchParams.get('sample') === '1';
  const skuParam = searchParams.get('sku') || '';

  const cartSummary = cart.length > 0
    ? cart.map(i => `${i.sku}${i.variant ? ` (${i.variant.name})` : ''} × ${i.qty.toLocaleString()}`).join('\n')
    : '';

  const defaultMessage = isSample
    ? `I would like to request sample units for the following SKU: ${skuParam}.\n\nPlease advise on sample availability and lead time.`
    : cartSummary
      ? `I would like a formal quote for the following items from my cart:\n\n${cartSummary}\n\nPlease include shipping options and payment terms.`
      : '';

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company: user?.company || '',
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    sku: skuParam,
    qty: '',
    message: defaultMessage,
  });

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="quote-page">
        <div className="container">
          <div className="quote-success">
            <div className="success-icon">✓</div>
            <h2>Quote Request Received</h2>
            <p>Your account manager will send a formal quote to <strong>{form.email}</strong> within 1 business day.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-page">
      <div className="container">
        <div className="quote-layout">
          <div className="quote-intro">
            <h1>{isSample ? 'Request Sample Kit' : 'Request a Quote'}</h1>
            <p>
              {isSample
                ? 'Try before you commit. Request sample units to evaluate quality, texture, and formulation before placing a bulk order.'
                : 'Need bulk pricing, custom quantities, or a formal quotation for procurement? Fill out the form and your dedicated account manager will get back to you within 1 business day.'}
            </p>
            <ul className="quote-benefits">
              <li>✓ Customized volume pricing</li>
              <li>✓ Net 30 / Net 60 payment terms</li>
              <li>✓ Custom packaging & labeling</li>
              <li>✓ Dedicated account management</li>
              <li>✓ Formal PDF quote for procurement</li>
            </ul>

            {cart.length > 0 && !isSample && (
              <div className="quote-cart-summary">
                <span className="quote-cart-label">Items from your cart</span>
                {cart.map(item => (
                  <div key={item.id} className="quote-cart-row">
                    <span className="quote-cart-sku">{item.sku}</span>
                    <span className="quote-cart-name">
                      {item.name}{item.variant ? ` — ${item.variant.name}` : ''}
                    </span>
                    <span className="quote-cart-qty">×{item.qty.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form className="quote-form" onSubmit={handleSubmit}>
            <h2>Your Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Company Name *</label>
                <input name="company" required value={form.company} onChange={handleChange} placeholder="Acme Corp" />
              </div>
              <div className="form-group">
                <label>Contact Name *</label>
                <input name="name" required value={form.name} onChange={handleChange} placeholder="John Smith" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Business Email *</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="john@acme.com" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 000 0000" />
              </div>
            </div>

            <h2>{isSample ? 'Sample Details' : 'Product Details'}</h2>
            {!isSample && (
              <div className="form-row">
                <div className="form-group">
                  <label>Product SKU</label>
                  <input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. SK-1001" />
                </div>
                <div className="form-group">
                  <label>Estimated Quantity</label>
                  <input name="qty" type="number" value={form.qty} onChange={handleChange} placeholder="e.g. 5000" />
                </div>
              </div>
            )}
            <div className="form-group">
              <label>{isSample ? 'Sample Request Details' : 'Additional Requirements'}</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Describe your requirements, delivery timeline, or any custom requests..." />
            </div>

            <button type="submit" className="btn-submit">
              {isSample ? 'Request Samples' : 'Submit Quote Request'}
            </button>

            {cart.length > 0 && isSample && (
              <p className="quote-cart-hint">
                <Link to="/quote">Switch to full quote request</Link> to include all {cart.length} cart items.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
