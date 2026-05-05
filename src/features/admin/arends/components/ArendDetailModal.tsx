import { useState } from "react";
import { createPortal } from "react-dom";
import { addArendLog, updateArendStatus } from "../api/arendsApi";
import type { ArendTicket } from "../types/ArendTicket";
import "./arendDetailModal.css";
import type { ArendStatus } from "../types/ArendStatus";

type Props = {
  arend: ArendTicket;
  onClose: () => void;
  onUpdated: () => void;
};

export default function ArendDetailModal({ arend, onClose, onUpdated }: Props) {
  const [message, setMessage] = useState("");

  const isProcessed = arend.status === "Processed";
  const isSolved = arend.status === "Solved";

  async function handleAddLog() {
    if (!message.trim()) return;

    await addArendLog(arend.id, message);
    setMessage("");
    onUpdated();
  }

  async function toggleProcessed() {
    const newStatus = isProcessed ? "New" : "Processed";
    await updateArendStatus(arend.id, newStatus as ArendStatus);
    onUpdated();
  }

  async function handleSolved() {
    await updateArendStatus(arend.id, "Solved");
    onUpdated();
  }

  return createPortal(
    <div className="arend-modal-overlay" onClick={onClose}>
      <div className="arend-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="arend-header">
          <h3>{arend.itemName}</h3>

          <div className={`status-badge ${arend.status.toLowerCase()}`}>
            {arend.status === ("Processed" as ArendStatus) && "Bearbetas"}
            {arend.status === ("Solved" as ArendStatus) && "Löst"}
            {arend.status === ("New" as ArendStatus) && "Ny"}
          </div>
        </div>

        <div className="arend-info">
          <div>
            <strong>Kund:</strong> {arend.customerName}
          </div>
          <div>
            <strong>Telefon:</strong> {arend.customerPhone}
          </div>
        </div>

        {/* LOG */}
        <div className="arend-log">
          {arend.log.length === 0 ? (
            <div className="log-empty">Ingen logg ännu</div>
          ) : (
            arend.log.map((entry, i) => (
              <div key={i} className="log-entry">
                <div className="log-message">{entry.message}</div>
                <div className="log-date">
                  {new Date(entry.createdAt).toLocaleString("sv-SE")}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ADD LOG */}
        <div className="log-input">
          <textarea
            placeholder="Skriv en uppdatering..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button className="primary" onClick={handleAddLog}>
            Lägg till
          </button>
        </div>

        {/* ACTIONS */}
        {!isSolved && (
          <div className="status-actions">
            <button
              className={`primary ${isProcessed ? "active" : ""}`}
              onClick={toggleProcessed}
            >
              {isProcessed ? "Släpp ärende" : "Ta ärende"}
            </button>

            <button className="success" onClick={handleSolved}>
              Slutför
            </button>
          </div>
        )}

        <button className="secondary" onClick={onClose}>
          Stäng
        </button>
      </div>
    </div>,
    document.body,
  );
}
