import { apiFetch } from "../../../../api/http";
import type { ArendStatus } from "../types/ArendStatus";
import type { ArendTicket } from "../types/ArendTicket";

/* ===============================
   GET ALL
================================ */

export async function getArends(): Promise<ArendTicket[]> {
  return apiFetch("/arend");
}

/* ===============================
   GET BY STATUS
================================ */

export async function getArendsByStatus(
  status: ArendStatus,
): Promise<ArendTicket[]> {
  return apiFetch(`/arend/status/${status}`);
}

/* ===============================
   GET SINGLE
================================ */

export async function getArend(id: string): Promise<ArendTicket> {
  return apiFetch(`/arend/${id}`);
}

/* ===============================
   CREATE
================================ */

export async function createArend(data: {
  bookingId: string;
  itemId: string;
  itemName: string;
  description: string;
  customerName?: string;
  customerPhone?: string;
}) {
  return apiFetch("/arend", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ===============================
   ADD LOG ENTRY
================================ */

export async function addArendLog(id: string, message: string) {
  return apiFetch(`/arend/${id}/log`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

/* ===============================
   UPDATE STATUS
================================ */

export async function updateArendStatus(id: string, status: ArendStatus) {
  return apiFetch(`/arend/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(status),
  });
}

/* ===============================
   ACTIVE COUNT (Header badge)
================================ */

export async function getActiveArendCount(): Promise<number> {
  return apiFetch("/arend/count-active");
}
