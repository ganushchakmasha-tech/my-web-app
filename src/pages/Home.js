import { Link } from 'react-router-dom';
import { products, categories } from '../data/products';
import './Home.css';

export default function Home() {
  return (
    <div className="home">

      {/* Hero */}
      <section className="hero">
        <div className="hero-text">
          <p className="hero-eyebrow">Wholesale Cosmetics · B2B</p>
          <h1>Refined Beauty,<br /><em>At Scale</em></h1>
          <p className="hero-sub">Premium skincare formulations for retailers, spas, and clinics. Competitive volume pricing. Dedicated account management.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary">View Catalogue</Link>
            <Link to="/quote" className="btn-outline">Request Quote</Link>
          </div>
        </div>
        <div className="hero-image-wrap">
          <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80" alt="Cosmetics" />
        </div>
      </section>

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="container stats-inner">
          {[
            { value: '200+', label: 'SKUs Available' },
            { value: '48 h', label: 'Average Dispatch' },
            { value: 'Net 30', label: 'Payment Terms' },
            { value: '1,800+', label: 'Active Accounts' },
          ].map(s => (
            <div className="stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <header className="section-header">
            <p className="section-eyebrow">Browse by</p>
            <h2>Product Categories</h2>
          </header>
          <div className="category-grid">
            {categories.map(cat => (
              <Link to={`/products?category=${encodeURIComponent(cat)}`} className="category-card" key={cat}>
                <span>{cat}</span>
                <span className="cat-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section section-cream">
        <div className="container">
          <header className="section-header">
            <p className="section-eyebrow">Bestsellers</p>
            <h2>Featured Products</h2>
          </header>
          <div className="featured-grid">
            {products.slice(0, 3).map(product => (
              <Link to={`/products/${product.id}`} className="product-card" key={product.id}>
                <div className="product-img-wrap">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-card-body">
                  <span className="product-sku">{product.sku}</span>
                  <h3>{product.name}</h3>
                  <p className="product-price">From <strong>€{product.tiers[0].price.toFixed(2)}</strong> / unit</p>
                  <p className="product-moq">MOQ {product.minOrder} units</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/products" className="btn-primary">See Full Catalogue</Link>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section">
        <div className="container">
          <header className="section-header">
            <p className="section-eyebrow">The Lumière Promise</p>
            <h2>Why Partner With Us</h2>
          </header>
          <div className="pillars-grid">
            {[
              { label: 'Clean Formulas', desc: 'Every product is free from parabens, sulphates, and synthetic fragrance. Dermatologist-tested and cruelty-free.' },
              { label: 'Volume Pricing', desc: 'Tiered pricing that rewards commitment. Unlock savings of up to 40% as your order volume grows.' },
              { label: 'Private Label', desc: 'Full white-label capability. Custom formulations, your branding, our expertise — minimum 500 units.' },
              { label: 'Reliable Supply', desc: 'Consistent stock levels, transparent lead times, and a single point of contact for every account.' },
            ].map(p => (
              <div className="pillar" key={p.label}>
                <div className="pillar-line" />
                <h3>{p.label}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="cta-band">
        <div className="container">
          <h2>Ready to place your first order?</h2>
          <p>Open a business account in minutes and get instant access to wholesale pricing.</p>
          <Link to="/account" className="btn-primary btn-light">Open an Account</Link>
        </div>
      </section>

    </div>
  );
}
