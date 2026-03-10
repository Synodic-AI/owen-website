import './App.css'

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">OWEN<span className="red-dot">.</span></div>
          <div className="nav-links">
            <a href="https://owensart.com">Gallery</a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="container">
          <h1>THE STORY OF <span className="red-text">OWEN</span></h1>
        </div>
      </header>

      <main className="container">
        <section id="about" className="about-section">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="section-title">Artist & Explorer</h2>
              <p>Owen is an 11-year-old artist with a passion for bringing imaginary worlds to life. Whether it's sketching legendary dragons or building futuristic cyber-cities, his art is all about big ideas and bold colors.</p>
              <p>When he's not at his drawing desk, you can find him exploring new techniques in digital art or dreaming up his next masterpiece.</p>
            </div>
            <div className="about-stats">
              <div className="stat-card">
                <h3>11</h3>
                <p>Years Old</p>
              </div>
              <div className="stat-card">
                <h3>50+</h3>
                <p>Artworks</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <p>&copy; 2026 Owen's Portfolio. Made with Passion<span className="red-dot">.</span></p>
        </div>
      </footer>
    </div>
  )
}

export default App
