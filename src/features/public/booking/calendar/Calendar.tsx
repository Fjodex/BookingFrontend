import CalendarDayItem from "./CalendarDayItem";
import "./calendar.css";
import type { CalendarDay } from "../api/calendar";

interface Props {
  days: CalendarDay[];
  selectedDates: string[];
  onToggleDate: (date: string) => void;
}

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

export default function Calendar({ days, selectedDates, onToggleDate }: Props) {
  if (!days.length) return null;

  const firstDate = new Date(days[0].date);
  const mondayIndex = (firstDate.getDay() + 6) % 7;

  const totalCells = 42;
  const filledDays: (CalendarDay | null)[] = [];

  for (let i = 0; i < mondayIndex; i++) {
    filledDays.push(null);
  }

  days.forEach((d) => filledDays.push(d));

  while (filledDays.length < totalCells) {
    filledDays.push(null);
  }

  return (
    <div className="calendar-content">
      {/* WEEKDAY HEADER */}
      <div className="calendar-weekdays">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="calendar-grid">
        {filledDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="calendar-empty" />;
          }

          return (
            <CalendarDayItem
              key={day.date}
              day={day}
              isSelected={selectedDates.includes(day.date)}
              onToggle={onToggleDate}
            />
          );
        })}
      </div>
    </div>
  );
}
