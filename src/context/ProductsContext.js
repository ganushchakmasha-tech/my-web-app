import { createContext, useContext, useState } from 'react';
import {
  products as staticProducts,
  categoryConfig as staticCategoryConfig,
  LABEL_MIN_QTY,
} from '../data/products';

const PRODUCTS_KEY = 'newbrand_products';
const CAT_KEY     = 'newbrand_catconfig';
const VENDORS_KEY = 'newbrand_vendors';

function loadJSON(key, fallback = {}) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [productOverrides, setProductOverrides] = useState(() => loadJSON(PRODUCTS_KEY));
  const [catOverrides,     setCatOverrides]     = useState(() => loadJSON(CAT_KEY));
  const [vendors,          setVendors]           = useState(() => loadJSON(VENDORS_KEY, []));

  // ── Derived data ──────────────────────────────────────────────
  const products = staticProducts.map(p => ({ ...p, ...(productOverrides[p.id] || {}) }));
  const categoryConfig = Object.fromEntries(
    Object.entries(staticCategoryConfig).map(([k, v]) => [k, { ...v, ...(catOverrides[k] || {}) }])
  );
  const categories = [...new Set(staticProducts.map(p => p.category))];

  // ── Product actions ───────────────────────────────────────────
  function updateProduct(id, fields) {
    setProductOverrides(prev => {
      const next = { ...prev, [id]: { ...(prev[id] || {}), ...fields } };
      saveJSON(PRODUCTS_KEY, next);
      return next;
    });
  }

  function resetProduct(id) {
    setProductOverrides(prev => {
      const { [id]: _, ...next } = prev; // eslint-disable-line no-unused-vars
      saveJSON(PRODUCTS_KEY, next);
      return next;
    });
  }

  // ── Category config actions ───────────────────────────────────
  function updateCategoryConfig(cat, fields) {
    setCatOverrides(prev => {
      const next = { ...prev, [cat]: { ...(prev[cat] || {}), ...fields } };
      saveJSON(CAT_KEY, next);
      return next;
    });
  }

  // ── Vendor actions ────────────────────────────────────────────
  function createVendor(data) {
    const vendor = {
      id: `v-${Date.now()}`,
      name: '',
      email: '',
      phone: '',
      website: '',
      minOrderAmount: 0,
      leadTime: '',
      notes: '',
      ...data,
    };
    setVendors(prev => {
      const next = [...prev, vendor];
      saveJSON(VENDORS_KEY, next);
      return next;
    });
    return vendor;
  }

  function updateVendor(id, fields) {
    setVendors(prev => {
      const next = prev.map(v => v.id === id ? { ...v, ...fields } : v);
      saveJSON(VENDORS_KEY, next);
      return next;
    });
  }

  function deleteVendor(id) {
    setVendors(prev => {
      const next = prev.filter(v => v.id !== id);
      saveJSON(VENDORS_KEY, next);
      return next;
    });
    // Un-assign this vendor from any products
    setProductOverrides(prev => {
      let changed = false;
      const next = { ...prev };
      Object.keys(next).forEach(pid => {
        if (next[pid].vendorId === id) {
          next[pid] = { ...next[pid], vendorId: null };
          changed = true;
        }
      });
      if (changed) saveJSON(PRODUCTS_KEY, next);
      return changed ? next : prev;
    });
  }

  return (
    <ProductsContext.Provider value={{
      products,
      categories,
      categoryConfig,
      LABEL_MIN_QTY,
      staticProducts,
      staticCategoryConfig,
      updateProduct,
      resetProduct,
      updateCategoryConfig,
      vendors,
      createVendor,
      updateVendor,
      deleteVendor,
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
