import { Outlet, useNavigate } from "react-router-dom";
import "./layout.css";

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="public-layout">
      {/* 🔹 Top info bar */}
      <div className="public-topbar">
        <div>Öppet idag: 07:00–18:00</div>
        <div>Formvägen 13, 906 21 Umeå</div>
      </div>

      {/* 🔹 Header */}
      <header className="public-header">
        <div className="public-header-content">
          <div className="public-header-left" onClick={() => navigate("/")}>
            <img
              src="http://localhost:5281/images/Logo.svg"
              alt="Logo"
              className="public-logo"
            />
            <span className="public-brand">
              <strong>Umeå</strong> Uthyrning
            </span>
          </div>

          <div className="public-header-right">
            <button className="public-nav-button" onClick={() => navigate("/")}>
              Produkter
            </button>
          </div>
        </div>
      </header>

      {/* 🔹 Main Content */}
      <main className="public-main">
        <Outlet />
      </main>

      {/* 🔹 Footer */}
      <footer className="public-footer">
        © {new Date().getFullYear()} Umeå Uthyrning
      </footer>
    </div>
  );
}
