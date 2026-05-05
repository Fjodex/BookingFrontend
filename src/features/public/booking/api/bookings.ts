import { apiFetch } from "../../../../api/http";

export interface CreateBookingRequest {
  itemId: string;
  dates: string[];
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string; // ← optional (since backend uses it)
  customerNotes?: string;
}

export function createBooking(request: CreateBookingRequest) {
  return apiFetch<void>("/bookings", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
