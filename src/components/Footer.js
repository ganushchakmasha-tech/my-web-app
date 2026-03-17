import { Link } from 'react-router-dom';
import { usePages } from '../context/PagesContext';
import './Footer.css';

export default function Footer() {
  const { pages } = usePages();
  const publishedPages = pages.filter(p => p.published);
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/products" className="footer-logo">
            <span className="brand-b2b">New Brand</span>
          </Link>
          <p className="footer-tagline">Wholesale cosmetics for professional brands.</p>
          <p className="footer-contact-line">
            <a href="mailto:trade@newbrand.com">trade@newbrand.com</a>
            <span>·</span>
            <a href="tel:+12125550198">+1 (212) 555-0198</a>
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/products?category=Serums">Serums</Link>
          <Link to="/products?category=Moisturizers">Moisturizers</Link>
          <Link to="/products?category=Oils+%26+Treatments">Oils & Treatments</Link>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/account">Sign In</Link>
          <Link to="/account">Register</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div className="footer-col">
          <h4>Legal</h4>
          <a href="#terms">Terms & Conditions</a>
          <a href="#privacy">Privacy Policy</a>
        </div>

        {publishedPages.length > 0 && (
          <div className="footer-col">
            <h4>Company</h4>
            {publishedPages.map(p => (
              <Link key={p.id} to={`/pages/${p.slug}`}>{p.title}</Link>
            ))}
          </div>
        )}
      </div>

      <div className="footer-bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} New Brand. All rights reserved.</span>
          <span>B2B wholesale only · Minimum order requirements apply</span>
        </div>
      </div>
    </footer>
  );
}
