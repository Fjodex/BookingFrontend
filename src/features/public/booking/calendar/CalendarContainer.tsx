import { useEffect, useState } from "react";

import Calendar from "./Calendar";

import { getCalendarMonth, type CalendarDay } from "../api/calendar";

import "./calendarContainer.css";

interface Props {
  itemId: string;

  selectedRange: string[];

  onSelect: (date: string) => void;

  onDaysLoaded?: (days: CalendarDay[]) => void;
}

export default function CalendarContainer({
  itemId,
  selectedRange,
  onSelect,
  onDaysLoaded,
}: Props) {
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
     LOAD CALENDAR
     ============================================================ */

  useEffect(() => {
    getCalendarMonth(itemId, year, month).then((res) => {
      setDays(res.days);

      /*
       * expose to parent
       */

      onDaysLoaded?.(res.days);
    });
  }, [itemId, year, month, onDaysLoaded]);

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
     * prevent navigating
     * before current month
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
    <div className="calendar-panel">
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
