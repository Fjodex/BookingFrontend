import type { Dispatch, SetStateAction } from "react";
import useCalendarNavigation from "../../../hooks/useCalendarNavigation";

interface Props {
  month: number;
  setMonth: Dispatch<SetStateAction<number>>;
  setYear: Dispatch<SetStateAction<number>>;
  monthLabel: string;
}

export default function CalendarHeader({
  month,
  setMonth,
  setYear,
  monthLabel,
}: Props) {
  const { previousMonth, nextMonth } = useCalendarNavigation({
    month,
    setMonth,
    setYear,
  });

  return (
    <div className="calendar-header">
      <button type="button" onClick={previousMonth}>
        ←
      </button>

      <strong>{monthLabel}</strong>

      <button type="button" onClick={nextMonth}>
        →
      </button>
    </div>
  );
}
