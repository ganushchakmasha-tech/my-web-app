import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Quote.css';

export default function Quote() {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    sku: searchParams.get('sku') || '',
    qty: '',
    message: '',
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
            <h1>Request a Quote</h1>
            <p>Need bulk pricing, custom quantities, or a formal quotation for procurement? Fill out the form and your dedicated account manager will get back to you within 1 business day.</p>
            <ul className="quote-benefits">
              <li>✓ Customized volume pricing</li>
              <li>✓ Net 30 / Net 60 payment terms</li>
              <li>✓ Custom packaging & labeling</li>
              <li>✓ Dedicated account management</li>
              <li>✓ Formal PDF quote for procurement</li>
            </ul>
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

            <h2>Product Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Product SKU</label>
                <input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. SG-1001" />
              </div>
              <div className="form-group">
                <label>Estimated Quantity</label>
                <input name="qty" type="number" value={form.qty} onChange={handleChange} placeholder="e.g. 5000" />
              </div>
            </div>
            <div className="form-group">
              <label>Additional Requirements</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={4} placeholder="Describe your requirements, delivery timeline, or any custom requests..." />
            </div>

            <button type="submit" className="btn-submit">Submit Quote Request</button>
          </form>
        </div>
      </div>
    </div>
  );
}
