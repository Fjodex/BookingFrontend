import type { CalendarDay } from "../api/calendar";
import "./calendarDayItem.css";

interface Props {
  day: CalendarDay;
  isSelected: boolean;
  onToggle: (date: string) => void;
}

export default function CalendarDayItem({ day, isSelected, onToggle }: Props) {
  const dayNumber = new Date(day.date).getDate();

  const isDisabled = !day.isSelectable || day.isBooked || day.isBlocked;

  const classNames = [
    "calendar-cell",
    isDisabled && "disabled",
    day.isBooked && "booked",
    day.isBlocked && "blocked",
    isSelected && "selected",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classNames}
      disabled={isDisabled}
      onClick={() => !isDisabled && onToggle(day.date)}
    >
      {dayNumber}
    </button>
  );
}
