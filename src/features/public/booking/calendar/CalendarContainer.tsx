import { useEffect, useState } from "react";

import Calendar from "./Calendar";

import { getCalendarMonth, type CalendarDay } from "../api/calendar";

import "./calendarContainer.css";

interface Props {
  selectedRange: string[];

  onSelect: (date: string) => void;
}

export default function CalendarContainer({ selectedRange, onSelect }: Props) {
  /* ============================================================
     INITIAL DATE
     ============================================================ */

  const now = new Date();

  /* ============================================================
     STATE
     ============================================================ */

  const [year, setYear] = useState(now.getFullYear());

  const [month, setMonth] = useState(now.getMonth() + 1);

  const [days, setDays] = useState<CalendarDay[]>([]);

  /* ============================================================
     SELECTED DATE
     ============================================================ */

  /*
   * The first date in selectedRange is the pickup date.
   *
   * When no date is selected:
   *     selectedDate = undefined
   *
   * When a pickup date is selected:
   *     selectedDate = pickup date
   */
  const selectedDate = selectedRange.length > 0 ? selectedRange[0] : undefined;

  /* ============================================================
     LOAD CALENDAR
     ============================================================ */

  useEffect(() => {
    getCalendarMonth(year, month, selectedDate).then((res) => {
      setDays(res.days);
    });
  }, [year, month, selectedDate]);

  /* ============================================================
     NEXT MONTH
     ============================================================ */

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);

      return;
    }

    setMonth((m) => m + 1);
  };

  /* ============================================================
     PREVIOUS MONTH
     ============================================================ */

  const prevMonth = () => {
    const current = new Date();

    const currentYear = current.getFullYear();

    const currentMonth = current.getMonth() + 1;

    /*
     * Prevent navigating before the current month.
     */
    if (year === currentYear && month <= currentMonth) {
      return;
    }

    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);

      return;
    }

    setMonth((m) => m - 1);
  };

  /* ============================================================
     LABEL
     ============================================================ */

  const monthLabel = new Date(year, month - 1).toLocaleDateString("sv-SE", {
    month: "long",
    year: "numeric",
  });

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div>
      {/* ======================================================
          NAVIGATION
          ====================================================== */}

      <div className="calendar-nav">
        <button
          className="calendar-nav-button"
          onClick={prevMonth}
          aria-label="Föregående månad"
        >
          ‹
        </button>

        <div className="calendar-nav-title">{monthLabel}</div>

        <button
          className="calendar-nav-button"
          onClick={nextMonth}
          aria-label="Nästa månad"
        >
          ›
        </button>
      </div>

      {/* ======================================================
          CALENDAR
          ====================================================== */}

      <Calendar
        days={days}
        selectedRange={selectedRange}
        onSelectDate={onSelect}
      />
    </div>
  );
}
