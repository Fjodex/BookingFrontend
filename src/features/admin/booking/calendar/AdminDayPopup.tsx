import { useState } from "react";
import { createPortal } from "react-dom";
import type { AdminCalendarDay } from "../types/AdminCalendar";
import type { Item } from "../../../sharedTypes/Item";
import { toggleBlockedDay, createAdminBooking } from "../api/adminBookingApi";

import "./adminDayPopup.css";

type Props = {
  day: AdminCalendarDay;
  items: Item[];
  onClose: () => void;
  onRefresh: () => void;
};

export default function AdminDayPopup({
  day,
  items,
  onClose,
  onRefresh,
}: Props) {
  const [isBlocked, setIsBlocked] = useState(day.isBlocked);
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const hasBookings = day.bookings.length > 0;

  const bookedItemIds = day.bookings.map((b) => b.itemId);

  const availableItems = items.filter(
    (i) => i.isActive && !bookedItemIds.includes(i.id),
  );

  const isFormValid =
    selectedItemId &&
    firstName.trim() &&
    lastName.trim() &&
    phoneNumber.trim() &&
    email.trim();

  const handleToggleBlocked = async () => {
    await toggleBlockedDay(day.date);
    setIsBlocked((prev) => !prev);
    await onRefresh();
  };

  const handleCreateBooking = async () => {
    if (!isFormValid) return;

    await createAdminBooking({
      itemId: selectedItemId,
      date: day.date,
      firstName,
      lastName,
      phoneNumber,
      email,
      customerNotes,
    });

    await onRefresh();
    onClose();
  };

  return createPortal(
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup-content admin-day-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="popup-title">
          {new Date(day.date).toLocaleDateString("sv-SE")}
        </h3>

        {/* BLOCK TOGGLE */}
        <div className="block-toggle-section">
          <label className="checkbox-row">
            <span>Stängt / Spärrad</span>
            <input
              type="checkbox"
              checked={isBlocked}
              disabled={hasBookings}
              onChange={handleToggleBlocked}
            />
          </label>

          {hasBookings && (
            <div className="block-warning">
              Cannot block this date because it has bookings.
            </div>
          )}
        </div>

        {/* EXISTING BOOKINGS */}
        {day.bookings.length > 0 && (
          <div className="existing-bookings">
            <h4>Bookings</h4>

            {day.bookings.map((b) => (
              <div key={b.id} className="booking-mini-card">
                <div className="mini-booking-item">{b.itemName}</div>
                <div className="mini-booking-name">
                  {b.firstName} {b.lastName}
                </div>
                <div className="mini-booking-status">{b.status}</div>
              </div>
            ))}
          </div>
        )}

        {/* BOOKING FORM */}
        {!isBlocked && (
          <div className="create-booking-section">
            <h4>Create Booking</h4>

            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
            >
              <option value="">Select item</option>
              {availableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <div className="form-row">
              <input
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />

              <input
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <input
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <textarea
              placeholder="Customer note (optional)"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              rows={3}
            />

            <button
              className="btn-primary full-width"
              disabled={!isFormValid}
              onClick={handleCreateBooking}
            >
              Create Booking (Staff)
            </button>
          </div>
        )}

        <div className="modal-actions">
          <button className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
