import React from 'react'
import '../styles/riders.css'

const riders = [
  {
    name: "Logan Martin",
    description: "Behind every perfect trick is an uncountable number of falls",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo9JdumWCkDMKWB73jbWivkvNjfHwt4EC1zQKXmo2h6uJK8L661NOK3NuRkT7DoDWueI1KdbZk0PqOM5SKE6TTDGlzN55idUIsgjlrektH&s=10"
  },
  {
    name: "Kieran Reilly",
    description: "Agility, fitness and motion. These factors help when you inevitably smash yourself up",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQO0YbQUDxDP8GHsqp4mcHdcpa4SLdxg-zfkDLtMwxEXiUXJ_1wXIYpaOrso3IGqpXYzWeainhf7dGG0I8n9bPdelqvPcKSq9YQDBDn-vTTHg&s=10"
  },
  {
    name: "Ryan Williams",
    description: "I live to push the limits of all Action Sports",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQysnmABh7U8jf0qj22O4aoCX7_rhRfIJk_kUEArPvctALXNU6ZYbyG4I9BQbXh-PSMxtog10iqfZlkcBystEteOrI_1JBQliT8d5NnMmoF&s=10"
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
