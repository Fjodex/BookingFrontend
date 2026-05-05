import type { ArendStatus } from "./ArendStatus";

export interface ArendTicket {
  id: string;

  bookingId: string;

  itemId: string;
  itemName: string;

  description: string;

  customerName?: string | null;
  customerPhone?: string | null;

  status: ArendStatus;
  log: {
    message: string;
    createdAt: string;
  }[];
  createdAt: string;
  processedAt?: string | null;
  solvedAt?: string | null;
}
