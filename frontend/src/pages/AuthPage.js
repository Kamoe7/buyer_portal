import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function AuthPage() {
  const [mode, setMode] = useState("login"); 
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-logo">
          ESTATE<span>.</span>IO
        </div>
        <div className="auth-visual-tagline">
          <h2>Find your perfect home.</h2>
          <p>Save your favourites and revisit anytime.</p>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-box">
          <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p className="subtitle">
            {mode === "login"
              ? "Sign in to access your buyer dashboard."
              : "Join to start saving your favourite properties."}
          </p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {mode === "register" && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                value={form.password}
                onChange={handleChange}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <a onClick={switchMode} role="button" tabIndex={0}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
