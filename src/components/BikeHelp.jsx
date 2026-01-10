import React from 'react'
import '../styles/bikehelp.css'
import photo from '../photos/BmxHive.png'

function BikeHelp() {
  return (
    <section className="bikehelp">
      <div className="bikehelp-container">
        <div className="bikehelp-content">
          <h2 className="bikehelp-title">You need help with bike parts?</h2>
          <p className="bikehelp-subtitle">
            Explore our comprehensive guides and expert advice on bike maintenance and parts selection.
          </p>
          <button className="bikehelp-button">Learn more →</button>
        </div>
        <div className="bikehelp-image">
          <img src={photo} alt="BmxHive logo" className="logo-img" />
        </div>
      </div>
    </section>
  )
}

export default BikeHelp
