import React from 'react'
import logo from'../photos/logo.png'
import '../styles/header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <img src={logo} alt="BmxHive logo" className="logo-img" />
        </div>
        <nav className="nav">
          <a href="#ride" className="nav-link">Profile</a>
          <a href="#learn" className="nav-link">Menu</a>

        </nav>
      </div>
    </header>
  )
}

export default Header
