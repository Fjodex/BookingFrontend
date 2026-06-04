import type { BookingStatus } from "./BookingStatus";

export interface AdminChangeBooking {
  status: BookingStatus;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  customerNotes?: string;
  bookingDate: string;
}
