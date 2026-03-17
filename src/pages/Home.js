import { Link } from 'react-router-dom';
import { products, categories } from '../data/products';
import './Home.css';

const CATEGORY_IMAGES = {
  'Serums':           'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&q=85',
  'Moisturizers':     'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=900&q=85',
  'Oils & Treatments':'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=900&q=85',
};

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=900&q=85';

export default function Home() {
  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1800&q=85"
            alt=""
            aria-hidden="true"
          />
        </div>
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-grain"   aria-hidden="true" />

        <div className="container hero-content">
          <p className="hero-eyebrow">Wholesale Cosmetics · B2B</p>
          <h1>
            Refined<br />
            <em>Beauty,</em><br />
            At Scale
          </h1>
          <p className="hero-sub">
            Premium skincare formulations for retailers, spas, and clinics.
            Volume pricing. Dedicated account management.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary">View Catalogue</Link>
            <Link to="/quote"    className="btn-outline">Request Quote</Link>
          </div>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span>Scroll</span>
          <div className="hero-scroll-line" />
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="stats-bar">
        <div className="container stats-inner">
          {[
            { value: '200+',   label: 'SKUs Available' },
            { value: '48 h',   label: 'Average Dispatch' },
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

      {/* ── Manifesto ── */}
      <section className="manifesto">
        <div className="container">
          <div className="manifesto-inner">
            <span className="manifesto-number" aria-hidden="true">01</span>
            <div className="manifesto-body">
              <blockquote>
                "Formulated for professionals.<br />
                <em>Desired by everyone."</em>
              </blockquote>
              <p>
                Every formula begins with a single question: what does exceptional skin
                actually need? The answer, always, is rigour — clinical-grade actives,
                ethical sourcing, and uncompromising quality at scale. Nothing is added
                for aesthetics. Everything earns its place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section section-dark">
        <div className="container">
          <header className="section-header">
            <p className="section-eyebrow">Browse by</p>
            <h2>Product Categories</h2>
          </header>
          <div className="category-grid">
            {categories.map(cat => (
              <Link
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="category-card"
                key={cat}
              >
                <div className="category-card-img">
                  <img src={CATEGORY_IMAGES[cat] || FALLBACK_IMG} alt={cat} />
                </div>
                <div className="category-card-body">
                  <span>{cat}</span>
                  <span className="cat-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Craft / Science split ── */}
      <section className="craft-section">
        <div className="craft-image">
          <img
            src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1200&q=85"
            alt="Serum formulation close-up"
          />
        </div>
        <div className="craft-text">
          <p className="section-eyebrow">The Formulation</p>
          <h2>
            Where Science<br />Meets <em>Desire</em>
          </h2>
          <p>
            Every product in our catalogue is backed by peer-reviewed research,
            independently verified, and crafted to perform — not just to photograph well.
            From ceramide serums to barrier-repair balms, the science is never compromised.
          </p>
          <Link to="/products" className="btn-primary">Explore Formulations</Link>
        </div>
      </section>

      {/* ── Featured ── */}
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
                  <p className="product-price">From <strong>${product.tiers[0].price.toFixed(2)}</strong> / unit</p>
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

      {/* ── Pillars ── */}
      <section className="section">
        <div className="container">
          <header className="section-header">
            <p className="section-eyebrow">The New Brandmise</p>
            <h2>Why Partner With Us</h2>
          </header>
          <div className="pillars-grid">
            {[
              { label: 'Clean Formulas',   desc: 'Every product is free from parabens, sulphates, and synthetic fragrance. Dermatologist-tested and cruelty-free.' },
              { label: 'Volume Pricing',   desc: 'Tiered pricing that rewards commitment. Unlock savings of up to 40% as your order volume grows.' },
              { label: 'Private Label',    desc: 'Full white-label capability. Custom formulations, your branding, our expertise — minimum 500 units.' },
              { label: 'Reliable Supply',  desc: 'Consistent stock levels, transparent lead times, and a single point of contact for every account.' },
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

      {/* ── CTA band ── */}
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
