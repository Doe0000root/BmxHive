import { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 

  const { login } = useContext(AuthContext);

  const API_URL = "http://localhost:5000/api";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = res.data;

      if (user.banned) {
        setError("This account is banned");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      login(token, user);

      const from = location.state?.from?.pathname || "/forum";
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back
      </button>
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <button type="submit" className="login-button">
            Login
          </button>
          {error && <p className="login-error">{error}</p>}
        </form>
        <p className="login-register-text">
          Don't have an account?{" "}
          <Link to="/register" className="login-register-link">
            Register here!
          </Link>
        </p>
      </div>
    </div>
  );
}









