import React from 'react'
import '../styles/howto.css'
import photo from '../photos/how-to.png'
import { Link } from "react-router-dom"

function HowTo() {
  return (
    <section className="howto" id="learn">
      <div className="howto-container">
        <div className="howto-image">
          <img src={photo} alt="BMX How-to" />
        </div>
        <div className="howto-content">
          <h2 className="howto-title">HOW-TO</h2>
          <p className="howto-subtitle">Press the button to start your journey</p>
          <div className="howto-buttons">
            <Link to="/forum" className="howto-button advanced">Beginner tricks</Link>
            <Link to="/forum" className="howto-button advanced">Advanced tricks</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowTo
