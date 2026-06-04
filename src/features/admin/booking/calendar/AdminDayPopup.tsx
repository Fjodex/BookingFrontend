import { useState } from "react";
import { createPortal } from "react-dom";
import type { AdminCalendarDay } from "../types/AdminCalendar";
import type { Item } from "../../../sharedTypes/Item";
import { createAdminBooking } from "../api/adminBookingApi";

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
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [fromDate] = useState(day.date);

  const [toDate, setToDate] = useState(day.date);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const hasBookings = day.bookings.length > 0;

  const bookedItemIds = day.bookings.map((b) => b.itemId);

  const availableItems = items.filter(
    (i) => i.isActive && !bookedItemIds.includes(i.id),
  );

  const isFormValid =
    selectedItemId && firstName.trim() && lastName.trim() && phoneNumber.trim();

  const handleCreateBooking = async () => {
    if (!isFormValid) return;

    await createAdminBooking({
      itemId: selectedItemId,
      fromDate,
      toDate,
      firstName,
      lastName,
      phoneNumber,
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
        <div className="form-row">
          <div className="field-group">
            <label>From</label>

            <input type="date" value={fromDate} disabled />
          </div>

          <div className="field-group">
            <label>To</label>

            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
        {/* BOOKING FORM */}
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
