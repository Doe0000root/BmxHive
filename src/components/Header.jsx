import React from 'react'
import { Link } from "react-router-dom";
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
          <Link to="/profile" className="nav-link">Profile</Link>
          <a href="#learn" className="nav-link">Forum</a>

        </nav>
      </div>
    </header>
  )
}

export default Header
