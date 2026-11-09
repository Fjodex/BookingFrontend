import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import "./bookingEditModal.css";

import type { AdminBooking } from "../types/AdminBooking";

type Props = {
  booking: AdminBooking;
  onClose: () => void;

  onSave: (updated: {
    status: AdminBooking["status"];
    firstName: string;
    lastName: string;
    phoneNumber: string;
    customerNotes: string;
    fromDate: string;
    toDate: string;
  }) => Promise<void>;

  onDelete: (booking: AdminBooking) => Promise<void>;
};

export default function BookingEditModal({
  booking,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [status, setStatus] = useState(booking.status);

  const [firstName, setFirstName] = useState(booking.firstName ?? "");
  const [lastName, setLastName] = useState(booking.lastName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(booking.phoneNumber ?? "");
  const [customerNotes, setCustomerNotes] = useState(
    booking.customerNotes ?? "",
  );

  const [fromDate, setFromDate] = useState(booking.fromDate);
  const [toDate, setToDate] = useState(booking.toDate);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll while modal is open.
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const isValid =
    !!firstName.trim() &&
    !!lastName.trim() &&
    !!phoneNumber.trim() &&
    !!fromDate &&
    !!toDate &&
    toDate > fromDate;

  // Save booking.
  const handleSave = async () => {
    if (!isValid || loading) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      await onSave({
        status,
        firstName,
        lastName,
        phoneNumber,
        customerNotes,
        fromDate,
        toDate,
      });

      onClose();
    } catch (err) {
      console.error("Failed to save booking:", err);
      setError("Failed to save booking.");
    } finally {
      setLoading(false);
    }
  };

  // Delete booking.
  const handleDelete = async () => {
    if (loading) return;

    const confirmed = confirm(
      "Are you sure you want to permanently delete this booking?",
    );

    if (!confirmed) return;

    try {
      setError(null);
      setLoading(true);

      await onDelete(booking);

      onClose();
    } catch (err) {
      console.error("Failed to delete booking:", err);
      setError("Failed to delete booking.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="admin-booking-edit-overlay" onClick={onClose}>
      <div className="admin-booking-edit" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}

        <div className="edit-booking-header">
          <h3>{booking.itemName}</h3>
          <p>Edit Booking</p>
        </div>

        {/* BOOKING INFORMATION */}

        <div className="edit-booking-section">
          <h4>Booking Information</h4>

          <div className="form-row">
            <div className="field-group">
              <label>Pickup Date</label>
              <input
                type="date"
                disabled={loading}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Return Date</label>
              <input
                type="date"
                min={fromDate}
                disabled={loading}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="booking-range-preview">
            {fromDate} → {toDate}
          </div>
        </div>

        {/* CUSTOMER INFORMATION */}

        <div className="edit-booking-section">
          <h4>Customer Information</h4>

          <div className="form-row">
            <input
              placeholder="First name"
              disabled={loading}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <input
              placeholder="Last name"
              disabled={loading}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <input
            type="tel"
            placeholder="Phone number"
            disabled={loading}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        {/* CUSTOMER NOTES */}

        <div className="edit-booking-section">
          <h4>Customer Notes</h4>

          <textarea
            placeholder="Customer note (optional)"
            disabled={loading}
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* BOOKING STATUS */}

        <div className="edit-booking-section">
          <h4>Booking Status</h4>

          <select
            disabled={loading}
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as AdminBooking["status"])
            }
          >
            <option value="Active">Active</option>
            <option value="InCustomerCare">In customer's care</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* ERROR */}

        {error && <p className="availability-error">{error}</p>}

        {/* ACTIONS */}

        <div className="edit-booking-actions">
          <button
            className="btn-primary"
            disabled={!isValid || loading}
            onClick={handleSave}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button className="secondary" disabled={loading} onClick={onClose}>
            Cancel
          </button>
        </div>

        {/* DELETE */}

        {booking.status === "Active" && (
          <div className="edit-booking-delete">
            <button
              className="delete-button"
              disabled={loading}
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
