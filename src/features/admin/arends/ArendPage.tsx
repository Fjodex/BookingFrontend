import { useEffect, useState } from "react";

import { getBookingHistory } from "../booking/api/adminBookingApi";
import type { AdminBooking } from "../booking/types/AdminBooking";

import CreateArendModal from "./components/CreateArendModal";
import ArendBoard from "./components/ArendBoard";

import "./arendPage.css";

export default function ArendPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null,
  );

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    const data = await getBookingHistory();

    const filtered = data
      .filter((b) => b.status === "InCustomerCare" || b.status === "Completed")
      .sort(
        (a, b) => new Date(b.toDate).getTime() - new Date(a.toDate).getTime(),
      );

    setBookings(filtered);
  }

  function handleCreateArend(booking: AdminBooking) {
    setSelectedBooking(booking);
  }

  return (
    <div className="arend-page">
      <div className="arend-layout">
        {/* BOOKINGS PANEL */}

        <div className="arend-bookings">
          <h2>Bokningar</h2>

          {bookings.length === 0 && (
            <div className="arend-empty">Inga bokningar tillgängliga</div>
          )}

          {bookings.map((booking) => (
            <div key={booking.id} className="booking-row">
              <div className="booking-item">{booking.itemName}</div>

              <div className="booking-customer">
                {booking.firstName} {booking.lastName}
              </div>

              <div className="booking-phone">{booking.phoneNumber}</div>

              <div className="booking-email">{booking.email}</div>

              <div className="booking-date">
                {new Date(booking.toDate).toLocaleDateString("sv-SE")}
              </div>

              <div className="booking-status">{booking.status}</div>

              <button
                className="create-arend-button"
                onClick={() => handleCreateArend(booking)}
              >
                Ärende
              </button>
            </div>
          ))}
        </div>

        {/* AREND BOARD */}

        <ArendBoard />
      </div>

      {/* CREATE AREND MODAL */}

      {selectedBooking && (
        <CreateArendModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCreated={loadBookings}
        />
      )}
    </div>
  );
}
