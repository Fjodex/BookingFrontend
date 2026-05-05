import { apiFetch } from "../../../../api/http";
import type { CreateBookingRequest } from "../../../sharedTypes/CreateBookingRequest";
export function createBooking(request: CreateBookingRequest) {
  return apiFetch<void>("/bookings", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
