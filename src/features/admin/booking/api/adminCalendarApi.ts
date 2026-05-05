import { apiFetch } from "../../../../api/http";

import type { AdminCalendarDay } from "../types/AdminCalendar";

/**
 * Get calendar data for admin (month view)
 */
export function getAdminCalendar(
  year: number,
  month: number,
): Promise<AdminCalendarDay[]> {
  return apiFetch<AdminCalendarDay[]>(
    `/admin/bookings/calendar/${year}/${month}`,
  );
}
