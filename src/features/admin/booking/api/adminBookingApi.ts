// api/admin/adminBookings.ts
import { apiFetch } from "../../../../api/http";
import type { AdminBooking } from "../types/AdminBooking";

/**
 * Get all active bookings for admin views
 */
export function getAdminBookings(): Promise<AdminBooking[]> {
  return apiFetch("/admin/bookings/list");
}
/**
 * Booking history (used for Arend creation page)
 */
export function getBookingHistory(): Promise<AdminBooking[]> {
  return apiFetch("/admin/bookings/history");
}
/**
 * Hand item over to customer
 * Active → InCustomerCare
 */
export function handoverBooking(id: string): Promise<void> {
  return apiFetch(`/admin/bookings/${id}/handover`, {
    method: "POST",
  });
}

/**
 * Item returned by customer
 * InCustomerCare → Completed
 */
export function returnBooking(id: string): Promise<void> {
  return apiFetch(`/admin/bookings/${id}/return`, {
    method: "POST",
  });
}

/**
 * Final GDPR clear
 * Completed → Cleared
 */
export function clearBooking(id: string): Promise<void> {
  return apiFetch(`/admin/bookings/${id}/clear`, {
    method: "POST",
  });
}
export async function getLastUpdated(): Promise<string> {
  return apiFetch("/admin/bookings/last-updated");
}

export async function updateBooking(
  id: string,
  data: {
    status: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    customerNotes: string;
    bookingDate: string;
  },
) {
  return apiFetch(`/admin/bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
export const createAdminBooking = (data: {
  itemId: string;
  date: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  customerNotes: string;
}) =>
  apiFetch("/admin/bookings/create", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const toggleBlockedDay = (date: string) =>
  apiFetch<boolean>("/admin/bookings/toggle-blocked", {
    method: "POST",
    body: JSON.stringify(date),
  });

export async function deleteBooking(id: string) {
  return apiFetch<void>(`/admin/bookings/${id}`, {
    method: "DELETE",
  });
}
