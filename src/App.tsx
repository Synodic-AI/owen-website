import { useState, useEffect } from 'react'
import { uploadToS3, updateGallery, fetchGallery } from './s3-client'
import './App.css'

interface Artwork {
  id: number;
  title: string;
  category: string;
  description?: string;
  url?: string;
}

function App() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    if (isAuthorized) {
      fetchGallery().then(setArtworks);
    }
  }, [isAuthorized]);

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
    const file = (e.currentTarget.elements.namedItem('file') as HTMLInputElement).files?.[0];
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;

    try {
      if (!file) throw new Error("No file selected");
      
      const imageUrl = await uploadToS3(file);
      const newArt: Artwork = {
        id: Date.now(),
        title: title,
        category: category,
        description: description,
        url: imageUrl,
      };

      const updatedGallery = await updateGallery(newArt);
      setArtworks(updatedGallery);
      
      e.currentTarget.reset();
      alert("Successfully published!");
    } catch (error) {
      alert("Upload failed. Check your S3 configuration.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="app admin-login">
        <div className="container admin-panel">
          <h2 className="section-title">Admin Login</h2>
          <form onSubmit={handleLogin} className="upload-form">
            <div className="form-group">
              <label>Secret Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter password..."
              />
            </div>
            <button type="submit" className="submit-btn">Unlock Dashboard</button>
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
          <div className="nav-links">
            <a href="https://owensart.com">View Main Site</a>
          </div>
        </div>
      </nav>

      <div className="container admin-panel">
        <div className="upload-section">
          <h2 className="section-title" style={{textAlign: 'center', borderLeft: 'none'}}>Upload New Artwork</h2>
          <form className="upload-form centered-form" onSubmit={handleUpload}>
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
              <label>Description</label>
              <textarea 
                name="description" 
                placeholder="Tell the story behind this piece..." 
                rows={3}
                style={{
                  width: '100%', 
                  padding: '0.8rem', 
                  background: 'var(--bg-dark)', 
                  border: '1px solid rgba(255, 59, 59, 0.1)', 
                  borderRadius: '6px', 
                  color: 'white',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div className="form-group">
              <label>Choose File</label>
              <input name="file" type="file" accept="image/*" required />
            </div>
            <button type="submit" className="submit-btn" disabled={isUploading}>
              {isUploading ? 'Uploading to S3...' : 'Publish to Gallery'}
            </button>
          </form>
        </div>

        {artworks.length > 0 && (
          <div className="recent-uploads">
            <h3 className="section-title" style={{marginTop: '4rem', fontSize: '1.5rem'}}>Recently Uploaded</h3>
            <div className="gallery-grid admin-grid">
              {artworks.slice(0, 8).map(art => (
                <div key={art.id} className="art-card admin-card">
                  <img src={art.url} alt={art.title} className="art-img" />
                  <div className="art-info">
                    <h3>{art.title}</h3>
                    <p style={{fontSize: '0.8rem', opacity: 0.8}}>{art.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
