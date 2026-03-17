import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import './Account.css';

const MOCK_ORDERS = [
  {
    id: 'ORD-2041', date: '2026-03-10', status: 'Delivered', total: '$4,230.00',
    items: [
      { productId: 1, variantName: '50 ml', qty: 96 },
      { productId: 2, variantName: '50 ml', qty: 48 },
    ],
  },
  {
    id: 'ORD-2035', date: '2026-02-28', status: 'Processing', total: '$11,850.00',
    items: [
      { productId: 4, variantName: '100 ml', qty: 240 },
      { productId: 6, variantName: '50 ml',  qty: 120 },
      { productId: 11, variantName: '30 ml', qty: 120 },
    ],
  },
  {
    id: 'ORD-2021', date: '2026-02-14', status: 'Delivered', total: '$2,675.00',
    items: [
      { productId: 3, variantName: '30 ml', qty: 120 },
      { productId: 7, variantName: '50 ml', qty: 48 },
    ],
  },
];

export default function Account() {
  const { loggedIn, confirmed, login, logout, register, user } = useAuth();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || 'login');
  const [form, setForm] = useState({
    // Login
    email: '', password: '',
    // Identity
    name: '', company: '',
    // Audience
    platform: '', profileUrl: '', followers: '', engagement: '',
    // Brand vision
    brandName: '', categories: '', targetAudience: '', launchTimeline: '', initialOrder: '',
    // Extra
    referral: '', pitch: '',
  });
  const [error, setError] = useState('');
  const [reordering, setReordering] = useState(null);

  function handleReorder(order) {
    setReordering(order.id);
    order.items.forEach(({ productId, variantName, qty }) => {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      const variant = product.variants?.find(v => v.name === variantName) ?? null;
      addToCart(product, qty, null, variant);
    });
    setTimeout(() => { setReordering(null); navigate('/cart'); }, 600);
  }

  function handleChange(e) {
    setError('');
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleLogin(e) {
    e.preventDefault();
    const result = login(form.email, form.password);
    if (result.error) setError(result.error);
  }

  function handleRegister(e) {
    e.preventDefault();
    const result = register({
      company:         form.company,
      name:            form.name,
      email:           form.email,
      password:        form.password,
      platform:        form.platform,
      profileUrl:      form.profileUrl,
      followers:       form.followers,
      engagement:      form.engagement,
      brandName:       form.brandName,
      categories:      form.categories,
      targetAudience:  form.targetAudience,
      launchTimeline:  form.launchTimeline,
      initialOrder:    form.initialOrder,
      referral:        form.referral,
      pitch:           form.pitch,
    });
    if (result.error) setError(result.error);
  }

  // ── Logged in ──────────────────────────────────────────────────
  if (loggedIn) {
    // Pending approval state
    if (!confirmed) {
      return (
        <div className="account-page">
          <div className="container">
            <div className="pending-box">
              <div className="pending-icon">◷</div>
              <h2>Application Received</h2>
              <p>
                Thank you, <strong>{user.name}</strong>. Your wholesale account application for{' '}
                <strong>{user.company}</strong> is under review.
              </p>
              <p>
                You'll receive an email at <strong>{user.email}</strong> once your account is approved —
                usually within one business day.
              </p>
              <p className="pending-contact">
                Questions? Email us at{' '}
                <a href="mailto:trade@newbrand.com">trade@newbrand.com</a>
              </p>
              <button className="btn-logout" onClick={logout}>Sign Out</button>
            </div>
          </div>
        </div>
      );
    }

    // Full dashboard
    return (
      <div className="account-page">
        <div className="container">
          <div className="account-dashboard">
            <div className="account-header">
              <div className="account-avatar">{user.company.slice(0, 2).toUpperCase()}</div>
              <div>
                <h2>{user.company}</h2>
                <p>{user.email} · Account #B2B-00142</p>
              </div>
              <button className="btn-logout" onClick={logout}>Sign Out</button>
            </div>

            <div className="account-grid">
              <div className="account-card">
                <h3>Recent Orders</h3>
                {MOCK_ORDERS.map(o => (
                  <div className="order-row" key={o.id}>
                    <div>
                      <strong>{o.id}</strong>
                      <span>{o.date}</span>
                    </div>
                    <div className="order-right">
                      <span className={`status status-${o.status.toLowerCase()}`}>{o.status}</span>
                      <strong>{o.total}</strong>
                      <button
                        className="btn-reorder"
                        onClick={() => handleReorder(o)}
                        disabled={reordering === o.id}
                      >
                        {reordering === o.id ? '...' : 'Reorder'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="account-card">
                <h3>Account Info</h3>
                <div className="info-row"><span>Company</span><strong>{user.company}</strong></div>
                <div className="info-row"><span>Contact</span><strong>{user.name}</strong></div>
                <div className="info-row"><span>Email</span><strong>{user.email}</strong></div>
                <div className="info-row"><span>Payment Terms</span><strong>Net 30</strong></div>
                <div className="info-row"><span>Credit Limit</span><strong>$50,000</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Auth forms ─────────────────────────────────────────────────
  return (
    <div className="account-page">
      <div className="container">
        <div className="auth-box">
          <div className="auth-tabs">
            <button className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
            <button className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setError(''); }}>Register</button>
          </div>

          {tab === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <h2>Welcome back</h2>
              <p>Sign in to your business account</p>
              {error && <p className="auth-error">{error}</p>}
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
            <form className="auth-form apply-form" onSubmit={handleRegister}>
              <h2>Open Your Brand</h2>
              <p>Tell us about yourself and your vision. We review every application personally.</p>
              {error && <p className="auth-error">{error}</p>}

              <div className="apply-section-label">About you</div>
              <div className="form-group">
                <label>Your Name *</label>
                <input name="name" required value={form.name} onChange={handleChange} placeholder="Jane Smith" />
              </div>
              <div className="form-group">
                <label>Business or Brand Name <span className="field-optional">(if you have one)</span></label>
                <input name="company" value={form.company} onChange={handleChange} placeholder="Glow by Jane" />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Email *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="jane@example.com" />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="••••••••" />
                </div>
              </div>

              <div className="apply-section-label">Your audience</div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Primary Platform *</label>
                  <select name="platform" required value={form.platform} onChange={handleChange}>
                    <option value="">Select…</option>
                    <option>Instagram</option>
                    <option>TikTok</option>
                    <option>YouTube</option>
                    <option>Pinterest</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Follower Count *</label>
                  <select name="followers" required value={form.followers} onChange={handleChange}>
                    <option value="">Select…</option>
                    <option>Under 10k</option>
                    <option>10k – 50k</option>
                    <option>50k – 100k</option>
                    <option>100k – 500k</option>
                    <option>500k – 1M</option>
                    <option>Over 1M</option>
                  </select>
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Profile URL *</label>
                  <input name="profileUrl" required value={form.profileUrl} onChange={handleChange} placeholder="instagram.com/youraccount" />
                </div>
                <div className="form-group">
                  <label>Avg. Engagement Rate <span className="field-optional">(optional)</span></label>
                  <input name="engagement" value={form.engagement} onChange={handleChange} placeholder="e.g. 4.2%" />
                </div>
              </div>

              <div className="apply-section-label">Your brand vision</div>
              <div className="form-group">
                <label>Planned Brand Name <span className="field-optional">(optional)</span></label>
                <input name="brandName" value={form.brandName} onChange={handleChange} placeholder="e.g. Botanica Noir" />
              </div>
              <div className="form-group">
                <label>Product Categories You're Interested In *</label>
                <input name="categories" required value={form.categories} onChange={handleChange} placeholder="e.g. Serums, Face Oils, Moisturizers" />
              </div>
              <div className="form-group">
                <label>Your Target Audience *</label>
                <input name="targetAudience" required value={form.targetAudience} onChange={handleChange} placeholder="e.g. Women 25–40, US-based, skincare-focused" />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Launch Timeline *</label>
                  <select name="launchTimeline" required value={form.launchTimeline} onChange={handleChange}>
                    <option value="">Select…</option>
                    <option>Within 1 month</option>
                    <option>1 – 3 months</option>
                    <option>3 – 6 months</option>
                    <option>6+ months</option>
                    <option>Just exploring</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Expected First Order *</label>
                  <select name="initialOrder" required value={form.initialOrder} onChange={handleChange}>
                    <option value="">Select…</option>
                    <option>Under $1,000</option>
                    <option>$1,000 – $5,000</option>
                    <option>$5,000 – $20,000</option>
                    <option>$20,000+</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Tell us about your vision <span className="field-optional">(optional)</span></label>
                <textarea
                  name="pitch"
                  rows={3}
                  value={form.pitch}
                  onChange={handleChange}
                  placeholder="What makes your brand concept unique? What do you want your customers to feel?"
                />
              </div>
              <div className="form-group">
                <label>How did you hear about us? <span className="field-optional">(optional)</span></label>
                <input name="referral" value={form.referral} onChange={handleChange} placeholder="e.g. Instagram ad, referral from…" />
              </div>

              <button type="submit" className="btn-auth">Submit Application</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
