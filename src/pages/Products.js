import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { products, categories } from '../data/products';
import './Products.css';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('default');

  const searchQuery = searchParams.get('search') || '';
  const activeCategory = searchParams.get('category') || '';

  const filtered = useMemo(() => {
    let list = products;
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
  }, [activeCategory, searchQuery, sort]);

  function setCategory(cat) {
    const params = {};
    if (cat) params.category = cat;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
  }

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
            {categories.map(cat => (
              <li key={cat}>
                <button className={activeCategory === cat ? 'active' : ''} onClick={() => setCategory(cat)}>
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="products-main">
          <div className="products-toolbar">
            <span>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="default">Default</option>
              <option value="name">Name A–Z</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
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
                  </div>
                  <div className="product-card-body">
                    <span className="product-sku">{product.sku} · {product.category}</span>
                    <h3>{product.name}</h3>
                    <p className="product-price">From <strong>€{product.tiers[0].price.toFixed(2)}</strong></p>
                    <p className="product-moq">MOQ {product.minOrder} units</p>
                    <div className="tier-preview">
                      {product.tiers.slice(0, 2).map(t => (
                        <span key={t.qty}>{t.qty.toLocaleString()}+ → €{t.price.toFixed(2)}</span>
                      ))}
                    </div>
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
