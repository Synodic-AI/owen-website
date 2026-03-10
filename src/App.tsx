import { useState, useEffect } from 'react'
import { fetchGallery } from './s3-client'
import './App.css'

interface Artwork {
  id: number;
  title: string;
  category: string;
  url?: string;
}

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const liveArt = await fetchGallery();
        if (liveArt.length > 0) {
          setArtworks(liveArt);
        } else {
          // Fallback to placeholder data if S3 is empty
          setArtworks([
            { id: 1, title: 'Dragon Knight', category: 'Illustration' },
            { id: 2, title: 'Cyber City', category: 'Digital Art' },
            { id: 3, title: 'Red Storm', category: 'Abstract' },
          ]);
        }
      } catch (error) {
        console.error("Failed to load live gallery:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadGallery();
  }, []);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">OWEN<span className="red-dot">.</span></div>
          <div className="nav-links">
            <a href="https://about.owensart.com">About</a>
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
          {isLoading ? (
            <div className="loading-state">Exploring Owen's imagination...</div>
          ) : (
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
          )}
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
