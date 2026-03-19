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
  const [about, setAbout] = useState<AboutData>({
    name: 'Owen',
    bio: '',
    age: '11',
    artCount: '50+',
  });

  useEffect(() => {
    if (isAuthorized) {
      fetchGallery().then(setArtworks);
      fetchAbout().then(data => {
        if (data) setAbout(data);
      });
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
    const file = (e.currentTarget.elements.namedItem('profilePic') as HTMLInputElement).files?.[0];
    
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

      const result = await updateAbout(updatedAbout);
      // Refresh to get signed URL
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

  if (!isAuthorized) {
    return (
      <div className="app admin-login">
        <div className="container admin-panel">
          <h2 className="section-title">Admin Login</h2>
          <form onSubmit={handleLogin} className="upload-form">
            <div className="form-group">
              <label>Secret Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password..." />
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
        <div className="admin-flex-container">
          <section className="upload-section">
            <h2 className="section-title" style={{borderLeft: 'none'}}>Upload New Art</h2>
            <form className="upload-form" onSubmit={handleUpload}>
              <div className="form-group"><label>Title</label><input name="title" type="text" required /></div>
              <div className="form-group"><label>Category</label><select name="category"><option>Illustration</option><option>Digital Art</option><option>Sketch</option></select></div>
              <div className="form-group"><label>Description</label><textarea name="description" rows={3} className="admin-textarea" /></div>
              <div className="form-group"><label>Art File</label><input name="file" type="file" accept="image/*" required /></div>
              <button type="submit" className="submit-btn" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Publish Art'}</button>
            </form>
          </section>

          <section className="edit-about-section">
            <h2 className="section-title" style={{borderLeft: 'none'}}>Edit About Me</h2>
            <form className="upload-form" onSubmit={handleAboutUpdate}>
              <div className="form-group"><label>Name</label><input name="name" type="text" defaultValue={about.name} /></div>
              <div className="form-group"><label>Bio</label><textarea name="bio" rows={3} defaultValue={about.bio} className="admin-textarea" /></div>
              <div className="admin-stats-row">
                <div className="form-group"><label>Age</label><input name="age" type="text" defaultValue={about.age} /></div>
                <div className="form-group"><label>Art Count</label><input name="artCount" type="text" defaultValue={about.artCount} /></div>
              </div>
              <div className="form-group">
                <label>Profile Picture</label>
                {about.profilePicUrl && <img src={about.profilePicUrl} className="admin-preview-thumb" alt="Preview" />}
                <input name="profilePic" type="file" accept="image/*" />
              </div>
              <button type="submit" className="submit-btn" disabled={isUploading}>{isUploading ? 'Updating...' : 'Save Profile'}</button>
            </form>
          </section>
        </div>

        <div className="recent-uploads">
          <h3 className="section-title" style={{fontSize: '1.5rem', marginTop: '3rem'}}>Recent Uploads</h3>
          <div className="gallery-grid admin-grid">
            {artworks.slice(0, 12).map(art => (
              <div key={art.id} className="art-card admin-card">
                <img src={art.url} alt={art.title} className="art-img" />
                <div className="art-info"><h3>{art.title}</h3></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
