import { useState } from 'react';
import './Account.css';

export default function Account() {
  const [tab, setTab] = useState('login');
  const [loggedIn, setLoggedIn] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', company: '', name: '' });

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleLogin(e) {
    e.preventDefault();
    setLoggedIn(true);
  }

  if (loggedIn) {
    return (
      <div className="account-page">
        <div className="container">
          <div className="account-dashboard">
            <div className="account-header">
              <div className="account-avatar">AC</div>
              <div>
                <h2>Acme Corp</h2>
                <p>john@acme.com · Account #B2B-00142</p>
              </div>
            </div>

            <div className="account-grid">
              <div className="account-card">
                <h3>Recent Orders</h3>
                {[
                  { id: 'ORD-2041', date: '2026-03-10', status: 'Delivered', total: '$4,230.00' },
                  { id: 'ORD-2035', date: '2026-02-28', status: 'Processing', total: '$11,850.00' },
                  { id: 'ORD-2021', date: '2026-02-14', status: 'Delivered', total: '$2,675.00' },
                ].map(o => (
                  <div className="order-row" key={o.id}>
                    <div>
                      <strong>{o.id}</strong>
                      <span>{o.date}</span>
                    </div>
                    <div className="order-right">
                      <span className={`status status-${o.status.toLowerCase()}`}>{o.status}</span>
                      <strong>{o.total}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="account-card">
                <h3>Account Info</h3>
                <div className="info-row"><span>Company</span><strong>Acme Corp</strong></div>
                <div className="info-row"><span>Contact</span><strong>John Smith</strong></div>
                <div className="info-row"><span>Email</span><strong>john@acme.com</strong></div>
                <div className="info-row"><span>Payment Terms</span><strong>Net 30</strong></div>
                <div className="info-row"><span>Credit Limit</span><strong>$50,000</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="container">
        <div className="auth-box">
          <div className="auth-tabs">
            <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>Sign In</button>
            <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>Register</button>
          </div>

          {tab === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <h2>Welcome back</h2>
              <p>Sign in to your business account</p>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="john@acme.com" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
              </div>
              <button type="submit" className="btn-auth">Sign In</button>
              <a href="#forgot" className="forgot-link">Forgot password?</a>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleLogin}>
              <h2>Open a Business Account</h2>
              <p>Get access to wholesale pricing and dedicated support.</p>
              <div className="form-group">
                <label>Company Name *</label>
                <input name="company" required value={form.company} onChange={handleChange} placeholder="Acme Corp" />
              </div>
              <div className="form-group">
                <label>Your Name *</label>
                <input name="name" required value={form.name} onChange={handleChange} placeholder="John Smith" />
              </div>
              <div className="form-group">
                <label>Business Email *</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="john@acme.com" />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input name="password" type="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
              </div>
              <button type="submit" className="btn-auth">Create Account</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
