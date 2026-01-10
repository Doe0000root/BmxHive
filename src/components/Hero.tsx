import '../styles/Hero.css'
import React from 'react'


function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-tagline">Place where your story starts</p>
        <h1 className="hero-title">BmxHive</h1>
        <nav className="hero-nav">
          <span>Ride</span>
          <span>Learn</span>
          <span>Connect</span>
        </nav>
      </div>
    </section>
  )
}

export default Hero

