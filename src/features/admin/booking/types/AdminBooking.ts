import type { BookingStatus } from "./BookingStatus";

export interface AdminBooking {
  id: string;

  fromDate: string; // ISO string from API
  toDate: string; // ISO string from API

  itemId: string;
  itemName: string;
  color: string;

  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  customerNotes?: string;

  status: BookingStatus;
}
