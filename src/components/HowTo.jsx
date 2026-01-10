import React from 'react'
import '../styles/howto.css'
import photo from '../photos/how-to.png'

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
            <button className="howto-button beginner">Beginner tricks</button>
            <button className="howto-button advanced">Advanced tricks</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowTo
