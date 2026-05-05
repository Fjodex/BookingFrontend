import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin, isAdminLoggedIn } from "./api/authApi";
import "./login.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔐 Auto-redirect if already logged in
  useEffect(() => {
    if (isAdminLoggedIn()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      await adminLogin(username.trim(), password);
      navigate("/admin", { replace: true });
    } catch {
      setPassword(""); // clear password on failure
      setError("Fel användarnamn eller lösenord");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Admin login</h2>

        {error && <div className="error">{error}</div>}

        <input
          type="text"
          placeholder="Användarnamn"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Loggar in…" : "Logga in"}
        </button>
      </form>
    </div>
  );
}
