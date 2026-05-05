import { useMemo, useState } from "react";
import type { AdminBooking } from "../types/AdminBooking";
import "./adminBookingList.css";

type Props = {
  bookings: AdminBooking[];
  onHandover: (b: AdminBooking) => void;
  onReturn: (b: AdminBooking) => void;
  onClear: (b: AdminBooking) => void;
  onDelete: (b: AdminBooking) => void;
};

export default function AdminBookingList({
  bookings,
  onHandover,
  onReturn,
  onClear,
  onDelete,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  twoWeeksAgo.setHours(0, 0, 0, 0);

  const filteredBookings = useMemo(() => {
    const visibleBookings = bookings.filter((b) => b.status !== "Completed");

    if (!search.trim()) return visibleBookings;

    const q = search.toLowerCase();

    return visibleBookings.filter((b) =>
      `${b.firstName ?? ""} ${b.lastName ?? ""} ${b.phoneNumber ?? ""} ${b.email ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [bookings, search]);

  return (
    <div className="booking-panel">
      <div className="booking-header">
        <h2>Bokningar</h2>

        <div className="search-container">
          <button
            className="search-toggle"
            onClick={() => setSearchOpen((prev) => !prev)}
          >
            🔍
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

      <div className="booking-scroll">
        {filteredBookings.length === 0 && (
          <div className="booking-empty">Inga bokningar hittades</div>
        )}

        {filteredBookings.map((b) => {
          const bookingDate = new Date(b.bookingDate);
          bookingDate.setHours(0, 0, 0, 0);

          const isOlderThanToday = bookingDate < today;
          const isOlderThanTwoWeeks = bookingDate < twoWeeksAgo;

          return (
            <div
              key={b.id}
              className={`booking-card
                ${isOlderThanToday ? "booking-warning" : ""}
                ${isOlderThanTwoWeeks ? "booking-danger" : ""}
              `}
            >
              <div className="item">{b.itemName}</div>

              <div className="date">
                {bookingDate.toLocaleDateString("sv-SE")}
              </div>

              <div className="name">
                {b.firstName} {b.lastName}
              </div>

              <div className="phone">{b.phoneNumber ?? "-"}</div>

              <div className="email">{b.email}</div>

              <div className="action">
                {b.status === "Active" && (
                  <button className="btn-primary" onClick={() => onHandover(b)}>
                    Överlämnad
                  </button>
                )}

                {b.status === "InCustomerCare" && (
                  <button className="btn-primary" onClick={() => onReturn(b)}>
                    Returnerad
                  </button>
                )}
              </div>

              <div className="delete">
                {b.status === "Active" && (
                  <button className="btn-danger" onClick={() => onDelete(b)}>
                    Radera
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
