import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { AdminCalendarDay } from "../types/AdminCalendar";
import type { Item } from "../../../sharedTypes/Item";
import type { CalendarDay } from "../api/calendarAvailabilityApi";

import { createAdminBooking } from "../api/adminBookingApi";
import { getItemAvailability } from "../api/calendarAvailabilityApi";

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
  const [selectedItemId, setSelectedItemId] = useState("");
  const [fromDate, setFromDate] = useState(day.date);
  const [toDate, setToDate] = useState("");

  const [availableDays, setAvailableDays] = useState<CalendarDay[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Lock body scroll while modal is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Check availability whenever the item or pickup date changes.
  useEffect(() => {
    if (!selectedItemId || !fromDate) {
      setAvailableDays([]);
      setAvailabilityError("");
      setAvailabilityLoading(false);
      return;
    }

    let cancelled = false;

    const loadAvailability = async () => {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      setAvailableDays([]);
      setToDate("");

      try {
        const selected = new Date(`${fromDate}T00:00:00`);

        const result = await getItemAvailability(
          selectedItemId,
          selected.getFullYear(),
          selected.getMonth() + 1,
          fromDate,
        );

        if (cancelled) return;

        setAvailableDays(result);

        const pickupDay = result.find((date) => date.date === fromDate);

        if (!pickupDay?.selectable) {
          setFromDate("");
          setToDate("");
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load availability:", error);
        setAvailabilityError("Could not load availability.");
        setAvailableDays([]);
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    };

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [selectedItemId, fromDate]);

  // Selecting another item resets the dates.
  const handleItemChange = (itemId: string) => {
    setSelectedItemId(itemId);
    setFromDate(day.date);
    setToDate("");
    setAvailableDays([]);
    setAvailabilityError("");
  };

  // Validate the return date against backend availability.
  const handleReturnDateChange = async (date: string) => {
    setToDate("");

    if (!date || !selectedItemId || !fromDate || date <= fromDate) {
      return;
    }

    setAvailabilityLoading(true);
    setAvailabilityError("");

    try {
      const selected = new Date(`${date}T00:00:00`);

      const result = await getItemAvailability(
        selectedItemId,
        selected.getFullYear(),
        selected.getMonth() + 1,
        fromDate,
      );

      const returnDay = result.find(
        (availableDay) => availableDay.date === date,
      );

      if (!returnDay?.selectable) {
        setAvailabilityError("The selected return date is unavailable.");
        return;
      }

      setToDate(date);
    } catch (error) {
      console.error("Failed to validate return date:", error);
      setAvailabilityError("Could not verify the selected return date.");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const pickupIsAvailable = availableDays.some(
    (availableDay) => availableDay.date === fromDate && availableDay.selectable,
  );

  const isFormValid =
    !!selectedItemId &&
    !!fromDate &&
    !!toDate &&
    pickupIsAvailable &&
    !!firstName.trim() &&
    !!lastName.trim() &&
    !!phoneNumber.trim() &&
    !availabilityLoading &&
    !availabilityError &&
    !submitting;

  // Create booking.
  const handleCreateBooking = async () => {
    if (!isFormValid) return;

    try {
      setSubmitting(true);

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
    } catch (error) {
      console.error("Failed to create booking:", error);
      setAvailabilityError("Could not create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="admin-day-popup-overlay" onClick={onClose}>
      <div
        className="admin-day-popup"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="create-booking-section">
          <h4>Create Booking</h4>

          <select
            value={selectedItemId}
            onChange={(event) => handleItemChange(event.target.value)}
          >
            <option value="">Select item</option>

            {items
              .filter((item) => item.isActive)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>

          <div className="form-row">
            <div className="field-group">
              <label>From</label>
              <input
                type="date"
                value={fromDate}
                disabled={submitting}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setToDate("");
                  setAvailableDays([]);
                  setAvailabilityError("");
                }}
              />
            </div>

            <div className="field-group">
              <label>To</label>
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                disabled={!pickupIsAvailable || availabilityLoading}
                onChange={(event) =>
                  void handleReturnDateChange(event.target.value)
                }
              />
            </div>
          </div>

          {availabilityLoading && <p>Checking availability...</p>}

          {availabilityError && (
            <p className="availability-error">{availabilityError}</p>
          )}

          {!selectedItemId && <p>Select an item to check available dates.</p>}

          {selectedItemId && !fromDate && !availabilityLoading && (
            <p>The selected day is unavailable. Choose another date.</p>
          )}

          <div className="form-row">
            <input
              placeholder="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />

            <input
              placeholder="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>

          <input
            type="tel"
            placeholder="Phone number"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
          />

          <textarea
            placeholder="Customer note (optional)"
            value={customerNotes}
            onChange={(event) => setCustomerNotes(event.target.value)}
            rows={3}
          />

          <button
            className="btn-primary full-width"
            disabled={!isFormValid}
            onClick={handleCreateBooking}
          >
            {submitting ? "Creating booking..." : "Create Booking (Staff)"}
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
