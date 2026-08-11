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
  const classNames = [
    "calendar-day",
    isSelected ? "selected" : "",
    isDisabled ? "disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const dayNumber = new Date(day.date).getDate();

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
