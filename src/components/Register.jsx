import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setError(null);

    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];

  
    if (storedUsers.find((user) => user.email === email)) {
      setError("Email already registered");
      return;
    }

   
    const newUser = {
      id: Date.now(),
      email,
      password,
      banned: false,
      role: "user", 
    };
    storedUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(storedUsers));

    
    const storedProfiles = JSON.parse(localStorage.getItem("profiles")) || {};
    storedProfiles[email] = {
      name: "",
      bio: "",
      favorite_tricks: "",
      points: 0,
      rating: 0,
      position: 0,
      avatar_url: "",
      trick_videos: [],
      banned: false,
      email: email,
      role: "user"
    };
    localStorage.setItem("profiles", JSON.stringify(storedProfiles));

   
    navigate("/login");
  };

  return (
    <div className="register-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back
      </button>
      <div className="register-card">
        <h1 className="register-title">Register</h1>
        <form onSubmit={handleRegister} className="register-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="register-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="register-input"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="register-input"
          />
          <button type="submit" className="register-button">
            Register
          </button>
          {error && <p className="register-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}

