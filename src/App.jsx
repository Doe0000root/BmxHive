import React from 'react'
import Header from './components/Header'
import Advice from './components/Advice'
import Riders from './components/Riders'
import HowTo from './components/HowTo'
import BikeHelp from './components/BikeHelp'
import Footer from './components/Footer'
import Hero from './components/Hero'
import './styles/app.css'

function App() {
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

export default App
