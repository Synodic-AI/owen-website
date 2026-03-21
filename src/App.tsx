import { useState, useEffect } from 'react'
import { uploadToS3, updateGallery, fetchGallery, fetchAbout, updateAbout, deleteArtwork } from './s3-client'
import './App.css'

interface Artwork {
  id: number;
  title: string;
  category: string;
  description?: string;
  url?: string;
  key?: string;
}

interface AboutData {
  name: string;
  bio: string;
  age: string;
  artCount: string;
  profilePic?: string;
  profilePicUrl?: string;
}

function App() {
  const [isUploading, setIsUploading] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [about, setAbout] = useState<AboutData>({
    name: 'Owen',
    bio: '',
    age: '11',
    artCount: '0',
  });

  const [lightbox, setLightbox] = useState<Artwork | null>(null);

  // Routing State
  const [route, setRoute] = useState(window.location.hash || '#');

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#');
    window.addEventListener('hashchange', handleHashChange);
    
    async function loadData() {
      try {
        const [liveArt, aboutData] = await Promise.all([
          fetchGallery(),
          fetchAbout()
        ]);
        
        if (liveArt && liveArt.length > 0) setArtworks(liveArt);
        if (aboutData) setAbout(aboutData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsUploading(true);
    const formData = new FormData(form);
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    const file = fileInput.files?.[0];
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;

    try {
      if (!file) throw new Error("No file selected");
      const key = await uploadToS3(file);
      const newArt = { id: Date.now(), title, category, description, key };
      const updatedGallery = await updateGallery(newArt);
      setArtworks(updatedGallery);
      form.reset();
      alert("Art Published!");
    } catch (error) {
      console.error(error);
      alert("Upload failed: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (art: Artwork) => {
    if (!confirm(`Delete "${art.title}"?`)) return;
    try {
      const updatedGallery = await deleteArtwork(art.id, art.key);
      setArtworks(updatedGallery);
    } catch (error) {
      console.error(error);
      alert("Delete failed: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleAboutUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.currentTarget);
    const fileInput = e.currentTarget.elements.namedItem('profilePic') as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    try {
      let picKey = about.profilePic;
      if (file) {
        picKey = await uploadToS3(file, 'profile');
      }

      const updatedAbout = {
        name: formData.get('name') as string,
        bio: formData.get('bio') as string,
        age: formData.get('age') as string,
        profilePic: picKey
      };

      await updateAbout(updatedAbout);
      const freshAbout = await fetchAbout();
      if (freshAbout) setAbout(freshAbout);
      alert("About Me Updated!");
    } catch (error) {
      console.error(error);
      alert("Update failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- RENDER ADMIN ---
  if (route.startsWith('#admin')) {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="container nav-content">
            <div className="logo">OWEN<span className="red-dot">.</span> ADMIN</div>
            <div className="nav-links"><a href="#">Back to Site</a></div>
          </div>
        </nav>

        <main className="container admin-panel">
          <div className="admin-flex-container">
            <section className="admin-section">
              <h2 className="section-title">Upload New Art</h2>
              <form className="upload-form" onSubmit={handleUpload}>
                <div className="form-group"><label>Title</label><input name="title" type="text" required /></div>
                <div className="form-group"><label>Category</label><select name="category"><option>Illustration</option><option>Digital Art</option><option>Sketch</option></select></div>
                <div className="form-group"><label>Description</label><textarea name="description" rows={3} className="admin-textarea" /></div>
                <div className="form-group"><label>Art File</label><input name="file" type="file" accept="image/*" required /></div>
                <button type="submit" className="submit-btn" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Publish Art'}</button>
              </form>
            </section>

            <section className="admin-section">
              <h2 className="section-title">Edit About Me</h2>
              <form className="upload-form" onSubmit={handleAboutUpdate}>
                <div className="form-group"><label>Name</label><input name="name" type="text" defaultValue={about.name} /></div>
                <div className="form-group"><label>Bio</label><textarea name="bio" rows={3} defaultValue={about.bio} className="admin-textarea" /></div>
                <div className="form-group"><label>Age</label><input name="age" type="text" defaultValue={about.age} /></div>
                <div className="form-group">
                  <label>Profile Image</label>
                  <div className="profile-edit-row">
                    {about.profilePicUrl && <img src={about.profilePicUrl} className="admin-preview-thumb" alt="Preview" />}
                    <input name="profilePic" type="file" accept="image/*" />
                  </div>
                </div>
                <button type="submit" className="submit-btn" disabled={isUploading}>{isUploading ? 'Updating...' : 'Save Profile'}</button>
              </form>
            </section>
          </div>

          <div className="recent-uploads">
            <h3 className="section-title">Recent Assets</h3>
            <div className="gallery-grid admin-grid">
              {artworks.map(art => (
                <div key={art.id} className="art-card admin-art-card">
                  <img src={art.url} alt={art.title} className="art-img" onClick={() => art.url && setLightbox(art)} style={{cursor: 'pointer'}} />
                  <div className="art-info">
                    <h3>{art.title}</h3>
                    <button className="delete-btn" onClick={() => handleDelete(art)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {lightbox && (
          <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img src={lightbox.url} alt={lightbox.title} />
              <div className="lightbox-info">
                <h3>{lightbox.title}</h3>
                <p>{lightbox.category}</p>
              </div>
              <button className="lightbox-close" onClick={() => setLightbox(null)}>&times;</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER MAIN SITE ---
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo"><a href="#" style={{color:'inherit', textDecoration:'none'}}>OWEN<span className="red-dot">.</span></a></div>
          <div className="nav-links">
            <a href="#about" className={route === '#about' ? 'active-link' : ''}>About</a>
            <a href="#gallery" className={route === '#gallery' ? 'active-link' : ''}>Gallery</a>
          </div>
        </div>
      </nav>

      {route === '#' ? (
        <header className="hero full-height-hero">
          <div className="container">
            <a href="#admin" className="hero-dragon-link">
              <img src="/dragon-icon.png" alt="Dragon" className="hero-dragon-icon" />
            </a>
            <h1>THE ART OF <span className="red-text">OWEN</span></h1>
            <p>{about.bio || "Creative explorer and artist. Bringing imagination to life through bold colors and big ideas."}</p>
            <div style={{marginTop: '3rem'}}>
              <a href="#gallery" className="submit-btn" style={{display:'inline-block', width:'auto', padding:'1rem 2.5rem', textDecoration:'none'}}>Explore Gallery</a>
            </div>
          </div>
          {artworks.length > 0 && (
            <div className="scroll-gallery-wrapper">
              <div className="scroll-gallery-track">
                {[...artworks, ...artworks].map((art, i) => (
                  <div key={`${art.id}-${i}`} className="scroll-gallery-item" onClick={() => art.url && setLightbox(art)}>
                    {art.url && <img src={art.url} alt={art.title} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>
      ) : route === '#about' ? (
        <main className="container">
          <section id="about" className="about-section">
            <h2 className="section-title">About Me</h2>
            <div className="about-card">
              <div className="about-image-side">
                {about.profilePicUrl ? (
                  <img src={about.profilePicUrl} alt={about.name} className="about-profile-img" />
                ) : (
                  <div className="about-profile-placeholder">O</div>
                )}
              </div>
              <div className="about-content-side">
                <h3>Hi, I'm {about.name}!</h3>
                <p className="about-bio">{about.bio || "I love creating art that tells stories. Check out my gallery!"}</p>
                <div className="about-stats">
                  <div className="stat-item">
                    <span className="stat-label">Age</span>
                    <span className="stat-value">{about.age}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Artworks</span>
                    <span className="stat-value">{artworks.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        <main className="container">
          <section id="gallery" className="gallery-section">
            <h2 className="section-title">Gallery</h2>
            {isLoading ? (
              <div className="loading-state">Exploring Owen's imagination...</div>
            ) : artworks.length > 0 ? (
              <div className="gallery-grid">
                {artworks.map((art) => (
                  <div key={art.id} className="art-card" onClick={() => art.url && setLightbox(art)} style={{cursor: art.url ? 'pointer' : 'default'}}>
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
            ) : (
              <div className="loading-state">The gallery is currently being curated. Check back soon!</div>
            )}
          </section>
        </main>
      )}

      <footer>
        <div className="container">
          <p>&copy; 2026 Owen's Portfolio. Made with Passion<span className="red-dot">.</span></p>
        </div>
      </footer>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.title} />
            <div className="lightbox-info">
              <h3>{lightbox.title}</h3>
              <p>{lightbox.category}</p>
            </div>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>&times;</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
