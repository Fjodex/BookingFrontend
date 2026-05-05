import { apiFetch } from "../../../../api/http";

export interface CalendarDay {
  date: string;
  isBooked: boolean;
  isSelectable: boolean;
  isBlocked: boolean;
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
}

export function getCalendarMonth(
  itemId: string,
  year: number,
  month: number,
): Promise<CalendarMonth> {
  return apiFetch<CalendarMonth>(`/items/${itemId}/calendar/${year}/${month}`);
}
