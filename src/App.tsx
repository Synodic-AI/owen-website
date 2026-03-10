import { useState, useEffect } from 'react'
import { uploadToS3, updateGallery, fetchGallery } from './s3-client'
import './App.css'

interface Artwork {
  id: number;
  title: string;
  category: string;
  url?: string;
}

function App() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  // Load existing gallery on login
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

    try {
      if (!file) throw new Error("No file selected");
      
      const imageUrl = await uploadToS3(file);
      const newArt: Artwork = {
        id: Date.now(),
        title: title,
        category: category,
        url: imageUrl,
      };

      // Atomic Update: Upload image AND update the gallery manifest
      const updatedGallery = await updateGallery(newArt);
      setArtworks(updatedGallery);
      
      e.currentTarget.reset();
      alert("Successfully published to OwenArt.com!");
    } catch (error) {
      alert("Upload failed. Make sure S3 CORS and Environment Variables are correct.");
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
            {isUploading ? 'Uploading to S3...' : 'Publish to Gallery'}
          </button>
        </form>

        {artworks.length > 0 && (
          <div className="recent-uploads">
            <h3 style={{marginTop: '2rem', marginBottom: '1rem'}}>Recently Uploaded:</h3>
            <div className="gallery-grid">
              {artworks.map(art => (
                <div key={art.id} className="art-card">
                  <img src={art.url} alt={art.title} className="art-img" />
                  <div className="art-info">
                    <h3>{art.title}</h3>
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
