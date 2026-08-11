import type { AdminBooking } from "./AdminBooking";

export interface AdminCalendarDay {
  date: string;

  isClosed: boolean;

  isBooked: boolean;

  bookings: AdminBooking[];

  openTime: string | null;

  closeTime: string | null;

  closedReason: string | null;
}
