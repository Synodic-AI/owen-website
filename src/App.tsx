import { useState } from 'react'
import { uploadToS3 } from './s3-client'
import './App.css'

interface Artwork {
  id: number;
  title: string;
  category: string;
  url?: string;
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([
    { id: 1, title: 'Dragon Knight', category: 'Illustration' },
    { id: 2, title: 'Cyber City', category: 'Digital Art' },
    { id: 3, title: 'Red Storm', category: 'Abstract' },
    { id: 4, title: 'Space Explorer', category: 'Character Design' },
    { id: 5, title: 'Hidden Forest', category: 'Environment' },
    { id: 6, title: 'Mechanical Heart', category: 'Tech Art' },
  ]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    
    const formData = new FormData(e.currentTarget);
    const file = (e.currentTarget.elements.namedItem('file') as HTMLInputElement).files?.[0];
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;

    try {
      let imageUrl = '';
      if (file) {
        imageUrl = await uploadToS3(file);
      }

      const newArt: Artwork = {
        id: Date.now(),
        title: title,
        category: category,
        url: imageUrl,
      };

      setArtworks([newArt, ...artworks]);
      e.currentTarget.reset();
      setIsAdmin(false); // Go back to gallery after upload
    } catch (error) {
      alert("Upload failed. Check your AWS credentials.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo" onClick={() => setIsAdmin(false)} style={{cursor: 'pointer'}}>
            OWEN<span className="red-dot">.</span>
          </div>
          <div className="nav-links">
            <a href="#gallery" onClick={() => setIsAdmin(false)}>Gallery</a>
            <button 
              onClick={() => setIsAdmin(!isAdmin)} 
              className="admin-btn"
            >
              {isAdmin ? 'View Site' : 'Upload Art'}
            </button>
          </div>
        </div>
      </nav>

      {isAdmin ? (
        <div className="container admin-panel">
          <h2 className="section-title">Upload New Artwork</h2>
          <form className="upload-form" onSubmit={handleUpload}>
            <div className="form-group">
              <label>Artwork Title</label>
              <input name="title" type="text" placeholder="e.g. Red Dragon" required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category">
                <option>Illustration</option>
                <option>Digital Art</option>
                <option>Sketch</option>
                <option>3D Model</option>
              </select>
            </div>
            <div className="form-group">
              <label>Choose File</label>
              <input name="file" type="file" accept="image/*" required />
            </div>
            <button type="submit" className="submit-btn" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Publish to Gallery'}
            </button>
          </form>
        </div>
      ) : (
        <>
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
        </>
      )}

      <footer>
        <div className="container">
          <p>&copy; 2026 Owen's Portfolio. Made with Passion<span className="red-dot">.</span></p>
        </div>
      </footer>
    </div>
  )
}

export default App
