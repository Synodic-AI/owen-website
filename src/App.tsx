import { useState } from 'react'
import './App.css'

interface Artwork {
  id: number;
  title: string;
  category: string;
  url?: string;
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([
    { id: 1, title: 'Dragon Knight', category: 'Illustration' },
    { id: 2, title: 'Cyber City', category: 'Digital Art' },
    { id: 3, title: 'Red Storm', category: 'Abstract' },
    { id: 4, title: 'Space Explorer', category: 'Character Design' },
    { id: 5, title: 'Hidden Forest', category: 'Environment' },
    { id: 6, title: 'Mechanical Heart', category: 'Tech Art' },
  ]);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">
            OWEN<span className="red-dot">.</span>
          </div>
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
        <section id="about" className="about-section">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="section-title">About Owen</h2>
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

        <section id="gallery" className="gallery-section">
          <h2 className="section-title">Latest Works</h2>
          <div className="gallery-grid">
            {artworks.map((art) => (
              <div key={art.id} className="art-card">
                {art.url ? (
                  <img src={art.url} alt={art.title} className="art-img" />
                ) : (
                  <div className="art-placeholder">
                     <span>Artwork {art.id}</span>
                  </div>
                )}
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
