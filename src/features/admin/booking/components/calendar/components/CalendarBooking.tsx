import type { AdminBooking } from "../../../types/AdminBooking";
import { Mail } from "lucide-react";

interface Props {
  booking: AdminBooking;
  onClick: (booking: AdminBooking) => void;
}

export default function CalendarBooking({ booking, onClick }: Props) {
  return (
    <button
      type="button"
      className="calendar-booking"
      style={{ backgroundColor: booking.color }}
      onClick={() => onClick(booking)}
      title={booking.customerNotes || undefined}
    >
      <div className="booking-main">
        <span className="booking-name">
          {booking.firstName} {booking.lastName}
        </span>

        {booking.customerNotes && (
          <span className="note-icon">
            <Mail size={14} strokeWidth={2} />
          </span>
        )}
      </div>
    </button>
  );
}
