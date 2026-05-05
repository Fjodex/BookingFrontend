import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./bookingEditModal.css";
import { getCalendarMonth } from "../../../public/booking/api/calendar";
import type { AdminBooking } from "../types/AdminBooking";

type Props = {
  booking: AdminBooking;
  onClose: () => void;
  onSave: (updated: {
    status: AdminBooking["status"];
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    customerNotes: string;
    bookingDate: string;
  }) => Promise<void>;
  onDelete: (booking: AdminBooking) => Promise<void>;
};

type CalendarDay = {
  date: string;
  isBooked: boolean;
  isSelectable: boolean;
  isBlocked: boolean;
};

export default function BookingEditModal({
  booking,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const bookingDateObj = new Date(booking.bookingDate);

  const [status, setStatus] = useState(booking.status);
  const [firstName, setFirstName] = useState(booking.firstName ?? "");
  const [lastName, setLastName] = useState(booking.lastName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(booking.phoneNumber ?? "");
  const [email, setEmail] = useState(booking.email ?? "");
  const [customerNotes, setCustomerNotes] = useState(
    booking.customerNotes ?? "",
  );

  const [selectedDate] = useState(booking.bookingDate);
  const [loading, setLoading] = useState(false);

  const [viewYear] = useState(bookingDateObj.getFullYear());
  const [viewMonth] = useState(bookingDateObj.getMonth() + 1);
  const [, setCalendarDays] = useState<CalendarDay[]>([]);
  const [, setShowCalendar] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    getCalendarMonth(booking.itemId, viewYear, viewMonth).then((data) => {
      setCalendarDays(data.days);
    });
  }, [booking.itemId, viewYear, viewMonth]);

  const isValid =
    firstName.trim() && lastName.trim() && phoneNumber.trim() && email.trim();

  const handleSave = async () => {
    if (!isValid) return;

    setLoading(true);

    await onSave({
      status,
      firstName,
      lastName,
      phoneNumber,
      email,
      customerNotes,
      bookingDate: selectedDate,
    });

    setLoading(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this booking?"))
      return;

    setLoading(true);
    await onDelete(booking);
    setLoading(false);
    onClose();
  };

  return createPortal(
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h3>{booking.itemName}</h3>

        <label>Date</label>
        <button
          type="button"
          className="date-button"
          disabled={loading}
          onClick={() => setShowCalendar((prev) => !prev)}
        >
          {new Date(selectedDate).toLocaleDateString("sv-SE")}
        </button>

        <label>First name</label>
        <input
          disabled={loading}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label>Last name</label>
        <input
          disabled={loading}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <label>Phone number</label>
        <input
          disabled={loading}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        <label>Email</label>
        <input
          type="email"
          disabled={loading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Customer note</label>
        <textarea
          disabled={loading}
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          rows={3}
        />

        <label>Status</label>
        <select
          disabled={loading}
          value={status}
          onChange={(e) => setStatus(e.target.value as AdminBooking["status"])}
        >
          <option value="Active">Active</option>
          <option value="InCustomerCare">In customer’s care</option>
          <option value="Completed">Completed</option>
        </select>

        <div className="modal-actions">
          <button disabled={!isValid || loading} onClick={handleSave}>
            Save
          </button>

          <button disabled={loading} onClick={onClose} className="secondary">
            Cancel
          </button>
        </div>

        {booking.status === "Active" && (
          <div className="delete-section">
            <button
              disabled={loading}
              className="delete-button"
              onClick={handleDelete}
            >
              Delete Booking
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
