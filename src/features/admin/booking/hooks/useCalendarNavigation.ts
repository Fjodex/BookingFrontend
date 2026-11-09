import type { Dispatch, SetStateAction } from "react";

interface Props {
  month: number;
  setMonth: Dispatch<SetStateAction<number>>;
  setYear: Dispatch<SetStateAction<number>>;
}

export default function useCalendarNavigation({
  month,
  setMonth,
  setYear,
}: Props) {
  const previousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((year) => year - 1);
    } else {
      setMonth((month) => month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((year) => year + 1);
    } else {
      setMonth((month) => month + 1);
    }
  };

  return { previousMonth, nextMonth };
}
