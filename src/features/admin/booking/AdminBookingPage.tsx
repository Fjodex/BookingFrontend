import { useEffect, useState, useRef, useCallback } from "react";

import AdminCalendar from "./components/calendar/AdminCalendar";
import AdminBookingList from "./components/bookingList/AdminBookingList";
import BookingEditModal from "./modals/BookingEditModal";
import AdminItemsBox from "./components/itemBox/AdminItemBox";
import AdminDayPopup from "./modals/AdminDayPopup";
import useAdminItems from "./hooks/useAdminItems";
import ConfirmModal from "../shared/components/ConfirmModal";

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
import type { AdminCalendarDay } from "./types/AdminCalendar";
import type { AdminBookingRequest } from "./types/AdminBookingRequest";

import "./adminBookingPage.css";

export default function AdminBookingsPage() {
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [days, setDays] = useState<AdminCalendarDay[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);

  const [calendarLoading, setCalendarLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null,
  );

  const [selectedDay, setSelectedDay] = useState<AdminCalendarDay | null>(null);

  /* ============================================================
     CONFIRM MODAL
     ============================================================ */

  const [confirmBooking, setConfirmBooking] = useState<AdminBooking | null>(
    null,
  );

  const [confirmAction, setConfirmAction] = useState<
    "return" | "clear" | "delete" | null
  >(null);

  /* ============================================================
     SYNC
     ============================================================ */

  const refreshRequestRef = useRef(0);
  const lastUpdatedRef = useRef<string | null>(null);

  /* ============================================================
     REFRESH
     ============================================================ */

  const refreshAll = useCallback(async (): Promise<boolean> => {
    const requestId = ++refreshRequestRef.current;

    // Keep existing calendar content visible during background refreshes.
    if (days.length === 0) {
      setCalendarLoading(true);
    }

    try {
      const [calendarData, bookingData] = await Promise.all([
        getAdminCalendar(year, month),
        getAdminBookings(),
      ]);

      if (requestId !== refreshRequestRef.current) return false;

      setDays(calendarData);
      setBookings(bookingData);

      return true;
    } catch (err) {
      if (requestId === refreshRequestRef.current) {
        console.error("Failed to refresh data", err);
      }

      return false;
    } finally {
      if (requestId === refreshRequestRef.current) {
        setCalendarLoading(false);
      }
    }
  }, [year, month, days.length]);

  /* ============================================================
     TIMESTAMP
     ============================================================ */

  const syncTimestamp = async () => {
    try {
      const timestamp = await getLastUpdated();
      lastUpdatedRef.current = timestamp;
    } catch (err) {
      console.error("Failed to sync timestamp", err);
    }
  };

  const refreshAndSync = async () => {
    const success = await refreshAll();

    if (success) {
      await syncTimestamp();
    }
  };

  /* ============================================================
     INITIAL LOAD
     ============================================================ */

  useEffect(() => {
    const initialize = async () => {
      const success = await refreshAll();

      if (success) {
        await syncTimestamp();
      }
    };

    void initialize();
  }, [refreshAll]);

  /* ============================================================
     ITEMS
     ============================================================ */

  const { items, visibleItemIds, toggleItem } = useAdminItems();

  /* ============================================================
     POLLING SYNC
     ============================================================ */

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const serverTimestamp = await getLastUpdated();

        if (serverTimestamp !== lastUpdatedRef.current) {
          const success = await refreshAll();

          if (success) {
            lastUpdatedRef.current = serverTimestamp;
          }
        }
      } catch (err) {
        console.error("Sync failed", err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [refreshAll]);

  /* ============================================================
     BOOKING ACTIONS
     ============================================================ */

  const handleBookingSave = async (updated: unknown) => {
    if (!selectedBooking) return;

    try {
      const bookingData = updated as AdminBookingRequest;

      await updateBooking(
        selectedBooking.id,
        bookingData as Parameters<typeof updateBooking>[1],
      );

      await refreshAndSync();

      setSelectedBooking(null);
    } catch (err) {
      console.error("Failed to update booking", err);
    }
  };

  const handleHandover = async (booking: AdminBooking) => {
    try {
      await handoverBooking(booking.id);
      await refreshAndSync();
    } catch (err) {
      console.error("Failed to handover booking", err);
    }
  };

  const handleReturn = (booking: AdminBooking) => {
    setConfirmBooking(booking);
    setConfirmAction("return");
  };

  const handleClear = (booking: AdminBooking) => {
    setConfirmBooking(booking);
    setConfirmAction("clear");
  };

  const handleDelete = async (booking: AdminBooking): Promise<void> => {
    setConfirmBooking(booking);
    setConfirmAction("delete");
  };

  /* ============================================================
     FILTERED DAYS
     ============================================================ */

  const filteredDays = days.map((day) => ({
    ...day,

    bookings:
      day.bookings?.filter((booking) => visibleItemIds.has(booking.itemId)) ??
      [],

    isBooked:
      day.bookings?.some((booking) => visibleItemIds.has(booking.itemId)) ??
      false,
  }));

  /* ============================================================
     FILTERED BOOKINGS
     ============================================================ */

  const filteredBookings = bookings.filter((booking) =>
    visibleItemIds.has(booking.itemId),
  );

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="admin-bookings-layout">
      {/* EDIT MODAL */}

      {selectedBooking && (
        <BookingEditModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onSave={handleBookingSave}
          onDelete={handleDelete}
        />
      )}

      {/* DAY POPUP */}

      {selectedDay && (
        <AdminDayPopup
          day={selectedDay}
          items={items}
          onClose={() => setSelectedDay(null)}
          onRefresh={refreshAndSync}
        />
      )}

      {/* CALENDAR */}

      <div className="admin-bookings-calendar">
        <AdminCalendar
          days={filteredDays}
          year={year}
          month={month}
          loading={calendarLoading}
          setYear={setYear}
          setMonth={setMonth}
          onBookingClick={setSelectedBooking}
          onDayClick={setSelectedDay}
        />
      </div>

      {/* SIDEBAR */}

      <div className="admin-bookings-list">
        <AdminItemsBox
          items={items}
          visibleItemIds={visibleItemIds}
          onToggle={toggleItem}
        />

        <AdminBookingList
          bookings={filteredBookings}
          onHandover={handleHandover}
          onReturn={handleReturn}
          onClear={handleClear}
          onDelete={handleDelete}
        />
      </div>

      {/* CONFIRM MODAL */}

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

          try {
            if (confirmAction === "return") {
              await returnBooking(confirmBooking.id);
            }

            if (confirmAction === "clear") {
              await clearBooking(confirmBooking.id);
            }

            if (confirmAction === "delete") {
              await deleteBooking(confirmBooking.id);
            }

            await refreshAndSync();

            setConfirmBooking(null);
            setConfirmAction(null);
          } catch (err) {
            console.error("Failed to perform booking action", err);
          }
        }}
      />
    </div>
  );
}
