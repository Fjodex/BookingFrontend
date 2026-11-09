import type { Dispatch, SetStateAction } from "react";

import type { AdminBooking } from "../../types/AdminBooking";
import type { AdminCalendarDay } from "../../types/AdminCalendar";

import CalendarHeader from "./components/CalendarHeader";
import CalendarGrid from "./components/CalendarGrid";

import { formatMonthLabel } from "../../utils/calendarUtils";

import "./adminCalendar.css";

interface Props {
  days: AdminCalendarDay[];
  year: number;
  month: number;
  loading: boolean;
  setYear: Dispatch<SetStateAction<number>>;
  setMonth: Dispatch<SetStateAction<number>>;
  onBookingClick: (booking: AdminBooking) => void;
  onDayClick: (day: AdminCalendarDay) => void;
}

export default function AdminCalendar({
  days,
  year,
  month,
  loading,
  setYear,
  setMonth,
  onBookingClick,
  onDayClick,
}: Props) {
  if (loading) {
    return <div className="calendar-loading">Laddar kalender…</div>;
  }

  if (!days.length) {
    return (
      <div className="calendar-empty-state">Inga kalenderdagar hittades.</div>
    );
  }

  return (
    <div className="admin-calendar">
      <CalendarHeader
        month={month}
        setMonth={setMonth}
        setYear={setYear}
        monthLabel={formatMonthLabel(year, month)}
      />

      <CalendarGrid
        days={days}
        onDayClick={onDayClick}
        onBookingClick={onBookingClick}
      />
    </div>
  );
}
