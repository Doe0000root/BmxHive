import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Riders from "./components/Riders";
import HowTo from "./components/HowTo";
import BikeHelp from "./components/BikeHelp";
import Advice from "./components/Advice";
import Footer from "./components/Footer";
import Profile from "./components/Profile";
import Forum from "./components/Forum";
import Admin from "./components/Admin";
import Admin_Login from "./components/Admin_Login";
import Login from "./components/Login";
import Register from "./components/Register";
import { AuthProvider } from "./context/AuthContext";
import "./styles/app.css";

function Home() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <Riders />
      <HowTo />
      <BikeHelp />
      <Advice />
      <Footer />
    </div>
  );
}


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/adminlogin" element={<Admin_Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


export default App;

