import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import PageBuilderSection from './PageBuilder';
import './Admin.css';
import './PageBuilder.css';

const ADMIN_PASSWORD = 'newbrand-admin';

// ── Helpers ──────────────────────────────────────────────────────
function initProductDraft(product) {
  return {
    name:           product.name,
    description:    product.description || '',
    sku:            product.sku,
    category:       product.category,
    bottleType:     product.bottleType || '',
    image:          product.image,
    images:         [...(product.images || [product.image])],
    ingredients:    product.ingredients || '',
    certifications: [...(product.certifications || [])],
    inStock:        product.inStock,
    stockQty:       product.stockQty,
    hidden:         product.hidden || false,
    minOrder:       product.minOrder,
    tiers:          product.tiers.map(t => ({ ...t })),
    vendorId:       product.vendorId || '',
  };
}

// ── Product Editor (Shopify-style) ────────────────────────────────
function ProductEditor({ product, staticProduct, vendors, onSave, onReset, onBack }) {
  const [draft, setDraft]               = useState(() => initProductDraft(product));
  const [certInput, setCertInput]       = useState('');
  const [saved, setSaved]               = useState(false);
  const [imgUrlInput, setImgUrlInput]   = useState('');
  const fileRef                         = useRef(null);

  function field(name, value) {
    setDraft(d => ({ ...d, [name]: value }));
  }

  function setTierPrice(index, value) {
    setDraft(d => ({
      ...d,
      tiers: d.tiers.map((t, i) => i === index ? { ...t, price: value } : t),
    }));
  }

  function addCert() {
    const v = certInput.trim();
    if (v && !draft.certifications.includes(v)) {
      setDraft(d => ({ ...d, certifications: [...d.certifications, v] }));
    }
    setCertInput('');
  }

  function removeCert(c) {
    setDraft(d => ({ ...d, certifications: d.certifications.filter(x => x !== c) }));
  }

  function removeImage(idx) {
    setDraft(d => {
      const imgs = d.images.filter((_, i) => i !== idx);
      return { ...d, images: imgs, image: imgs[0] || '' };
    });
  }

  function moveImage(idx, dir) {
    setDraft(d => {
      const imgs = [...d.images];
      const target = idx + dir;
      if (target < 0 || target >= imgs.length) return d;
      [imgs[idx], imgs[target]] = [imgs[target], imgs[idx]];
      return { ...d, images: imgs, image: imgs[0] };
    });
  }

  function addImageUrl() {
    const url = imgUrlInput.trim();
    if (!url) return;
    setDraft(d => ({
      ...d,
      images: [...d.images, url],
      image: d.image || url,
    }));
    setImgUrlInput('');
  }

  function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`"${file.name}" is over 2 MB — please resize it first or use a URL instead.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        setDraft(d => ({
          ...d,
          images: [...d.images, ev.target.result],
          image: d.image || ev.target.result,
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function handleSave() {
    const tiersParsed = draft.tiers.map(t => ({ ...t, price: parseFloat(t.price) || 0 }));
    onSave(product.id, {
      ...draft,
      stockQty: parseInt(draft.stockQty, 10) || 0,
      minOrder: parseInt(draft.minOrder, 10) || 1,
      tiers: tiersParsed,
      vendorId: draft.vendorId || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isModified = JSON.stringify(initProductDraft(product)) !== JSON.stringify(draft);

  return (
    <div className="admin-editor">
      <div className="admin-editor-breadcrumb">
        <button className="admin-back-btn" onClick={onBack}>← Products</button>
        <span className="admin-editor-title-label">{product.name}</span>
      </div>

      <div className="admin-editor-layout">
        {/* ── LEFT column ── */}
        <div className="admin-editor-main">

          {/* Title */}
          <div className="admin-editor-card">
            <input
              className="admin-editor-title-input"
              value={draft.name}
              onChange={e => field('name', e.target.value)}
              placeholder="Product title"
            />
            <textarea
              className="admin-editor-desc-input"
              rows={5}
              value={draft.description}
              onChange={e => field('description', e.target.value)}
              placeholder="Description"
            />
          </div>

          {/* Media */}
          <div className="admin-editor-card">
            <h4 className="admin-editor-card-title">Media</h4>
            {draft.images.length > 0 && (
              <div className="admin-media-grid">
                {draft.images.map((src, i) => (
                  <div key={i} className={`admin-media-thumb ${i === 0 ? 'admin-media-thumb--main' : ''}`}>
                    <img src={src} alt={`${draft.name} ${i + 1}`} />
                    {i === 0 && <span className="admin-media-main-badge">Main</span>}
                    <div className="admin-media-thumb-actions">
                      {i > 0 && <button onClick={() => moveImage(i, -1)} title="Move left">←</button>}
                      {i < draft.images.length - 1 && <button onClick={() => moveImage(i, 1)} title="Move right">→</button>}
                      <button onClick={() => removeImage(i)} title="Remove" className="admin-media-remove">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="admin-media-add-row">
              <button className="admin-media-upload-btn" onClick={() => fileRef.current.click()}>
                ↑ Upload image
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleFileUpload} />
              <span className="admin-media-or">or</span>
              <input
                type="url"
                className="admin-edit-input admin-edit-input--url"
                placeholder="Paste image URL"
                value={imgUrlInput}
                onChange={e => setImgUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addImageUrl()}
              />
              <button className="admin-btn admin-btn--ghost" onClick={addImageUrl}>Add</button>
            </div>
            <p className="admin-media-hint">First image is the main product photo. Max 2 MB per file when uploading.</p>
          </div>

          {/* Ingredients */}
          <div className="admin-editor-card">
            <h4 className="admin-editor-card-title">Ingredients (INCI)</h4>
            <textarea
              className="admin-editor-desc-input"
              rows={3}
              value={draft.ingredients}
              onChange={e => field('ingredients', e.target.value)}
              placeholder="Full ingredient list…"
            />
          </div>

        </div>

        {/* ── RIGHT sidebar ── */}
        <div className="admin-editor-sidebar">

          {/* Status */}
          <div className="admin-editor-card">
            <h4 className="admin-editor-card-title">Status</h4>
            <div className="admin-status-radios">
              <label className={`admin-status-radio ${!draft.hidden ? 'active' : ''}`}>
                <input type="radio" name="status" checked={!draft.hidden} onChange={() => field('hidden', false)} />
                <span className="admin-status-dot admin-status-dot--active" />
                Active
              </label>
              <label className={`admin-status-radio ${draft.hidden ? 'active' : ''}`}>
                <input type="radio" name="status" checked={draft.hidden} onChange={() => field('hidden', true)} />
                <span className="admin-status-dot admin-status-dot--hidden" />
                Hidden
              </label>
            </div>
          </div>

          {/* Organization */}
          <div className="admin-editor-card">
            <h4 className="admin-editor-card-title">Organization</h4>
            <div className="admin-edit-field">
              <label>Category</label>
              <input
                className="admin-edit-input"
                value={draft.category}
                onChange={e => field('category', e.target.value)}
                placeholder="e.g. Serums"
              />
            </div>
            <div className="admin-edit-field">
              <label>Bottle Type</label>
              <input
                className="admin-edit-input"
                value={draft.bottleType}
                onChange={e => field('bottleType', e.target.value)}
                placeholder="e.g. Glass Dropper"
              />
            </div>
            <div className="admin-edit-field">
              <label>Vendor</label>
              <select
                className="admin-edit-input"
                value={draft.vendorId}
                onChange={e => field('vendorId', e.target.value)}
              >
                <option value="">— No vendor —</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="admin-editor-card">
            <h4 className="admin-editor-card-title">Volume Pricing</h4>
            <div className="admin-tier-table">
              <div className="admin-tier-head">
                <span>Min Qty</span>
                <span>Unit Price ($)</span>
              </div>
              {draft.tiers.map((tier, i) => (
                <div key={tier.qty} className="admin-tier-row">
                  <span>{tier.qty.toLocaleString()}+</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={tier.price}
                    onChange={e => setTierPrice(i, e.target.value)}
                    className="admin-edit-input admin-edit-input--price"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Inventory */}
          <div className="admin-editor-card">
            <h4 className="admin-editor-card-title">Inventory</h4>
            <div className="admin-edit-field">
              <label>SKU</label>
              <input
                className="admin-edit-input"
                value={draft.sku}
                onChange={e => field('sku', e.target.value)}
              />
            </div>
            <div className="admin-edit-field">
              <label>In Stock</label>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={draft.inStock}
                  onChange={e => field('inStock', e.target.checked)}
                />
                <span className="admin-toggle-track" />
              </label>
            </div>
            <div className="admin-edit-field">
              <label>Stock Qty</label>
              <input
                type="number"
                min={0}
                value={draft.stockQty}
                onChange={e => field('stockQty', e.target.value)}
                className="admin-edit-input"
              />
            </div>
            <div className="admin-edit-field">
              <label>MOQ (units)</label>
              <input
                type="number"
                min={1}
                value={draft.minOrder}
                onChange={e => field('minOrder', e.target.value)}
                className="admin-edit-input"
              />
            </div>
          </div>

          {/* Certifications */}
          <div className="admin-editor-card">
            <h4 className="admin-editor-card-title">Certifications</h4>
            <div className="admin-cert-tags">
              {draft.certifications.map(c => (
                <span key={c} className="admin-cert-tag">
                  {c}
                  <button onClick={() => removeCert(c)}>✕</button>
                </span>
              ))}
            </div>
            <div className="admin-cert-add-row">
              <input
                className="admin-edit-input"
                placeholder="e.g. Vegan"
                value={certInput}
                onChange={e => setCertInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCert(); } }}
              />
              <button className="admin-btn admin-btn--ghost" onClick={addCert}>Add</button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer actions */}
      <div className="admin-editor-footer">
        <div className="admin-editor-footer-left">
          <button
            className="admin-btn admin-btn--approve"
            onClick={handleSave}
            disabled={!isModified}
          >
            {saved ? 'Saved ✓' : 'Save Changes'}
          </button>
          <button className="admin-btn admin-btn--ghost" onClick={onBack}>
            Discard
          </button>
        </div>
        <button
          className="admin-btn admin-btn--danger"
          onClick={() => { if (window.confirm('Reset all overrides to the original static data?')) onReset(product.id); }}
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}

// ── Products Section ──────────────────────────────────────────────
function ProductsSection() {
  const {
    products, categoryConfig, staticCategoryConfig,
    vendors, updateProduct, resetProduct, updateCategoryConfig,
  } = useProducts();

  const [editingId,  setEditingId]  = useState(null);
  const [filterCat,  setFilterCat]  = useState('');
  const [catDraft,   setCatDraft]   = useState(
    () => Object.fromEntries(Object.entries(categoryConfig).map(([k, v]) => [k, v.minAmount]))
  );
  const [catSaved,   setCatSaved]   = useState(false);

  const editingProduct = editingId ? products.find(p => p.id === editingId) : null;
  const staticProduct  = editingId ? null : null; // not needed separately

  const categories    = [...new Set(products.map(p => p.category))];
  const displayedList = filterCat ? products.filter(p => p.category === filterCat) : products;

  function saveCategoryMinimums() {
    Object.entries(catDraft).forEach(([cat, val]) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) updateCategoryConfig(cat, { minAmount: num });
    });
    setCatSaved(true);
    setTimeout(() => setCatSaved(false), 2000);
  }

  function handleSaveProduct(id, fields) {
    updateProduct(id, fields);
  }

  function handleResetProduct(id) {
    resetProduct(id);
    setEditingId(null);
  }

  // ── Product editor full page ──
  if (editingProduct) {
    return (
      <ProductEditor
        product={editingProduct}
        vendors={vendors}
        onSave={handleSaveProduct}
        onReset={handleResetProduct}
        onBack={() => setEditingId(null)}
      />
    );
  }

  // ── Product list ──
  return (
    <div className="admin-products">
      {/* Category minimums strip */}
      <div className="admin-cat-minimums">
        <span className="admin-cat-minimums-label">Category Minimums</span>
        <div className="admin-cat-minimums-fields">
          {Object.entries(catDraft).map(([cat, val]) => (
            <div key={cat} className="admin-cat-field">
              <label>{cat}</label>
              <div className="admin-cat-input-wrap">
                <span>$</span>
                <input
                  type="number"
                  min={0}
                  value={val}
                  onChange={e => setCatDraft(d => ({ ...d, [cat]: e.target.value }))}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          className={`admin-btn ${catSaved ? 'admin-btn--approve' : 'admin-btn--save'}`}
          onClick={saveCategoryMinimums}
        >
          {catSaved ? 'Saved ✓' : 'Save Minimums'}
        </button>
      </div>

      {/* Category filter */}
      <div className="admin-products-filter">
        <button className={!filterCat ? 'active' : ''} onClick={() => setFilterCat('')}>
          All ({products.length})
        </button>
        {categories.map(cat => (
          <button key={cat} className={filterCat === cat ? 'active' : ''} onClick={() => setFilterCat(cat)}>
            {cat} ({products.filter(p => p.category === cat).length})
          </button>
        ))}
      </div>

      {/* Product list */}
      <div className="admin-product-list">
        <div className="admin-product-list-head">
          <span>Product</span>
          <span>Category</span>
          <span>Base Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span></span>
        </div>
        {displayedList.map(p => {
          const vendor = p.vendorId ? vendors.find(v => v.id === p.vendorId) : null;
          return (
            <div key={p.id} className="admin-product-item">
              <div className="admin-product-item-img">
                <img src={p.image} alt={p.name} />
              </div>
              <div className="admin-product-item-info">
                <strong>{p.name}</strong>
                <span>{p.sku}{vendor ? ` · ${vendor.name}` : ''}</span>
              </div>
              <span className="admin-product-item-cat">{p.category}</span>
              <span className="admin-product-item-price">${p.tiers[0].price.toFixed(2)}</span>
              <span className="admin-product-item-stock">
                {p.inStock ? p.stockQty.toLocaleString() : <em>Out</em>}
              </span>
              <span>
                {p.hidden ? (
                  <span className="admin-status-badge admin-status-badge--hidden">Hidden</span>
                ) : p.inStock ? (
                  <span className="admin-status-badge admin-status-badge--in">Active</span>
                ) : (
                  <span className="admin-status-badge admin-status-badge--out">Out of Stock</span>
                )}
              </span>
              <button className="admin-btn admin-btn--edit" onClick={() => setEditingId(p.id)}>Edit</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Vendor Editor ─────────────────────────────────────────────────
function VendorEditor({ vendor, onSave, onBack }) {
  const [draft, setDraft] = useState({ ...vendor });
  const [saved, setSaved]  = useState(false);

  function field(name, value) { setDraft(d => ({ ...d, [name]: value })); }

  function handleSave() {
    onSave(vendor.id, draft);
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 800);
  }

  return (
    <div className="admin-editor">
      <div className="admin-editor-breadcrumb">
        <button className="admin-back-btn" onClick={onBack}>← Vendors</button>
        <span className="admin-editor-title-label">{vendor.name || 'New Vendor'}</span>
      </div>

      <div className="admin-editor-layout admin-editor-layout--single">
        <div className="admin-editor-card">
          <h4 className="admin-editor-card-title">Vendor Details</h4>

          {[
            { key: 'name',    label: 'Vendor Name *',     placeholder: 'e.g. Cosmetics Lab EU' },
            { key: 'email',   label: 'Email',              placeholder: 'orders@vendor.com' },
            { key: 'phone',   label: 'Phone',              placeholder: '+1 555 000 0000' },
            { key: 'website', label: 'Website',            placeholder: 'vendor.com' },
            { key: 'leadTime',label: 'Lead Time',          placeholder: 'e.g. 10–14 business days' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="admin-edit-field">
              <label>{label}</label>
              <input
                className="admin-edit-input"
                placeholder={placeholder}
                value={draft[key] || ''}
                onChange={e => field(key, e.target.value)}
              />
            </div>
          ))}

          <div className="admin-edit-field">
            <label>Min Order Amount ($)</label>
            <input
              type="number"
              min={0}
              className="admin-edit-input"
              placeholder="0"
              value={draft.minOrderAmount || 0}
              onChange={e => field('minOrderAmount', parseFloat(e.target.value) || 0)}
            />
            <p className="admin-field-hint">Minimum $ order value from this vendor across all their products.</p>
          </div>

          <div className="admin-edit-field">
            <label>Notes</label>
            <textarea
              className="admin-editor-desc-input"
              rows={3}
              value={draft.notes || ''}
              onChange={e => field('notes', e.target.value)}
              placeholder="Internal notes about this vendor…"
            />
          </div>
        </div>
      </div>

      <div className="admin-editor-footer">
        <button className="admin-btn admin-btn--approve" onClick={handleSave}>
          {saved ? 'Saved ✓' : 'Save Vendor'}
        </button>
        <button className="admin-btn admin-btn--ghost" onClick={onBack}>Cancel</button>
      </div>
    </div>
  );
}

// ── Vendors Section ───────────────────────────────────────────────
function VendorsSection() {
  const { vendors, products, createVendor, updateVendor, deleteVendor } = useProducts();
  const [editingId, setEditingId] = useState(null);

  const editingVendor = editingId === 'new'
    ? { id: 'new', name: '', email: '', phone: '', website: '', minOrderAmount: 0, leadTime: '', notes: '' }
    : editingId ? vendors.find(v => v.id === editingId)
    : null;

  function handleSave(id, draft) {
    if (id === 'new') {
      createVendor(draft);
    } else {
      updateVendor(id, draft);
    }
    setEditingId(null);
  }

  if (editingVendor) {
    return (
      <VendorEditor
        vendor={editingVendor}
        onSave={handleSave}
        onBack={() => setEditingId(null)}
      />
    );
  }

  return (
    <div className="admin-vendors">
      <div className="admin-vendors-header">
        <h2>Vendors</h2>
        <button className="admin-btn admin-btn--approve" onClick={() => setEditingId('new')}>
          + Add Vendor
        </button>
      </div>

      {vendors.length === 0 ? (
        <div className="admin-empty">
          No vendors yet. Add a vendor to assign them to products.
        </div>
      ) : (
        <div className="admin-vendor-list">
          {vendors.map(v => {
            const assigned = products.filter(p => p.vendorId === v.id).length;
            return (
              <div key={v.id} className="admin-vendor-item">
                <div className="admin-vendor-info">
                  <strong>{v.name}</strong>
                  <div className="admin-vendor-meta">
                    {v.email && <a href={`mailto:${v.email}`}>{v.email}</a>}
                    {v.leadTime && <span>{v.leadTime}</span>}
                    {v.minOrderAmount > 0 && <span>${v.minOrderAmount.toLocaleString()} min order</span>}
                    <span>{assigned} product{assigned !== 1 ? 's' : ''}</span>
                  </div>
                  {v.notes && <p className="admin-vendor-notes">{v.notes}</p>}
                </div>
                <div className="admin-vendor-actions">
                  <button className="admin-btn admin-btn--edit" onClick={() => setEditingId(v.id)}>Edit</button>
                  <button
                    className="admin-btn admin-btn--reject"
                    onClick={() => {
                      if (window.confirm(`Delete vendor "${v.name}"? Products assigned to them will be unlinked.`))
                        deleteVendor(v.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Admin component ──────────────────────────────────────────
export default function Admin() {
  const { getAllUsers, approveUser, rejectUser } = useAuth();
  const [authed,    setAuthed]    = useState(() => sessionStorage.getItem('nb_admin') === '1');
  const [pwInput,   setPwInput]   = useState('');
  const [pwError,   setPwError]   = useState('');
  const [users,     setUsers]     = useState([]);
  const [section,   setSection]   = useState('applications');
  const [tab,       setTab]       = useState('pending');
  const [expanded,  setExpanded]  = useState(null);

  function refresh() { setUsers(getAllUsers()); }

  useEffect(() => { if (authed) refresh(); }, [authed]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogin(e) {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('nb_admin', '1');
      setAuthed(true);
      refresh();
    } else {
      setPwError('Incorrect password.');
    }
  }

  function handleApprove(email) { approveUser(email); refresh(); }
  function handleReject(email)  { rejectUser(email);  refresh(); }
  function handleAdminLogout()  { sessionStorage.removeItem('nb_admin'); setAuthed(false); }

  // ── Password gate ──────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="admin-page">
        <div className="admin-login-wrap">
          <div className="admin-login-box">
            <h1>Admin</h1>
            <p>New Brand — Wholesale Portal</p>
            <form onSubmit={handleLogin}>
              {pwError && <p className="admin-error">{pwError}</p>}
              <input
                type="password"
                placeholder="Admin password"
                value={pwInput}
                onChange={e => { setPwInput(e.target.value); setPwError(''); }}
                autoFocus
              />
              <button type="submit">Sign In</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────
  const pending  = users.filter(u => !u.confirmed && !u.rejected);
  const approved = users.filter(u => u.confirmed);
  const rejected = users.filter(u => u.rejected);
  const tabUsers = tab === 'pending' ? pending : tab === 'approved' ? approved : rejected;

  return (
    <div className="admin-page">
      <div className="admin-inner">

        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-brand">New Brand</span>
            <span className="admin-badge">Admin</span>
          </div>
          <button className="admin-signout" onClick={handleAdminLogout}>Sign Out</button>
        </div>

        {/* Section navigation */}
        <div className="admin-section-nav">
          {[
            { key: 'applications', label: 'Applications', badge: pending.length || null },
            { key: 'products',     label: 'Products' },
            { key: 'vendors',      label: 'Vendors' },
            { key: 'pages',        label: 'Pages' },
          ].map(s => (
            <button
              key={s.key}
              className={section === s.key ? 'active' : ''}
              onClick={() => setSection(s.key)}
            >
              {s.label}
              {s.badge ? <span className="admin-count">{s.badge}</span> : null}
            </button>
          ))}
        </div>

        {/* ── Applications ── */}
        {section === 'applications' && (
          <>
            <div className="admin-header">
              <h1>Account Applications</h1>
              <button className="admin-refresh" onClick={refresh}>Refresh</button>
            </div>

            <div className="admin-tabs">
              <button className={tab === 'pending'  ? 'active' : ''} onClick={() => setTab('pending')}>
                Pending <span className="admin-count">{pending.length}</span>
              </button>
              <button className={tab === 'approved' ? 'active' : ''} onClick={() => setTab('approved')}>
                Approved <span className="admin-count">{approved.length}</span>
              </button>
              <button className={tab === 'rejected' ? 'active' : ''} onClick={() => setTab('rejected')}>
                Rejected <span className="admin-count">{rejected.length}</span>
              </button>
            </div>

            {tabUsers.length === 0 ? (
              <div className="admin-empty">No {tab} applications.</div>
            ) : (
              <div className="admin-cards">
                {tabUsers.map(u => {
                  const isOpen = expanded === u.id;
                  return (
                    <div key={u.id} className={`admin-card ${isOpen ? 'admin-card--open' : ''}`}>
                      <div className="admin-card-row" onClick={() => setExpanded(isOpen ? null : u.id)}>
                        <div className="admin-card-main">
                          <div className="admin-card-name">
                            <strong>{u.name}</strong>
                            {u.company && <span className="admin-card-company">· {u.company}</span>}
                          </div>
                          <div className="admin-card-meta">
                            <a href={`mailto:${u.email}`} onClick={e => e.stopPropagation()}>{u.email}</a>
                            {u.platform  && <span>{u.platform}</span>}
                            {u.followers && <span>{u.followers} followers</span>}
                            {u.profileUrl && (
                              <a href={u.profileUrl.startsWith('http') ? u.profileUrl : `https://${u.profileUrl}`}
                                target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="admin-profile-link">
                                View Profile ↗
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="admin-card-right">
                          <span className="admin-card-date">
                            {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="admin-actions" onClick={e => e.stopPropagation()}>
                            {!u.confirmed && (
                              <button className="admin-btn admin-btn--approve" onClick={() => handleApprove(u.email)}>Approve</button>
                            )}
                            {!u.rejected && (
                              <button className="admin-btn admin-btn--reject" onClick={() => handleReject(u.email)}>Reject</button>
                            )}
                            {u.rejected && (
                              <button className="admin-btn admin-btn--approve" onClick={() => handleApprove(u.email)}>Re-approve</button>
                            )}
                          </div>
                          <span className="admin-card-toggle">{isOpen ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="admin-card-detail">
                          <div className="admin-detail-grid">
                            <div className="admin-detail-col">
                              <p className="admin-detail-section">Audience</p>
                              <div className="admin-detail-row"><span>Platform</span><strong>{u.platform || '—'}</strong></div>
                              <div className="admin-detail-row"><span>Followers</span><strong>{u.followers || '—'}</strong></div>
                              <div className="admin-detail-row"><span>Engagement</span><strong>{u.engagement || '—'}</strong></div>
                              <div className="admin-detail-row"><span>Profile</span>
                                {u.profileUrl
                                  ? <a href={u.profileUrl.startsWith('http') ? u.profileUrl : `https://${u.profileUrl}`} target="_blank" rel="noopener noreferrer">{u.profileUrl}</a>
                                  : <strong>—</strong>}
                              </div>
                            </div>
                            <div className="admin-detail-col">
                              <p className="admin-detail-section">Brand Vision</p>
                              <div className="admin-detail-row"><span>Brand Name</span><strong>{u.brandName || '—'}</strong></div>
                              <div className="admin-detail-row"><span>Categories</span><strong>{u.categories || '—'}</strong></div>
                              <div className="admin-detail-row"><span>Target Audience</span><strong>{u.targetAudience || '—'}</strong></div>
                              <div className="admin-detail-row"><span>Launch</span><strong>{u.launchTimeline || '—'}</strong></div>
                              <div className="admin-detail-row"><span>First Order</span><strong>{u.initialOrder || '—'}</strong></div>
                            </div>
                          </div>
                          {u.pitch && (
                            <div className="admin-pitch">
                              <p className="admin-detail-section">Their vision</p>
                              <blockquote>{u.pitch}</blockquote>
                            </div>
                          )}
                          {u.referral && (
                            <div className="admin-detail-row admin-detail-row--inline">
                              <span>Referral</span><strong>{u.referral}</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Products ── */}
        {section === 'products' && <ProductsSection />}

        {/* ── Vendors ── */}
        {section === 'vendors' && <VendorsSection />}

        {/* ── Pages ── */}
        {section === 'pages' && <PageBuilderSection />}

      </div>
    </div>
  );
}
