import { apiFetch } from "../../../../api/http";
import type { CalendarDay } from "../../../public/booking/api/calendar";

export type { CalendarDay } from "../../../public/booking/api/calendar";

export function getItemAvailability(
  itemId: string,
  year: number,
  month: number,
  selectedDate?: string,
): Promise<CalendarDay[]> {
  const query = selectedDate
    ? `?selectedDate=${encodeURIComponent(selectedDate)}`
    : "";

  return apiFetch<CalendarDay[]>(
    `/calendar/${itemId}/${year}/${month}${query}`,
  );
}
