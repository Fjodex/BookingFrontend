export interface CreateBookingRequest {
  itemId: string;

  fromDate: string;

  toDate: string;

  firstName: string;

  lastName: string;

  phoneNumber: string;

  email?: string;

  customerNotes?: string;
}
