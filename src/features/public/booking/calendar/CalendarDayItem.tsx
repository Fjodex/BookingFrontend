import type { CalendarDay } from "../api/calendar";

interface Props {
  day: CalendarDay;

  isSelected: boolean;

  isDisabled: boolean;

  onSelect: (date: string) => void;
}

export default function CalendarDayItem({
  day,
  isSelected,
  isDisabled,
  onSelect,
}: Props) {
  /* ============================================================
     STATE
     ============================================================ */

  const isBooked = day.isBooked;

  const isClosed = !day.canReturn;

  /* ============================================================
     CLASSNAMES
     ============================================================ */

  const classNames = [
    "calendar-day",

    isSelected ? "selected" : "",

    isBooked ? "booked" : "",

    isClosed ? "closed" : "",

    isDisabled ? "disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  /* ============================================================
     DAY NUMBER
     ============================================================ */

  const dayNumber = new Date(day.date).getDate();

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <button
      type="button"
      className={classNames}
      disabled={isDisabled}
      onClick={() => onSelect(day.date)}
    >
      <span>{dayNumber}</span>
    </button>
  );
}
