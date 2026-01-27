import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/admin_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      const isAdmin =
        data.user?.is_admin === 1 ||
        data.user?.is_admin === true ||
        data.user?.role === "admin";

      if (!isAdmin) {
        setError("Access denied: Admin only");
        return;
      }

      const adminUser = {
        ...data.user,
        role: "admin",
        is_admin: true,
      };

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(adminUser));

      navigate("/admin");
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back
      </button>

      <div className="login-card">
        <h1 className="login-title">Admin Login</h1>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="login-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="login-input"
          />

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
