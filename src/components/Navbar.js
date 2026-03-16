import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-b2b">Lumière</span> Pro
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products, SKUs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit">→</button>
        </form>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Catalogue</Link>
          <Link to="/quote" onClick={() => setMenuOpen(false)}>Quote</Link>
          <Link to="/account" onClick={() => setMenuOpen(false)}>Account</Link>
          <Link to="/cart" className="cart-link" onClick={() => setMenuOpen(false)}>
            Basket {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
