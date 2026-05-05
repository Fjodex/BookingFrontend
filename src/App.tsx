import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import "./features/app.css";

import Layout from "./features/layout/public/Layout";

import ItemListPage from "./features/public/items/ItemListPage";
import ItemPage from "./features/public/items/ItemPage";
import BookingPage from "./features/public/booking/BookingPage";

import LoginPage from "./features/admin/login/LoginPage";
import AdminLayout from "./features/layout/admin/AdminLayout";
import AdminBookingsPage from "./features/admin/booking/AdminBookingPage";

import EditItemPage from "./features/admin/items/EditItemPage";
import CreateItemPage from "./features/admin/items/CreateItemPage";

import ArendPage from "./features/admin/arends/ArendPage";

import { isAdminLoggedIn } from "./features/admin/login/api/authApi";

function AdminRoute({ children }: { children: ReactNode }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route element={<Layout />}>
        <Route path="/" element={<ItemListPage />} />
        <Route path="/items/:itemId" element={<ItemPage />} />
        <Route path="/booking/:itemId" element={<BookingPage />} />
      </Route>

      {/* ================= ADMIN LOGIN ================= */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* ================= ADMIN ROUTES ================= */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        {/* Redirect /admin → /admin/bookings */}
        <Route index element={<Navigate to="bookings" replace />} />

        {/* Booking calendar */}
        <Route path="bookings" element={<AdminBookingsPage />} />

        {/* Arends page */}
        <Route path="arends" element={<ArendPage />} />

        {/* Items */}
        <Route path="items/new" element={<CreateItemPage />} />
        <Route path="items/:id" element={<EditItemPage />} />
      </Route>
    </Routes>
  );
}
