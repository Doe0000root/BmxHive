import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './components/Header'
import Advice from './components/Advice'
import Riders from './components/Riders'
import HowTo from './components/HowTo'
import BikeHelp from './components/BikeHelp'
import Footer from './components/Footer'
import Hero from './components/Hero'
import Profile from './components/Profile'
import Admin_Login from './components/Admin_Login'
import Admin from './components/Admin'
import Login from './components/Login';
import Register from './components/Register'
import './styles/app.css'

function Home() {
  return (
    <div className="app">
      <Header />
      <Hero/>
      <Riders />
      <HowTo />
      <BikeHelp />
      <Advice />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/adminlogin" element={<Admin_Login />} />
        <Route path ='/register' element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App
