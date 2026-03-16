import './App.css';
import Navbar from './Navbar';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="hero" id="home">
        <h1>Welcome to MyApp</h1>
        <p>A simple React web app with a homepage and navigation bar.</p>
        <a href="#about" className="cta-button">Get Started</a>
      </main>

      <section id="about" className="section">
        <h2>About</h2>
        <p>This is a starter React application. Customize it to fit your needs.</p>
      </section>

      <section id="services" className="section section-alt">
        <h2>Services</h2>
        <div className="cards">
          <div className="card">
            <h3>Feature One</h3>
            <p>Description of your first feature or service.</p>
          </div>
          <div className="card">
            <h3>Feature Two</h3>
            <p>Description of your second feature or service.</p>
          </div>
          <div className="card">
            <h3>Feature Three</h3>
            <p>Description of your third feature or service.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="section">
        <h2>Contact</h2>
        <p>Get in touch at <a href="mailto:hello@example.com">hello@example.com</a></p>
      </section>
    </div>
  );
}

export default App;
