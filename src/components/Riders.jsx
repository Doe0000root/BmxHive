import React from 'react'
import '../styles/riders.css'

const riders = [
  {
    name: "Logan Martin",
    description: "Behind every perfect trick is an uncountable number of falls",
    image: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg"
  },
  {
    name: "Kieran Reilly",
    description: "Agility, fitness and motion. These factors help when you inevitably smash yourself up",
    image: "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg"
  },
  {
    name: "Ryan Williams",
    description: "I live to push the limits of all Action Sports",
    image: "https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg"
  }
]

function Riders() {
  return (
    <section className="riders" id="connect">
      <div className="riders-container">
        <h2 className="riders-title">Featured Riders</h2>
        <div className="riders-grid">
          {riders.map((rider, index) => (
            <div key={index} className="rider-card">
              <div className="rider-image">
                <img src={rider.image} alt={rider.name} />
              </div>
              <h3 className="rider-name">{rider.name}</h3>
              <p className="rider-description">{rider.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Riders
