import React from 'react'
import '../styles/footer.css'
import logo from '../photos/logo.png'
import instagram from '../photos/instagram.png'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-logo">
          <img src={logo} alt="BmxHive logo" />
        </div>

        <div className="footer-nav">
          <a>Ride</a>
          <a>Learn</a>
          <a>Connect</a>
        </div>

        <div className="footer-social">
          <i className="fab fa-instagram"></i>
          <div className="instagram-image">
            <img src={instagram} alt="instagram-logo" className="logo-img"  onClick={() => window.open("https://www.instagram.com/")}/>
          </div>
          <span>Contact us</span>
        </div>

      </div>
    </footer>
  )
}

export default Footer
