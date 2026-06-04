import CalendarDayItem from "./CalendarDayItem";

import "./calendar.css";

import type { CalendarDay } from "../api/calendar";

interface Props {
  days: CalendarDay[];

  selectedRange: string[];

  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

export default function Calendar({ days, selectedRange, onSelectDate }: Props) {
  /* ============================================================
     LOADING
     ============================================================ */

  if (!days.length) {
    return null;
  }

  /* ============================================================
     BOOKING RULES
     ============================================================ */

  const BOOKING_CUTOFF_HOUR = 17;

  /*
   * local yyyy-mm-dd
   */

  const toLocalISODate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /*
   * past date
   * or today after cutoff
   */

  const isPastBookingDate = (date: string) => {
    const now = new Date();

    const today = toLocalISODate(now);

    /*
     * before today
     */

    if (date < today) {
      return true;
    }

    /*
     * today after cutoff
     */

    if (date === today && now.getHours() >= BOOKING_CUTOFF_HOUR) {
      return true;
    }

    return false;
  };

  /* ============================================================
     FIRST DAY OFFSET
     ============================================================ */

  const firstDate = new Date(days[0].date);

  /*
   * Convert Sunday-first JS calendar
   * to Monday-first
   */

  const mondayIndex = (firstDate.getDay() + 6) % 7;

  /* ============================================================
     GRID
     ============================================================ */

  const totalCells = 42;

  const filledDays: (CalendarDay | null)[] = [];

  /* ============================================================
     LEADING EMPTY CELLS
     ============================================================ */

  for (let i = 0; i < mondayIndex; i++) {
    filledDays.push(null);
  }

  /* ============================================================
     ACTUAL DAYS
     ============================================================ */

  days.forEach((day) => {
    filledDays.push(day);
  });

  /* ============================================================
     TRAILING EMPTY CELLS
     ============================================================ */

  while (filledDays.length < totalCells) {
    filledDays.push(null);
  }

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="calendar-content">
      {/* ======================================================
          WEEKDAY HEADER
          ====================================================== */}

      <div className="calendar-weekdays">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="calendar-weekday">
            {weekday}
          </div>
        ))}
      </div>

      {/* ======================================================
          CALENDAR GRID
          ====================================================== */}

      <div className="calendar-grid">
        {filledDays.map((day, index) => {
          /*
           * empty placeholder
           */

          if (!day) {
            return <div key={`empty-${index}`} className="calendar-empty" />;
          }

          /*
           * selected
           */

          const isSelected = selectedRange.includes(day.date);

          /*
           * disabled
           */

          const isDisabled = isPastBookingDate(day.date) || day.isBooked;

          return (
            <CalendarDayItem
              key={day.date}
              day={day}
              isSelected={isSelected}
              isDisabled={isDisabled}
              onSelect={onSelectDate}
            />
          );
        })}
      </div>
    </div>
  );
}
