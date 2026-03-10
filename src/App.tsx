import './App.css'

function App() {
  const artworks = [
    { id: 1, title: 'Dragon Knight', category: 'Illustration' },
    { id: 2, title: 'Cyber City', category: 'Digital Art' },
    { id: 3, title: 'Red Storm', category: 'Abstract' },
    { id: 4, title: 'Space Explorer', category: 'Character Design' },
    { id: 5, title: 'Hidden Forest', category: 'Environment' },
    { id: 6, title: 'Mechanical Heart', category: 'Tech Art' },
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">OWEN<span className="red-dot">.</span></div>
          <div className="nav-links">
            <a href="#gallery">Gallery</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="container">
          <h1>THE ART OF <span className="red-text">OWEN</span></h1>
          <p>Creative explorer and artist. Bringing imagination to life through bold colors and big ideas.</p>
        </div>
      </header>

      <main className="container">
        <section id="gallery" className="gallery-section">
          <h2 className="section-title">Latest Works</h2>
          <div className="gallery-grid">
            {artworks.map((art) => (
              <div key={art.id} className="art-card">
                <div className="art-placeholder">
                   <span>Artwork {art.id}</span>
                </div>
                <div className="art-info">
                  <h3>{art.title}</h3>
                  <p>{art.category}</p>
                </div>
              </div>
            ))}
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
