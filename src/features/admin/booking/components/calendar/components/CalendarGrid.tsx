import type { AdminBooking } from "../../../types/AdminBooking";
import type { AdminCalendarDay } from "../../../types/AdminCalendar";

import CalendarDay from "./CalendarDay";

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

interface Props {
  days: AdminCalendarDay[];
  onDayClick: (day: AdminCalendarDay) => void;
  onBookingClick: (booking: AdminBooking) => void;
}

export default function CalendarGrid({
  days,
  onDayClick,
  onBookingClick,
}: Props) {
  const firstDay = new Date(days[0].date + "T00:00:00");

  const startOffset = (firstDay.getDay() + 6) % 7;

  const totalCells = 42;

  const trailingEmpty = Math.max(0, totalCells - (startOffset + days.length));

  return (
    <>
      <div className="calendar-weekdays">
        {WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {/* Empty cells before the first day */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-start-${i}`} className="calendar-empty" />
        ))}

        {/* Calendar days */}
        {days.map((day) => (
          <CalendarDay
            key={day.date}
            day={day}
            onDayClick={onDayClick}
            onBookingClick={onBookingClick}
          />
        ))}

        {/* Empty cells after the last day */}
        {Array.from({ length: trailingEmpty }).map((_, i) => (
          <div key={`empty-end-${i}`} className="calendar-empty" />
        ))}
      </div>
    </>
  );
}
