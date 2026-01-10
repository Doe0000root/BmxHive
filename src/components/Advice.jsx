import React from 'react'
import '../styles/advice.css'

const adviceItems = [
  "If you have chance to ride, go outside and try something new",
  "Ride with someone who is better than you, they will help you",
  "Always wear protection!",
  "Find the friend with same level of riding to compete with him",
  "Eat healthy food to have strength for ride",
  "DON'T forget about recovery, it's better to stay home than get injured"
]

function Advice() {
  return (
    <section className="advice">
      <div className="advice-container">
        <h2 className="advice-title">Advices to become better</h2>
        <div className="advice-list">
          {adviceItems.map((item, index) => (
            <div key={index} className="advice-item">
              <span className="advice-number">{index + 1}</span>
              <p className="advice-text">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Advice
