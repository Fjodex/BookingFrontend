import { useState } from "react";

import type { AdminBooking } from "../types/AdminBooking";
import type { AdminCalendarDay } from "../types/AdminCalendar";

import { Mail } from "lucide-react";

import "./adminCalendar.css";

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

interface Props {
  days: AdminCalendarDay[];

  year: number;
  month: number;

  setYear: React.Dispatch<React.SetStateAction<number>>;

  setMonth: React.Dispatch<React.SetStateAction<number>>;

  onBookingClick: (booking: AdminBooking) => void;

  onDayClick: (day: AdminCalendarDay) => void;
}

export default function AdminCalendar({
  days,
  year,
  month,
  setYear,
  setMonth,
  onBookingClick,
  onDayClick,
}: Props) {
  const [activeNote, setActiveNote] = useState<string | null>(null);

  /* ============================================================
     LOADING
     ============================================================ */

  if (!days.length) {
    return <div className="calendar-loading">Laddar kalender…</div>;
  }

  /* ============================================================
     DATE SETUP
     ============================================================ */

  const firstDay = new Date(days[0].date);

  const startOffset = (firstDay.getDay() + 6) % 7;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const totalCells = 42;

  const trailingEmpty = Math.max(0, totalCells - (startOffset + days.length));

  const monthLabel = new Date(year, month - 1).toLocaleDateString("sv-SE", {
    month: "long",
    year: "numeric",
  });

  const capitalizedMonth =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="admin-calendar">
      {/* ========================================================
          HEADER
          ======================================================== */}

      <div className="calendar-header">
        <button
          onClick={() =>
            month === 1
              ? (setMonth(12), setYear((y) => y - 1))
              : setMonth((m) => m - 1)
          }
        >
          ←
        </button>

        <strong>{capitalizedMonth}</strong>

        <button
          onClick={() =>
            month === 12
              ? (setMonth(1), setYear((y) => y + 1))
              : setMonth((m) => m + 1)
          }
        >
          →
        </button>
      </div>

      {/* ========================================================
          WEEKDAYS
          ======================================================== */}

      <div className="calendar-weekdays">
        {WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* ========================================================
          GRID
          ======================================================== */}

      <div className="calendar-grid">
        {/* EMPTY START CELLS */}

        {Array.from({
          length: startOffset,
        }).map((_, i) => (
          <div key={`empty-start-${i}`} className="calendar-empty" />
        ))}

        {/* DAYS */}

        {days.map((day) => {
          const dateObj = new Date(day.date);

          dateObj.setHours(0, 0, 0, 0);

          const isPast = dateObj < today;

          const isToday = dateObj.getTime() === today.getTime();

          return (
            <div
              key={day.date}
              className={`
                calendar-day
                ${day.isClosed ? "closed" : ""}
                ${isPast ? "past" : "future"}
                ${isToday ? "today" : ""}
              `}
              onClick={() => onDayClick(day)}
            >
              {/* DAY NUMBER */}

              <div className="day-number">{dateObj.getDate()}</div>

              {/* CLOSED LABEL */}

              {day.isClosed && <div className="closed-label">Stängt</div>}

              {/* BOOKINGS */}

              <div className="calendar-bookings">
                {day.bookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="calendar-booking"
                    style={{
                      backgroundColor: booking.color,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();

                      onBookingClick(booking);
                    }}
                  >
                    <div className="booking-main">
                      <span className="booking-name">
                        {booking.firstName} {booking.lastName}
                      </span>

                      {booking.customerNotes && (
                        <span
                          className="note-icon"
                          onClick={(e) => {
                            e.stopPropagation();

                            setActiveNote(booking.customerNotes ?? null);
                          }}
                        >
                          <Mail size={14} strokeWidth={2} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* BOOKING COUNTER */}

              {day.bookings.length > 3 && (
                <div className="booking-counter">
                  +{day.bookings.length - 3} fler
                </div>
              )}
            </div>
          );
        })}

        {/* EMPTY END CELLS */}

        {Array.from({
          length: trailingEmpty,
        }).map((_, i) => (
          <div key={`empty-end-${i}`} className="calendar-empty" />
        ))}
      </div>

      {/* ============================================================
          NOTE POPUP
          ============================================================ */}

      {activeNote && (
        <div className="note-overlay" onClick={() => setActiveNote(null)}>
          <div className="note-popup" onClick={(e) => e.stopPropagation()}>
            <div className="note-header">Customer Note</div>

            <div className="note-body">{activeNote}</div>

            <button className="note-close" onClick={() => setActiveNote(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
