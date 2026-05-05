import { useState } from "react";
import { createPortal } from "react-dom";
import type { AdminBooking } from "../../booking/types/AdminBooking";
import { createArend } from "../api/arendsApi";
import "./createArendModal.css";

type Props = {
  booking: AdminBooking;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateArendModal({
  booking,
  onClose,
  onCreated,
}: Props) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!description.trim()) return;

    setLoading(true);

    await createArend({
      bookingId: booking.id,
      itemId: booking.itemId,
      itemName: booking.itemName,
      description,
      customerName: `${booking.firstName} ${booking.lastName}`,
      customerPhone: booking.phoneNumber,
    });

    setLoading(false);
    onCreated();
    onClose();
  }

  return createPortal(
    <div className="arend-modal-overlay" onClick={onClose}>
      <div className="create-arend-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Skapa ärende</h3>

        <div className="arend-info">
          <div>
            <strong>Produkt:</strong> {booking.itemName}
          </div>
          <div>
            <strong>Kund:</strong> {booking.firstName} {booking.lastName}
          </div>
          <div>
            <strong>Telefon:</strong> {booking.phoneNumber}
          </div>
        </div>

        <div className="form-section">
          <label>Beskrivning</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beskriv problemet..."
          />
        </div>

        <div className="modal-actions">
          <button
            className="primary"
            disabled={!description.trim() || loading}
            onClick={handleCreate}
          >
            {loading ? "Skapar..." : "Skapa ärende"}
          </button>

          <button className="secondary" onClick={onClose}>
            Avbryt
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
