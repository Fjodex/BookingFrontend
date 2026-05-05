import { useEffect, useState } from "react";
import Calendar from "./Calendar";
import { getCalendarMonth, type CalendarDay } from "../api/calendar";
import "./calendarContainer.css";
interface Props {
  itemId: string;
  selectedDates: string[];
  onToggleDate: (date: string) => void;
}

export default function CalendarContainer({
  itemId,
  selectedDates,
  onToggleDate,
}: Props) {
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1–12
  const [days, setDays] = useState<CalendarDay[]>([]);

  useEffect(() => {
    getCalendarMonth(itemId, year, month).then((res) => {
      setDays(res.days);
    });
  }, [itemId, year, month]);

  const nextMonth = () => {
    setMonth((m) => (m === 12 ? 1 : m + 1));
    if (month === 12) setYear((y) => y + 1);
  };

  const prevMonth = () => {
    setMonth((m) => (m === 1 ? 12 : m - 1));
    if (month === 1) setYear((y) => y - 1);
  };

  return (
    <div className="calendar-panel">
      <div className="calendar-nav">
        <button
          className="calendar-nav-button"
          onClick={prevMonth}
          aria-label="Föregående månad"
        >
          ‹
        </button>

        <div className="calendar-nav-title">
          {new Date(year, month - 1).toLocaleDateString("sv-SE", {
            month: "long",
            year: "numeric",
          })}
        </div>

        <button
          className="calendar-nav-button"
          onClick={nextMonth}
          aria-label="Nästa månad"
        >
          ›
        </button>
      </div>

      <Calendar
        days={days}
        selectedDates={selectedDates}
        onToggleDate={onToggleDate}
      />
    </div>
  );
}
