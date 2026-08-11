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
     FIRST DAY OFFSET
     ============================================================ */

  const firstDate = new Date(days[0].date);

  /*
   * Convert Sunday-first JS calendar
   * to Monday-first.
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
          /* ==================================================
             EMPTY PLACEHOLDER
             ================================================== */

          if (!day) {
            return <div key={`empty-${index}`} className="calendar-empty" />;
          }

          /* ==================================================
             SELECTED
             ================================================== */

          const isSelected = selectedRange.includes(day.date);

          /* ==================================================
             DISABLED
             ================================================== */

          /*
           * The backend now decides whether a date
           * is selectable.
           *
           * We therefore don't check bookings or
           * opening hours here.
           */

          const isDisabled = !day.selectable;

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
