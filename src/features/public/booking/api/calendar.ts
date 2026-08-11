import { apiFetch } from "../../../../api/http";

export interface CalendarDay {
  date: string;
  selectable: boolean;
  isSelected: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
}

export function getCalendarMonth(
  year: number,
  month: number,
  selectedDate?: string,
): Promise<CalendarMonth> {
  let url = `/calendar/${year}/${month}`;

  if (selectedDate) {
    url += `?selectedDate=${encodeURIComponent(selectedDate)}`;
  }

  return apiFetch<CalendarMonth>(url);
}
