import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { AdminBooking } from "../../types/AdminBooking";

import "./adminBookingList.css";

import { Search } from "lucide-react";

type Props = {
  bookings: AdminBooking[];
  onHandover: (b: AdminBooking) => void;
  onReturn: (b: AdminBooking) => void;
  onClear: (b: AdminBooking) => void;
  onDelete: (b: AdminBooking) => void;
};

type BookingView = "today" | "upcoming";

// Parse YYYY-MM-DD as a local date, avoiding UTC timezone shifts.
function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string): string {
  return parseLocalDate(value).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
  });
}

function getStatusLabel(status: AdminBooking["status"]): string {
  switch (status) {
    case "Active":
      return "Aktiv";
    case "InCustomerCare":
      return "Utlämnad";
    case "Completed":
      return "Återlämnad";
    case "Cleared":
      return "Avslutad";
    default:
      return status;
  }
}

export default function AdminBookingList({
  bookings,
  onHandover,
  onReturn,
  onClear,
  onDelete,
}: Props) {
  const [view, setView] = useState<BookingView>("today");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const today = getLocalDateString(new Date());

  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== "Completed"),
    [bookings],
  );

  const todayBookings = useMemo(
    () =>
      activeBookings
        .filter((b) => b.fromDate <= today && b.toDate >= today)
        .sort((a, b) => a.fromDate.localeCompare(b.fromDate)),
    [activeBookings, today],
  );

  const upcomingBookings = useMemo(
    () =>
      activeBookings
        .filter((b) => b.fromDate > today)
        .sort((a, b) => a.fromDate.localeCompare(b.fromDate)),
    [activeBookings, today],
  );

  const currentBookings = view === "today" ? todayBookings : upcomingBookings;

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return currentBookings;

    return currentBookings.filter((b) =>
      [b.itemName, b.firstName, b.lastName, b.phoneNumber, b.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [currentBookings, search]);

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleStatusChange = (booking: AdminBooking, nextStatus: string) => {
    if (nextStatus === booking.status) return;

    if (nextStatus === "InCustomerCare") {
      onHandover(booking);
    } else if (nextStatus === "Completed") {
      onReturn(booking);
    } else if (nextStatus === "Cleared" && booking.status === "Completed") {
      onClear(booking);
    }
  };

  return (
    <div className="admin-booking-list">
      {/* Header */}
      <div className="booking-header">
        <h2>Bokningar</h2>

        <div className="search-container">
          <button
            className="search-toggle"
            type="button"
            aria-label="Sök bokningar"
            onClick={() => setSearchOpen((prev) => !prev)}
          >
            <Search size={18} />
          </button>

          <input
            className={`search-input ${searchOpen ? "open" : ""}`}
            placeholder="Sök bokningar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            type="search"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="booking-tabs">
        <button
          type="button"
          className={view === "today" ? "active" : ""}
          onClick={() => {
            setView("today");
            setExpandedId(null);
          }}
        >
          Idag <span>{todayBookings.length}</span>
        </button>

        <button
          type="button"
          className={view === "upcoming" ? "active" : ""}
          onClick={() => {
            setView("upcoming");
            setExpandedId(null);
          }}
        >
          Kommande <span>{upcomingBookings.length}</span>
        </button>
      </div>

      {/* Booking list */}
      <div className="booking-scroll">
        {filteredBookings.length === 0 && (
          <div className="booking-empty">
            {search.trim()
              ? "Inga bokningar matchar sökningen"
              : view === "today"
                ? "Inga bokningar idag"
                : "Inga kommande bokningar"}
          </div>
        )}

        {filteredBookings.map((b) => {
          const isExpanded = expandedId === b.id;
          const itemColor = b.color || "#999";

          return (
            <div className="booking-entry" key={b.id}>
              {/* Summary and action */}
              <div className="booking-row">
                <button
                  type="button"
                  className={`booking-summary ${isExpanded ? "expanded" : ""}`}
                  style={{ "--item-color": itemColor } as CSSProperties}
                  onClick={() => toggleExpanded(b.id)}
                  aria-expanded={isExpanded}
                  aria-label={`Visa detaljer för ${b.itemName}`}
                >
                  <span className="booking-item-color" />

                  <span className="booking-summary-content">
                    {/* Product name on its own line */}
                    <span className="booking-main-line">
                      <span className="booking-item-name">{b.itemName}</span>
                    </span>

                    {/* Date, customer and status underneath */}
                    <span className="booking-second-line">
                      <span className="booking-date">
                        {formatDate(b.fromDate)} – {formatDate(b.toDate)}
                      </span>

                      <span className="booking-customer">
                        {b.firstName} {b.lastName}
                      </span>

                      <span
                        className={`booking-status status-${b.status.toLowerCase()}`}
                      >
                        {getStatusLabel(b.status)}
                      </span>
                    </span>
                  </span>
                </button>

                {/* Always visible action */}
                {b.status === "Active" && (
                  <button
                    type="button"
                    className="booking-inline-action"
                    onClick={() => onHandover(b)}
                  >
                    Överlämna
                  </button>
                )}

                {b.status === "InCustomerCare" && (
                  <button
                    type="button"
                    className="booking-inline-action return"
                    onClick={() => onReturn(b)}
                  >
                    Returnera
                  </button>
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="booking-details">
                  <div className="booking-contact">
                    <span>{b.phoneNumber || "Inget telefonnummer"}</span>

                    {b.email && <span>{b.email}</span>}
                  </div>

                  {b.customerNotes && (
                    <div className="booking-message">
                      <span className="booking-message-label">
                        Kundens meddelande
                      </span>

                      <p>{b.customerNotes}</p>
                    </div>
                  )}

                  <div className="booking-status-control">
                    <label htmlFor={`booking-status-${b.id}`}>
                      Ändra status
                    </label>

                    <select
                      id={`booking-status-${b.id}`}
                      value={b.status}
                      onChange={(e) => handleStatusChange(b, e.target.value)}
                    >
                      <option value={b.status}>
                        {getStatusLabel(b.status)}
                      </option>

                      {b.status === "Active" && (
                        <option value="InCustomerCare">Utlämnad</option>
                      )}

                      {b.status === "InCustomerCare" && (
                        <option value="Completed">Återlämnad</option>
                      )}

                      {b.status === "Completed" && (
                        <option value="Cleared">Avslutad</option>
                      )}
                    </select>
                  </div>

                  <div className="booking-actions">
                    <button
                      type="button"
                      className="booking-action-danger"
                      onClick={() => onDelete(b)}
                    >
                      Radera bokning
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
