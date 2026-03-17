import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Products.css';

function batchGroups(cart, category) {
  return cart
    .filter(i => i.category === category)
    .reduce((acc, i) => {
      const key = i.variant?.name ?? 'Standard';
      acc[key] = (acc[key] || 0) + i.qty;
      return acc;
    }, {});
}

function CategoryProgress({ category, spend, cart }) {
  const { categoryConfig } = useProducts();
  const config = categoryConfig[category];
  if (!config) return null;

  const spendPct = Math.min(100, (spend / config.minAmount) * 100);
  const spendMet = spend >= config.minAmount;

  const groups = config.minPackageCount ? batchGroups(cart, category) : null;
  const batchBest = groups ? Math.max(0, ...Object.values(groups)) : 0;
  const batchMet = !config.minPackageCount || batchBest >= config.minPackageCount;

  return (
    <div className="cat-progress">
      <div className="cat-progress-bar">
        <div className="cat-progress-fill" style={{ width: `${spendPct}%`, background: spendMet ? '#7ab87a' : undefined }} />
      </div>
      <span className="cat-progress-label">
        {spendMet
          ? `$${spend.toFixed(0)} — minimum reached`
          : `$${spend.toFixed(0)} of $${config.minAmount.toLocaleString()} min.`}
      </span>

      {config.minPackageCount && (
        <>
          <div className="cat-progress-bar" style={{ marginTop: '0.25rem' }}>
            <div
              className="cat-progress-fill"
              style={{
                width: `${Math.min(100, (batchBest / config.minPackageCount) * 100)}%`,
                background: batchMet ? '#7ab87a' : 'var(--purple)',
              }}
            />
          </div>
          <span className="cat-progress-label">
            {batchMet
              ? `${batchBest.toLocaleString()} units — batch reached`
              : `${batchBest.toLocaleString()} / ${config.minPackageCount} units batch`}
          </span>
        </>
      )}
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('default');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [rulesDismissed, setRulesDismissed] = useState(false);
  const { categorySpend, cart } = useCart();
  const { confirmed, loggedIn } = useAuth();
  const { products, categories, categoryConfig } = useProducts();

  const searchQuery = searchParams.get('search') || '';
  const activeCategory = searchParams.get('category') || '';

  const filtered = useMemo(() => {
    let list = products.filter(p => !p.hidden);
    if (activeCategory) list = list.filter(p => p.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [activeCategory, searchQuery, sort, products]); // eslint-disable-line react-hooks/exhaustive-deps

  function setCategory(cat) {
    const params = {};
    if (cat) params.category = cat;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
    setBannerDismissed(false);
  }

  const activeCatConfig = activeCategory ? categoryConfig[activeCategory] : null;
  const activeCatSpend = activeCategory ? (categorySpend[activeCategory] || 0) : 0;
  const activeBatchGroups = activeCatConfig?.minPackageCount ? batchGroups(cart, activeCategory) : null;
  const activeBatchBest = activeBatchGroups ? Math.max(0, ...Object.values(activeBatchGroups)) : 0;
  const activeBatchMet = !activeCatConfig?.minPackageCount || activeBatchBest >= activeCatConfig.minPackageCount;

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="container">
          <h1>Catalogue</h1>
          {searchQuery && <p>Results for "{searchQuery}"</p>}
        </div>
      </div>

      <div className="container products-layout">
        <aside className="sidebar">
          <h3>Categories</h3>
          <ul>
            <li>
              <button className={!activeCategory ? 'active' : ''} onClick={() => setCategory('')}>All</button>
            </li>
            {categories.map(cat => {
              const config = categoryConfig[cat];
              const spend = categorySpend[cat] || 0;
              const met = config && spend >= config.minAmount;
              const grps = config?.minPackageCount ? batchGroups(cart, cat) : null;
              const batchBest = grps ? Math.max(0, ...Object.values(grps)) : 0;
              const batchMet = !config?.minPackageCount || batchBest >= config.minPackageCount;
              return (
                <li key={cat}>
                  <button className={activeCategory === cat ? 'active' : ''} onClick={() => setCategory(cat)}>
                    <span className="sidebar-cat-name">{cat}</span>
                    {config && (
                      <span className={`sidebar-cat-min ${met ? 'met' : ''}`}>
                        {met ? '✓' : `$${config.minAmount.toLocaleString()}`}
                      </span>
                    )}
                    {config?.minPackageCount && (
                      <span className={`sidebar-batch-count ${batchMet ? 'met' : ''}`}>
                        {batchMet ? '✓' : `${batchBest}/${config.minPackageCount}`}
                      </span>
                    )}
                  </button>
                  {activeCategory === cat && (
                    <CategoryProgress category={cat} spend={spend} cart={cart} />
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="products-main">

          {/* ── Always-visible ordering rules ── */}
          {!rulesDismissed && (
            <div className="req-rules">
              <button className="req-rules-dismiss" onClick={() => setRulesDismissed(true)} aria-label="Dismiss">×</button>
              <p className="req-rules-heading">Ordering requirements</p>
              <div className="req-rules-list">
                <div className="req-rule">
                  <span className="req-rule-icon">$</span>
                  <div>
                    <strong>Category minimums</strong>
                    <span>
                      {Object.entries(categoryConfig)
                        .filter(([, c]) => c.minAmount)
                        .map(([cat, c]) => `${cat} $${c.minAmount.toLocaleString()}`)
                        .join(' · ')}
                    </span>
                  </div>
                </div>
                <div className="req-rule">
                  <span className="req-rule-icon">◎</span>
                  <div>
                    <strong>Label print run</strong>
                    <span>
                      {Object.values(categoryConfig).find(c => c.minPackageCount)?.minPackageCount} units
                      of the same bottle size to qualify for label printing
                    </span>
                  </div>
                </div>
                <div className="req-rule">
                  <span className="req-rule-icon">◈</span>
                  <div>
                    <strong>Brand label</strong>
                    <span>Your brand label is required on every product at checkout</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeCatConfig && !bannerDismissed && (
            <div className={`cat-banner ${activeCatSpend >= activeCatConfig.minAmount && activeBatchMet ? 'cat-banner--met' : ''}`}>
              <button className="cat-banner-dismiss" onClick={() => setBannerDismissed(true)} aria-label="Dismiss">×</button>
              <div className="cat-banner-rows">
                <div className="cat-banner-row">
                  <div className="cat-banner-text">
                    <span className="cat-banner-label">Category minimum</span>
                    <span className="cat-banner-desc">
                      {activeCatSpend >= activeCatConfig.minAmount
                        ? `You've reached the $${activeCatConfig.minAmount.toLocaleString()} minimum for ${activeCategory}.`
                        : `Add $${(activeCatConfig.minAmount - activeCatSpend).toFixed(2)} more from ${activeCategory} to meet the minimum order.`}
                    </span>
                  </div>
                  <div className="cat-banner-progress">
                    <div className="cat-banner-bar">
                      <div
                        className="cat-banner-fill"
                        style={{
                          width: `${Math.min(100, (activeCatSpend / activeCatConfig.minAmount) * 100)}%`,
                          background: activeCatSpend >= activeCatConfig.minAmount ? '#7ab87a' : undefined,
                        }}
                      />
                    </div>
                    <span>${activeCatSpend.toFixed(2)} / ${activeCatConfig.minAmount.toLocaleString()}</span>
                  </div>
                </div>

                {activeCatConfig.minPackageCount && (
                  <div className="cat-banner-row cat-banner-row--batch">
                    <div className="cat-banner-text">
                      <span className="cat-banner-label">Label batch minimum</span>
                      <span className="cat-banner-desc">
                        {activeBatchMet
                          ? `Batch reached — ${activeBatchBest.toLocaleString()} units of same size.`
                          : activeBatchGroups && Object.keys(activeBatchGroups).length > 0
                            ? `${Object.entries(activeBatchGroups).sort((a,b) => b[1]-a[1])[0][0]}: ${activeBatchBest.toLocaleString()} / ${activeCatConfig.minPackageCount} units`
                            : `Order ${activeCatConfig.minPackageCount} units of the same size to unlock label printing.`}
                      </span>
                    </div>
                    <div className="cat-banner-progress">
                      <div className="cat-banner-bar">
                        <div
                          className="cat-banner-fill"
                          style={{
                            width: `${Math.min(100, (activeBatchBest / activeCatConfig.minPackageCount) * 100)}%`,
                            background: activeBatchMet ? '#7ab87a' : 'var(--purple)',
                          }}
                        />
                      </div>
                      <span>{activeBatchBest.toLocaleString()} / {activeCatConfig.minPackageCount.toLocaleString()} units</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loggedIn && (
            <div className="access-banner">
              <div className="access-banner-text">
                <h2>Wholesale pricing by application</h2>
                <p>
                  New Brand is open to influencers and creators launching their own cosmetics line.
                  Apply for a wholesale account to unlock pricing, place orders, and build your brand.
                </p>
              </div>
              <div className="access-banner-actions">
                <Link to="/account" state={{ tab: 'register' }} className="access-btn-apply">Apply for Access</Link>
                <Link to="/account" className="access-btn-signin">Sign In</Link>
              </div>
            </div>
          )}

          {loggedIn && !confirmed && (
            <div className="access-banner access-banner--pending">
              <div className="access-banner-text">
                <h2>Application under review</h2>
                <p>Your account is pending approval. You'll receive an email once confirmed — usually within one business day.</p>
              </div>
            </div>
          )}

          <div className="products-toolbar">
            <span>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="default">Featured</option>
              <option value="name">Name A–Z</option>
              {confirmed && <option value="price-asc">Price ↑</option>}
              {confirmed && <option value="price-desc">Price ↓</option>}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="no-results">No products found. <Link to="/products">Clear filters</Link></div>
          ) : (
            <div className="product-grid">
              {filtered.map(product => (
                <Link to={`/products/${product.id}`} className="product-card" key={product.id}>
                  <div className="product-img-wrap">
                    <img src={product.image} alt={product.name} />
                    {!product.inStock ? (
                      <span className="card-stock-badge card-stock--out">Out of stock</span>
                    ) : product.stockQty < 50 ? (
                      <span className="card-stock-badge card-stock--low">Low stock</span>
                    ) : null}
                  </div>
                  <div className="product-card-body">
                    <span className="product-sku">{product.sku} · {product.category}</span>
                    <h3>{product.name}</h3>
                    {confirmed ? (
                      <>
                        <p className="product-price">From <strong>${product.tiers[0].price.toFixed(2)}</strong></p>
                        <p className="product-moq">MOQ {product.minOrder} units</p>
                        {categoryConfig[product.category] && (
                          <p className="product-cat-min">
                            ${categoryConfig[product.category].minAmount.toLocaleString()} category min.
                          </p>
                        )}
                        <div className="tier-preview">
                          {product.tiers.slice(0, 2).map(t => (
                            <span key={t.qty}>{t.qty.toLocaleString()}+ → ${t.price.toFixed(2)}</span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="product-price-locked">Sign in to view pricing</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
