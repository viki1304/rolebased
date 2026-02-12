import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import loginIllustration from "../assets/login-illustration.png";
import "../index.css";

import { useToast } from "../context/ToastContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token);
        addToast("Welcome back!", "success");
        navigate("/dashboard");
      } else {
        addToast(data.message || "Invalid credentials", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Connection error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Decoration Side */}
      <div className="login-visual">
        <div className="login-visual-content">
          <div className="brand-logo-large">
             <div className="logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="m2 7 10 5 10-5-10-5z"/><path d="m12 22 5-10"/><path d="M12 22 7 12"/></svg>
             </div>
             <span>EquipStream</span>
          </div>
          <h1 className="visual-title">Streamline Your Workspace</h1>
          <p className="visual-text">The ultimate platform for managing, requesting, and tracking professional office equipment across your organization.</p>
          <img src={loginIllustration} alt="Office Equipment" className="visual-image" />
        </div>
      </div>

      {/* Right Form Side */}
      <div className="login-form-container">
        <div className="login-form-card fade-in">
          <div className="form-header">
            <h2 className="form-title">Login</h2>
            <p className="form-subtitle">Enter your credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="relative-input">
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <input
                    type="email"
                    className="input input-with-icon"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="relative-input">
                  <div className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <input
                    type="password"
                    className="input input-with-icon"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-xl" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? (
                <div className="flex-center" style={{ gap: '0.75rem' }}>
                  <div className="spinner-sm"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
};

export default Login;
