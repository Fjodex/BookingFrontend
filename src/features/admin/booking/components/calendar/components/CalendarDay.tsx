import type { AdminBooking } from "../../../types/AdminBooking";
import type { AdminCalendarDay } from "../../../types/AdminCalendar";

import CalendarBooking from "./CalendarBooking";
import { parseLocalDate, getDateStatus } from "../../../utils/calendarUtils";

interface Props {
  day: AdminCalendarDay;
  onDayClick: (day: AdminCalendarDay) => void;
  onBookingClick: (booking: AdminBooking) => void;
}

export default function CalendarDay({
  day,
  onDayClick,
  onBookingClick,
}: Props) {
  const date = parseLocalDate(day.date);
  const { isPast, isToday } = getDateStatus(date);

  return (
    <div
      className={`
        calendar-day
        ${day.isClosed ? "closed" : ""}
        ${isPast ? "past" : "future"}
        ${isToday ? "today" : ""}
      `}
      onClick={() => onDayClick(day)}
    >
      <div className="day-number">{date.getDate()}</div>

      {day.isClosed && <div className="closed-label">Stängt</div>}

      <div className="calendar-bookings">
        {day.bookings.slice(0, 3).map((booking) => (
          <div key={booking.id} onClick={(event) => event.stopPropagation()}>
            <CalendarBooking booking={booking} onClick={onBookingClick} />
          </div>
        ))}
      </div>

      {day.bookings.length > 3 && (
        <div className="booking-counter">+{day.bookings.length - 3} fler</div>
      )}
    </div>
  );
}
