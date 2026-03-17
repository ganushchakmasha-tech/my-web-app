import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

function ImageCarousel({ images, name, activeIndex, onActiveChange }) {
  const prev = useCallback(() =>
    onActiveChange(i => (i - 1 + images.length) % images.length), [images.length, onActiveChange]);
  const next = useCallback(() =>
    onActiveChange(i => (i + 1) % images.length), [images.length, onActiveChange]);

  return (
    <div className="carousel">
      <div className="carousel-main">
        <img
          key={activeIndex}
          src={images[activeIndex]}
          alt={`${name} ${activeIndex + 1}`}
          className="carousel-img"
        />
        {images.length > 1 && (
          <>
            <button className="carousel-btn carousel-btn--prev" onClick={prev} aria-label="Previous">‹</button>
            <button className="carousel-btn carousel-btn--next" onClick={next} aria-label="Next">›</button>
            <div className="carousel-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`carousel-dot ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => onActiveChange(i)}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="carousel-thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              className={`carousel-thumb ${i === activeIndex ? 'active' : ''}`}
              onClick={() => onActiveChange(i)}
            >
              <img src={src} alt={`${name} ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getTierPrice, categorySpend, cart } = useCart();
  const { loggedIn, confirmed, savedDesigns } = useAuth();
  const { products, categoryConfig, vendors } = useProducts();
  const product = products.find(p => p.id === Number(id));

  const [qty, setQty] = useState(product ? product.minOrder : 1);
  const [label, setLabel] = useState('');
  const [added, setAdded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] ?? null);
  const [ingredientsOpen, setIngredientsOpen] = useState(false);

  if (!product) return (
    <div className="not-found">
      <p>Product not found.</p>
      <Link to="/products">← Back to catalogue</Link>
    </div>
  );

  const images = product.images || [product.image];
  const catConfig = categoryConfig[product.category];
  const vendor = product.vendorId ? vendors.find(v => v.id === product.vendorId) : null;
  const step = product.minOrder;
  const currentSpend = categorySpend[product.category] || 0;
  const catPct = catConfig ? Math.min(100, (currentSpend / catConfig.minAmount) * 100) : 0;
  const catMet = catConfig ? currentSpend >= catConfig.minAmount : false;
  const unitPrice = getTierPrice(product, qty);
  const lineTotal = unitPrice * qty;
  const nextTier = product.tiers.find(t => t.qty > qty);
  const unitsToNextTier = nextTier ? nextTier.qty - qty : null;
  const savingsAtNextTier = nextTier ? (unitPrice - nextTier.price) * (qty + unitsToNextTier) : null;

  const batchGroups = catConfig?.minPackageCount
    ? cart.filter(i => i.category === product.category).reduce((acc, i) => {
        const key = i.variant?.name ?? 'Standard';
        acc[key] = (acc[key] || 0) + i.qty;
        return acc;
      }, {})
    : null;
  const batchBest = batchGroups ? Math.max(0, ...Object.values(batchGroups)) : 0;
  const batchMet = !catConfig?.minPackageCount || batchBest >= catConfig.minPackageCount;

  function selectVariant(variant) {
    setSelectedVariant(variant);
    const idx = images.indexOf(variant.image);
    if (idx !== -1) setActiveIndex(idx);
  }

  function decrement() { setQty(q => Math.max(step, q - step)); }
  function increment() { setQty(q => q + step); }
  function handleInputChange(e) {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= step) setQty(Math.round(val / step) * step);
  }

  function handleAdd() {
    addToCart(product, qty, label.trim() || null, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="detail-page">
      <div className="container">
        <Link to="/products" className="back-link">← Catalogue</Link>

        <div className="detail-layout">
          {/* ── LEFT: image carousel ── */}
          <ImageCarousel
            images={images}
            name={product.name}
            activeIndex={activeIndex}
            onActiveChange={setActiveIndex}
          />

          {/* ── RIGHT: product info ── */}
          <div className="detail-info">

            {/* 1. Identity */}
            <div className="detail-identity">
              <div className="detail-identity-top">
                <span className="detail-category">{product.category}</span>
                <span className={`stock-badge ${!product.inStock ? 'stock-badge--out' : product.stockQty < 100 ? 'stock-badge--low' : 'stock-badge--in'}`}>
                  {!product.inStock ? 'Out of Stock' : product.stockQty < 100 ? `Low Stock — ${product.stockQty} left` : 'In Stock'}
                </span>
              </div>
              <h1>{product.name}</h1>
              <span className="detail-sku">SKU {product.sku}</span>
              {vendor && (
                <span className="detail-vendor">
                  Supplied by {vendor.name}
                  {vendor.leadTime && <> · {vendor.leadTime}</>}
                  {vendor.minOrderAmount > 0 && <> · ${vendor.minOrderAmount.toLocaleString()} vendor min</>}
                </span>
              )}
              {product.certifications?.length > 0 && (
                <div className="cert-badges">
                  {product.certifications.map(c => (
                    <span key={c} className="cert-badge">{c}</span>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Variant selector */}
            {product.variants?.length > 0 && (
              <div className="variant-selector">
                <span className="variant-label">
                  Size
                  {selectedVariant && <span className="variant-selected-name">— {selectedVariant.name}</span>}
                </span>
                <div className="variant-options">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      className={`variant-btn ${selectedVariant?.id === v.id ? 'active' : ''}`}
                      onClick={() => selectVariant(v)}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Price anchor */}
            {confirmed ? (
              <div className="detail-price-anchor">
                <span className="detail-price-from">From</span>
                <span className="detail-price-value">${unitPrice.toFixed(2)}</span>
                <span className="detail-price-unit">/ unit</span>
              </div>
            ) : (
              <div className="detail-price-gated">
                <Link to="/account" className="detail-price-gated-link">Sign in to view pricing</Link>
              </div>
            )}

            {/* 4. Description */}
            <p className="detail-desc">{product.description}</p>

            {/* 5. Order box */}
            {!confirmed && (
              <div className="order-gated">
                <p>
                  {loggedIn
                    ? 'Your account is pending approval. You\'ll be able to order once confirmed.'
                    : <><Link to="/account">Sign in</Link> or register to place orders.</>}
                </p>
              </div>
            )}
            {confirmed && <div className="order-box">
              <label className="qty-label">
                Quantity <span className="qty-unit">(units · min. {step.toLocaleString()})</span>
              </label>
              <div className="qty-stepper">
                <button className="qty-btn" onClick={decrement} disabled={qty <= step}>−</button>
                <input
                  type="number"
                  className="qty-display"
                  value={qty}
                  min={step}
                  step={step}
                  onChange={handleInputChange}
                />
                <button className="qty-btn" onClick={increment}>+</button>
              </div>

              {unitsToNextTier && (
                <p className="qty-nudge">
                  Add <strong>{unitsToNextTier.toLocaleString()}</strong> more to unlock <strong>${nextTier.price.toFixed(2)}</strong>/unit
                  {savingsAtNextTier > 0 && <> — save <strong>${savingsAtNextTier.toFixed(2)}</strong> on this order</>}
                </p>
              )}

              <div className="order-summary">
                <div><span>Unit price</span><span>${unitPrice.toFixed(2)}</span></div>
                <div className="total-row"><span>Line total</span><strong>${lineTotal.toFixed(2)}</strong></div>
              </div>

              <div className="order-actions">
                <button className="btn-add" onClick={handleAdd} disabled={!product.inStock}>
                  {!product.inStock ? 'Out of Stock' : added ? 'Added to Cart' : 'Add to Cart'}
                </button>
              </div>

              <p className="order-label-hint">
                Brand label required at checkout — add it now or from your cart
              </p>

              <p className="order-lead-time">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'0.3rem'}}>
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Usually ships in 10–14 business days · Tracked nationwide delivery
              </p>
            </div>}

            {/* 6. Volume pricing */}
            {confirmed && <div className="tier-table">
              <h3>Volume Pricing</h3>
              <table>
                <thead>
                  <tr><th>Quantity</th><th>Unit Price</th><th>Saving</th></tr>
                </thead>
                <tbody>
                  {product.tiers.map((tier, i) => {
                    const next = product.tiers[i + 1];
                    const rangeLabel = next
                      ? `${tier.qty.toLocaleString()} – ${(next.qty - 1).toLocaleString()}`
                      : `${tier.qty.toLocaleString()}+`;
                    const saving = i === 0 ? 0 : Math.round((1 - tier.price / product.tiers[0].price) * 100);
                    const isActive = qty >= tier.qty && (!next || qty < next.qty);
                    return (
                      <tr key={tier.qty} className={isActive ? 'active-tier' : ''}>
                        <td>{rangeLabel}</td>
                        <td>${tier.price.toFixed(2)}</td>
                        <td>{saving > 0 ? <span className="saving-badge">Save {saving}%</span> : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>}

            {/* 7. Order requirements (spend + batch merged) */}
            {catConfig && (
              <div className="order-requirements">
                <span className="order-req-title">Order Requirements</span>

                <div className={`order-req-row ${catMet ? 'req-met' : ''}`}>
                  <div className="order-req-row-header">
                    <span className="order-req-row-label">Category minimum</span>
                    <span className={catMet ? 'status-met' : 'status-unmet'}>
                      {catMet ? '✓ Reached' : `$${(catConfig.minAmount - currentSpend).toFixed(2)} to go`}
                    </span>
                  </div>
                  <div className="order-req-bar-wrap">
                    <div className="order-req-bar">
                      <div className="order-req-fill" style={{ width: `${catPct}%`, background: catMet ? '#7ab87a' : undefined }} />
                    </div>
                    <span>${currentSpend.toFixed(2)} / ${catConfig.minAmount.toLocaleString()}</span>
                  </div>
                  <p className="order-req-desc">
                    {catMet
                      ? `You have $${currentSpend.toFixed(2)} of ${product.category} in your cart.`
                      : `Mix any ${product.category} products to reach the $${catConfig.minAmount.toLocaleString()} minimum.`}
                  </p>
                </div>

                {catConfig.minPackageCount && (
                  <div className={`order-req-row order-req-row--batch ${batchMet ? 'req-met' : ''}`}>
                    <div className="order-req-row-header">
                      <span className="order-req-row-label">Label printing minimum</span>
                      <span className={batchMet ? 'status-met' : 'status-unmet'}>
                        {batchMet ? '✓ Reached' : `${(catConfig.minPackageCount - batchBest).toLocaleString()} units to go`}
                      </span>
                    </div>
                    {batchGroups && Object.keys(batchGroups).length > 0 ? (
                      <div className="batch-size-list">
                        {Object.entries(batchGroups).sort((a,b) => b[1]-a[1]).map(([name, count]) => (
                          <div key={name} className="batch-size-row">
                            <span className="batch-size-name">{name}</span>
                            <div className="order-req-bar" style={{ flex: 1 }}>
                              <div
                                className="order-req-fill"
                                style={{
                                  width: `${Math.min(100, (count / catConfig.minPackageCount) * 100)}%`,
                                  background: count >= catConfig.minPackageCount ? '#7ab87a' : '#a07cc5',
                                }}
                              />
                            </div>
                            <span className="batch-size-count">{count.toLocaleString()} / {catConfig.minPackageCount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="order-req-bar-wrap">
                        <div className="order-req-bar">
                          <div className="order-req-fill" style={{ width: '0%', background: '#a07cc5' }} />
                        </div>
                        <span>0 / {catConfig.minPackageCount.toLocaleString()} units</span>
                      </div>
                    )}
                    <p className="order-req-desc">
                      {batchMet
                        ? `Batch reached — ${batchBest.toLocaleString()} units of the same size in your cart.`
                        : `Order at least ${catConfig.minPackageCount} units of the same bottle size to qualify for label printing. Mix any ${product.category} products.`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 8. Ingredients (collapsible) */}
            {product.ingredients && (
              <div className="ingredients-section">
                <button className="ingredients-toggle" onClick={() => setIngredientsOpen(o => !o)}>
                  <span>Full Ingredients (INCI)</span>
                  <span className={`ingredients-arrow ${ingredientsOpen ? 'open' : ''}`}>▾</span>
                </button>
                {ingredientsOpen && (
                  <p className="ingredients-list">{product.ingredients}</p>
                )}
              </div>
            )}

            {/* 9. Private label */}
            <div className="label-field">
              <label className="label-field-label">
                Your Brand Label
                <span className="label-field-optional">optional — required at checkout</span>
              </label>

              {loggedIn && savedDesigns.length > 0 && (
                <div className="saved-designs">
                  <span className="saved-designs-label">Saved Designs</span>
                  <div className="saved-designs-list">
                    {savedDesigns.map(d => (
                      <button
                        key={d}
                        className={`saved-design-chip ${label === d ? 'active' : ''}`}
                        onClick={() => setLabel(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loggedIn && (
                <p className="label-signin-hint">
                  <Link to="/account">Sign in</Link> to access your saved label designs.
                </p>
              )}

              <div className="label-field-row">
                <input
                  type="text"
                  className="label-field-input"
                  placeholder="e.g. Glow by Jane"
                  maxLength={60}
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                />
                <a
                  href="https://label-studio.example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-design-btn"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  {loggedIn ? 'Edit Designs' : 'Design Label'}
                </a>
              </div>

              <span className="label-field-hint">
                Every product must carry your brand. Enter a name or{' '}
                <a href="https://label-studio.example.com" target="_blank" rel="noopener noreferrer" className="label-field-link">
                  open the label design tool
                </a>{' '}
                to create a fully custom label.
              </span>
            </div>

          </div>
        </div>

        {/* Related products */}
        {(() => {
          const related = products.filter(p => p.category === product.category && p.id !== product.id);
          if (!related.length) return null;
          return (
            <section className="related">
              <div className="related-header">
                <p className="related-eyebrow">More from</p>
                <h2>{product.category}</h2>
              </div>
              <div className="related-grid">
                {related.map(p => (
                  <Link to={`/products/${p.id}`} className="product-card" key={p.id} onClick={() => window.scrollTo(0, 0)}>
                    <div className="product-img-wrap">
                      <img src={p.image} alt={p.name} />
                    </div>
                    <div className="product-card-body">
                      <span className="product-sku">{p.sku}</span>
                      <h3>{p.name}</h3>
                      <p className="product-price">From <strong>${p.tiers[0].price.toFixed(2)}</strong></p>
                      <p className="product-moq">MOQ {p.minOrder} units</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}
      </div>
    </div>
  );
}
