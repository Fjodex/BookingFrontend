import { apiFetch } from "../../../../api/http";

export async function getLastUpdated(): Promise<string> {
  return apiFetch("/api/admin/bookings/last-updated");
}
