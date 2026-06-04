import type { BookingStatus } from "./BookingStatus";

export interface AdminBookingRequest {
  status: BookingStatus;

  firstName: string;
  lastName: string;
  phoneNumber: string;

  customerNotes?: string;

  fromDate: string;
  toDate: string;
}
