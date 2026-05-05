// types/Admin/AdminCalendar.ts
import type { AdminBooking } from "./AdminBooking";

export interface AdminCalendarDay {
  date: string;
  isBlocked: boolean;
  bookings: AdminBooking[];
}
