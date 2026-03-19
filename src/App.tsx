import { useState, useEffect } from 'react'
import { uploadToS3, updateGallery, fetchGallery, fetchAbout, updateAbout } from './s3-client'
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
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [about, setAbout] = useState<AboutData>({
    name: 'Owen',
    bio: '',
    age: '11',
    artCount: '50+',
  });

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'owen-rocks') {
      setIsAuthorized(true);
    } else {
      alert('Wrong password!');
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.currentTarget);
    const fileInput = e.currentTarget.elements.namedItem('file') as HTMLInputElement;
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
      e.currentTarget.reset();
      alert("Art Published!");
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
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
        artCount: formData.get('artCount') as string,
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
    if (!isAuthorized) {
      return (
        <div className="app admin-login-bg">
          <div className="container admin-panel small-container">
            <h2 className="section-title">Vault Access</h2>
            <form onSubmit={handleLogin} className="upload-form">
              <div className="form-group">
                <label>Master Key</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <button type="submit" className="submit-btn">Unlock Portfolio</button>
            </form>
          </div>
        </div>
      );
    }

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
                <div className="admin-stats-row">
                  <div className="form-group"><label>Age</label><input name="age" type="text" defaultValue={about.age} /></div>
                  <div className="form-group"><label>Art Count</label><input name="artCount" type="text" defaultValue={about.artCount} /></div>
                </div>
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
              {artworks.slice(0, 12).map(art => (
                <div key={art.id} className="art-card">
                  <img src={art.url} alt={art.title} className="art-img" />
                  <div className="art-info"><h3>{art.title}</h3></div>
                </div>
              ))}
            </div>
          </div>
        </main>
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
            <p>Creative explorer and artist. Bringing imagination to life through bold colors and big ideas.</p>
            <div style={{marginTop: '3rem'}}>
              <a href="#gallery" className="submit-btn" style={{display:'inline-block', width:'auto', padding:'1rem 2.5rem', textDecoration:'none'}}>Explore Gallery</a>
            </div>
          </div>
        </header>
      ) : (
        <main className="container">
          <section id="gallery" className="gallery-section">
            <h2 className="section-title">Gallery</h2>
            {isLoading ? (
              <div className="loading-state">Exploring Owen's imagination...</div>
            ) : (
              <div className="gallery-grid">
                {artworks.length > 0 ? artworks.map((art) => (
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
                )) : (
                  <div className="loading-state">The gallery is currently being curated. Check back soon!</div>
                )}
              </div>
            )}
          </section>
        </main>
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
