import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { PagesProvider } from './context/PagesContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Admin from './pages/Admin';
import DynamicPage from './pages/DynamicPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ProductsProvider>
      <PagesProvider>
      <AuthProvider>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/"             element={<Products />} />
          <Route path="/products"     element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart"         element={<Cart />} />
          <Route path="/checkout"     element={<Checkout />} />
          <Route path="/account"      element={<Account />} />
          <Route path="/admin"        element={<Admin />} />
          <Route path="/pages/:slug"  element={<DynamicPage />} />
        </Routes>
        <Footer />
      </CartProvider>
      </AuthProvider>
      </PagesProvider>
      </ProductsProvider>
    </BrowserRouter>
  );
}

export default App;
