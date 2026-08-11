import { apiFetch } from "../../../../api/http";
import type { AdminBooking } from "../types/AdminBooking";

/**
 * Get all active bookings for admin views.
 */
export function getAdminBookings(): Promise<AdminBooking[]> {
  return apiFetch("/admin/bookings/list");
}

/**
 * Get booking history.
 */
export function getBookingHistory(): Promise<AdminBooking[]> {
  return apiFetch("/admin/bookings/history");
}

/**
 * Get the timestamp of the latest booking change.
 */
export function getLastUpdated(): Promise<string> {
  return apiFetch("/admin/bookings/last-updated");
}

/**
 * Hand item over to customer.
 *
 * Active → InCustomerCare
 */
export function handoverBooking(id: string): Promise<void> {
  return apiFetch(`/admin/bookings/${id}/handover`, {
    method: "POST",
  });
}

/**
 * Item returned by customer.
 *
 * InCustomerCare → Completed
 */
export function returnBooking(id: string): Promise<void> {
  return apiFetch(`/admin/bookings/${id}/return`, {
    method: "POST",
  });
}

/**
 * Final GDPR clear.
 *
 * Completed → Cleared
 */
export function clearBooking(id: string): Promise<void> {
  return apiFetch(`/admin/bookings/${id}/clear`, {
    method: "POST",
  });
}

/**
 * Update an existing booking.
 */
export function updateBooking(
  id: string,
  data: {
    status: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    customerNotes: string;
    fromDate: string;
    toDate: string;
  },
) {
  return apiFetch(`/admin/bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Create a booking from the admin interface.
 */
export function createAdminBooking(data: {
  itemId: string;
  fromDate: string;
  toDate: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  customerNotes: string;
}) {
  return apiFetch("/admin/bookings/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a booking.
 */
export function deleteBooking(id: string): Promise<void> {
  return apiFetch<void>(`/admin/bookings/${id}`, {
    method: "DELETE",
  });
}
