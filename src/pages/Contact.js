import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: '', message: '' });

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }
  function handleSubmit(e) { e.preventDefault(); setSubmitted(true); }

  return (
    <div className="contact-page">
      <div className="contact-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Our team is here to help with orders, samples, and account inquiries.</p>
        </div>
      </div>

      <div className="container contact-layout">
        <div className="contact-info">
          <div className="contact-card">
            <span className="contact-card-icon">◎</span>
            <h3>Account Management</h3>
            <p>Your dedicated account manager handles orders, pricing, and logistics.</p>
            <a href="mailto:trade@newbrand.com">trade@newbrand.com</a>
          </div>
          <div className="contact-card">
            <span className="contact-card-icon">◉</span>
            <h3>Phone & WhatsApp</h3>
            <p>Mon – Fri, 9:00 AM – 6:00 PM ET</p>
            <a href="tel:+12125550198">+1 (212) 555-0198</a>
          </div>
          <div className="contact-card">
            <span className="contact-card-icon">◈</span>
            <h3>New Accounts</h3>
            <p>Opening a wholesale account for the first time? We'll walk you through the process.</p>
            <a href="mailto:onboarding@newbrand.com">onboarding@newbrand.com</a>
          </div>
          <div className="contact-card">
            <span className="contact-card-icon">◇</span>
            <h3>Office Address</h3>
            <p>135 West 50th Street, Suite 800<br/>New York, NY 10020</p>
          </div>
        </div>

        <div className="contact-form-wrap">
          {submitted ? (
            <div className="contact-success">
              <div className="success-icon">✓</div>
              <h2>Message Received</h2>
              <p>We'll get back to you within 1 business day.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>Send a Message</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input name="name" required value={form.name} onChange={handleChange} placeholder="John Smith" />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Corp" />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="john@acme.com" />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange}>
                  <option value="">Select a topic</option>
                  <option value="order">Order inquiry</option>
                  <option value="account">Account & pricing</option>
                  <option value="sample">Sample request</option>
                  <option value="label">Custom labeling</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea name="message" required value={form.message} onChange={handleChange} rows={5} placeholder="How can we help?" />
              </div>
              <button type="submit" className="btn-submit">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
