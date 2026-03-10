import { useState, useEffect } from 'react'
import { fetchAbout } from './s3-client'
import './App.css'

interface AboutData {
  name: string;
  bio: string;
  age: string;
  artCount: string;
  profilePic?: string;
}

function App() {
  const [about, setAbout] = useState<AboutData>({
    name: 'Owen',
    bio: "Owen is an artist with a passion for bringing imaginary worlds to life. Whether it's sketching legendary dragons or building futuristic cyber-cities, his art is all about big ideas and bold colors.",
    age: '11',
    artCount: '50+',
  });

  useEffect(() => {
    fetchAbout().then(data => {
      if (data) setAbout(data);
    });
  }, []);

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
          <h1>THE STORY OF <span className="red-text">{about.name.toUpperCase()}</span></h1>
        </div>
      </header>

      <main className="container">
        <section id="about" className="about-section">
          <div className="about-grid">
            <div className="about-image-container">
              {about.profilePic ? (
                <img src={about.profilePic} alt={about.name} className="profile-pic" />
              ) : (
                <div className="art-placeholder" style={{borderRadius: '50%', aspectRatio: '1/1'}}>
                  <span>Profile Pic</span>
                </div>
              )}
            </div>
            <div className="about-content">
              <h2 className="section-title">Artist & Explorer</h2>
              <p>{about.bio}</p>
              
              <div className="about-stats" style={{marginTop: '2rem', display: 'flex', gap: '1.5rem'}}>
                <div className="stat-card">
                  <h3>{about.age}</h3>
                  <p>Years Old</p>
                </div>
                <div className="stat-card">
                  <h3>{about.artCount}</h3>
                  <p>Artworks</p>
                </div>
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
