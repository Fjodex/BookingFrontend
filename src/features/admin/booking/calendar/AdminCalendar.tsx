import { useState } from "react";
import type { AdminBooking } from "../types/AdminBooking";
import type { AdminCalendarDay } from "../types/AdminCalendar";
import "./adminCalendar.css";

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

interface Props {
  days: AdminCalendarDay[];
  year: number;
  month: number;
  setYear: React.Dispatch<React.SetStateAction<number>>;
  setMonth: React.Dispatch<React.SetStateAction<number>>;
  visibleItemIds: Set<string>;
  onBookingClick: (booking: AdminBooking) => void;
  onDayClick: (day: AdminCalendarDay) => void;
}

export default function AdminCalendar({
  days,
  year,
  month,
  setYear,
  setMonth,
  visibleItemIds,
  onBookingClick,
  onDayClick,
}: Props) {
  const [activeNote, setActiveNote] = useState<string | null>(null);

  if (!days.length) {
    return <div className="calendar-loading">Laddar kalender…</div>;
  }

  const firstDay = new Date(days[0].date);
  const startOffset = (firstDay.getDay() + 6) % 7;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalCells = 42;
  const trailingEmpty = totalCells - (startOffset + days.length);

  const monthLabel = new Date(year, month - 1).toLocaleDateString("sv-SE", {
    month: "long",
    year: "numeric",
  });

  const capitalizedMonth =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <div className="admin-calendar">
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

      <div className="calendar-weekdays">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-start-${i}`} className="calendar-empty" />
        ))}

        {days.map((day) => {
          const dateObj = new Date(day.date);
          dateObj.setHours(0, 0, 0, 0);

          const isPast = dateObj < today;
          const isToday = dateObj.getTime() === today.getTime();

          const filteredBookings = day.bookings.filter((b) =>
            visibleItemIds.has(b.itemId),
          );

          return (
            <div
              key={day.date}
              className={`calendar-day
                ${day.isBlocked ? "blocked" : ""}
                ${isPast ? "past" : "future"}
                ${isToday ? "today" : ""}
              `}
              onClick={() => onDayClick(day)}
            >
              <div className="day-number">{dateObj.getDate()}</div>

              <div className="calendar-bookings">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="calendar-booking"
                    style={{ backgroundColor: b.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingClick(b);
                    }}
                  >
                    <span className="booking-name">
                      {b.firstName} {b.lastName}
                    </span>

                    {b.customerNotes && (
                      <span
                        className="note-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveNote(b.customerNotes || null);
                        }}
                      >
                        (!)
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {filteredBookings.length > 3 && (
                <div className="booking-counter">
                  {filteredBookings.length} bookings
                </div>
              )}
            </div>
          );
        })}

        {Array.from({ length: trailingEmpty }).map((_, i) => (
          <div key={`empty-end-${i}`} className="calendar-empty" />
        ))}
      </div>

      {/* NOTE POPUP */}
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
