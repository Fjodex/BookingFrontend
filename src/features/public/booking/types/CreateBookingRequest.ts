export interface CreateBookingRequest {
  itemId: string;
  dates: string[];
  firstName: string;
  lastName: string;
  phoneNumber: string;
  customerNotes?: string;
}
