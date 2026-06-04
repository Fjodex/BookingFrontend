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
  /* ============================================================
     STATE
     ============================================================ */

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

  /* ============================================================
     LOCK BODY SCROLL
     ============================================================ */

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  /* ============================================================
     VALIDATION
     ============================================================ */

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    phoneNumber.trim() &&
    fromDate &&
    toDate &&
    new Date(toDate) > new Date(fromDate);

  /* ============================================================
     SAVE
     ============================================================ */

  const handleSave = async () => {
    if (!isValid) {
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
      console.error("Failed to save booking", err);

      setError("Failed to save booking.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     DELETE
     ============================================================ */

  const handleDelete = async () => {
    const confirmed = confirm(
      "Are you sure you want to permanently delete this booking?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await onDelete(booking);

      onClose();
    } catch (err) {
      console.error("Failed to delete booking", err);

      setError("Failed to delete booking.");
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     HELPERS
     ============================================================ */

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("sv-SE");
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return createPortal(
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        {/* ======================================================
            HEADER
            ====================================================== */}

        <h3>{booking.itemName}</h3>

        <div className="booking-range-preview">
          {formatDate(fromDate)} → {formatDate(toDate)}
        </div>

        {/* ======================================================
            FROM DATE
            ====================================================== */}

        <label>Pickup Date</label>

        <input
          type="date"
          disabled={loading}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        {/* ======================================================
            TO DATE
            ====================================================== */}

        <label>Return Date</label>

        <input
          type="date"
          disabled={loading}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        {/* ======================================================
            CUSTOMER INFO
            ====================================================== */}

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

        {/* ======================================================
            NOTES
            ====================================================== */}

        <label>Customer note</label>

        <textarea
          disabled={loading}
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          rows={4}
        />

        {/* ======================================================
            STATUS
            ====================================================== */}

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

        {/* ======================================================
            ERROR
            ====================================================== */}

        {error && <div className="modal-error">{error}</div>}

        {/* ======================================================
            ACTIONS
            ====================================================== */}

        <div className="modal-actions">
          <button disabled={!isValid || loading} onClick={handleSave}>
            {loading ? "Saving..." : "Save"}
          </button>

          <button disabled={loading} onClick={onClose} className="secondary">
            Cancel
          </button>
        </div>

        {/* ======================================================
            DELETE
            ====================================================== */}

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
