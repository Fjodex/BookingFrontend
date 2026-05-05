import { useEffect, useState, useRef } from "react";
import AdminCalendar from "./calendar/AdminCalendar";
import AdminBookingList from "./bookingList/AdminBookingList";
import BookingEditModal from "./calendar/BookingEditModal";
import AdminItemsBox from "./itemBox/AdminItemBox";
import AdminDayPopup from "./calendar/AdminDayPopup";
import ConfirmModal from "../shared/components/ConfirmModal";
import { getAdminItems } from "../api/adminItemApi";
import { getAdminCalendar } from "./api/adminCalendarApi";
import {
  getAdminBookings,
  updateBooking,
  handoverBooking,
  returnBooking,
  clearBooking,
  deleteBooking,
  getLastUpdated,
} from "./api/adminBookingApi";

import type { AdminBooking } from "./types/AdminBooking";
import type { Item } from "../../sharedTypes/Item";
import type { AdminCalendarDay } from "./types/AdminCalendar";
import type { AdminBookingRequest } from "./types/AdminBookingRequest";

import "./adminBookingPage.css";

export default function AdminBookingsPage() {
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [days, setDays] = useState<AdminCalendarDay[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [visibleItemIds, setVisibleItemIds] = useState<Set<string>>(new Set());

  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null,
  );

  const [selectedDay, setSelectedDay] = useState<AdminCalendarDay | null>(null);

  /* 🔥 Confirm modal state */
  const [confirmBooking, setConfirmBooking] = useState<AdminBooking | null>(
    null,
  );

  const [confirmAction, setConfirmAction] = useState<
    "return" | "clear" | "delete" | null
  >(null);

  const lastUpdatedRef = useRef<string | null>(null);

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    getAdminItems().then((items) => {
      setItems(items);
      setVisibleItemIds(new Set(items.map((i) => i.id)));
    });
  }, []);

  /* ---------------- REFRESH ---------------- */

  const refreshAll = async () => {
    const [calendarData, bookingData] = await Promise.all([
      getAdminCalendar(year, month),
      getAdminBookings(),
    ]);

    setDays(calendarData);
    setBookings(bookingData);
  };

  /* ---------------- POLLING SYNC ---------------- */

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const serverTimestamp = await getLastUpdated();

        if (serverTimestamp !== lastUpdatedRef.current) {
          await refreshAll();
          lastUpdatedRef.current = serverTimestamp;
        }
      } catch (err) {
        console.error("Sync failed", err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [year, month]);

  const syncTimestamp = async () => {
    const ts = await getLastUpdated();
    lastUpdatedRef.current = ts;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshAll();
  }, [year, month]);

  /* ---------------- BOOKING ACTIONS ---------------- */

  const handleBookingSave = async (updated: unknown) => {
    if (!selectedBooking) return;
    const bookingData = updated as AdminBookingRequest;
    if (!bookingData.email) return;
    await updateBooking(
      selectedBooking.id,
      bookingData as Parameters<typeof updateBooking>[1],
    );
    await refreshAll();
    await syncTimestamp();

    setSelectedBooking(null);
  };

  const handleHandover = async (booking: AdminBooking) => {
    await handoverBooking(booking.id);
    await refreshAll();
    await syncTimestamp();
  };

  const handleReturn = (booking: AdminBooking) => {
    setConfirmBooking(booking);
    setConfirmAction("return");
  };

  const handleClear = (booking: AdminBooking) => {
    setConfirmBooking(booking);
    setConfirmAction("clear");
  };

  const handleDelete = async (booking: AdminBooking) => {
    setConfirmBooking(booking);
    setConfirmAction("delete");
  };

  /* ---------------- FILTER ---------------- */

  const toggleItem = (id: string) => {
    setVisibleItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="admin-bookings-layout">
      {selectedBooking && (
        <BookingEditModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onSave={handleBookingSave}
          onDelete={handleDelete}
        />
      )}

      {selectedDay && (
        <AdminDayPopup
          day={selectedDay}
          items={items}
          onClose={() => setSelectedDay(null)}
          onRefresh={refreshAll}
        />
      )}

      <div className="admin-bookings-calendar">
        <AdminCalendar
          days={days}
          year={year}
          month={month}
          setYear={setYear}
          setMonth={setMonth}
          visibleItemIds={visibleItemIds}
          onBookingClick={setSelectedBooking}
          onDayClick={setSelectedDay}
        />
      </div>

      <div className="admin-bookings-list">
        <AdminItemsBox
          items={items}
          visibleItemIds={visibleItemIds}
          onToggle={toggleItem}
        />

        <AdminBookingList
          bookings={bookings}
          onHandover={handleHandover}
          onReturn={handleReturn}
          onClear={handleClear}
          onDelete={handleDelete}
        />
      </div>

      {/* 🔥 CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirmBooking}
        title={
          confirmAction === "delete"
            ? "Radera bokning"
            : confirmAction === "clear"
              ? "GDPR-rensa bokning"
              : "Är utrustningen återlämnad och är i gott skick?"
        }
        message={
          confirmAction === "delete"
            ? "Är du säker på att du vill radera bokningen permanent?"
            : confirmAction === "clear"
              ? "Detta kommer permanent rensa bokningen och sparade kunduppgifter rensas."
              : "Är utrustningen återlämnad och är i gott skick?"
        }
        confirmText={
          confirmAction === "delete"
            ? "Ja, radera"
            : confirmAction === "clear"
              ? "Ja, rensa"
              : "Ja, bekräfta"
        }
        cancelText="Avbryt"
        onCancel={() => {
          setConfirmBooking(null);
          setConfirmAction(null);
        }}
        onConfirm={async () => {
          if (!confirmBooking || !confirmAction) return;

          if (confirmAction === "return") {
            await returnBooking(confirmBooking.id);
          }

          if (confirmAction === "clear") {
            await clearBooking(confirmBooking.id);
          }

          if (confirmAction === "delete") {
            await deleteBooking(confirmBooking.id);
          }

          await refreshAll();
          await syncTimestamp();

          setConfirmBooking(null);
          setConfirmAction(null);
        }}
      />
    </div>
  );
}
