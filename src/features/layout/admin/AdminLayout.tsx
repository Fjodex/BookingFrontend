import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { adminLogout } from "../../admin/login/api/authApi";
import { CalendarDays, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { getActiveArendCount } from "../../admin/arends/api/arendsApi";
import "./adminLayout.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  const goBookings = () => navigate("/admin/bookings");
  const goArends = () => navigate("/admin/arends");

  const isBookings = location.pathname.includes("/admin/bookings");
  const isArends = location.pathname.includes("/admin/arends");
  const [arendCount, setArendCount] = useState(0);

  useEffect(() => {
    async function load() {
      const count = await getActiveArendCount();
      setArendCount(count);
    }

    load();

    const interval = setInterval(load, 30000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="admin-layout">
      {/* 🔹 Top info bar */}
      <div className="admin-topbar">
        <div>Öppet idag: 07:00–18:00</div>
        <div>Formvägen 13, 906 21 Umeå</div>
      </div>

      {/* 🔹 Main header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <img
              src="http://localhost:5281/images/Logo.svg"
              alt="Colorama Logo"
              className="admin-logo"
            />

            <span className="admin-brand">
              <strong>Umeå</strong> Admin
            </span>
          </div>

          <div className="admin-header-right">
            {/* ICON NAVIGATION */}
            <div className="admin-icon-nav">
              <button
                onClick={goBookings}
                className={`icon-button ${isBookings ? "active" : ""}`}
                title="Schema"
              >
                <CalendarDays size={20} />
              </button>

              <button
                onClick={goArends}
                className={`icon-button ${isArends ? "active" : ""}`}
                title="Ärenden"
              >
                <Wrench size={20} />

                {arendCount > 0 && (
                  <span className="arend-badge">{arendCount}</span>
                )}
              </button>
            </div>

            <span className="admin-role">Admin</span>

            <button onClick={logout} className="logout-button">
              Logga ut
            </button>
          </div>
        </div>
      </header>

      {/* 🔹 Scrollable content area */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
