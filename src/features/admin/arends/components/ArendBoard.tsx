import { useEffect, useState } from "react";
import { getArends } from "../api/arendsApi";
import type { ArendTicket } from "../types/ArendTicket";
import ArendDetailModal from "./ArendDetailModal";
import "./arendBoard.css";

export default function ArendBoard() {
  const [arends, setArends] = useState<ArendTicket[]>([]);
  const [selectedArend, setSelectedArend] = useState<ArendTicket | null>(null);

  useEffect(() => {
    loadArends();
  }, []);

  async function loadArends() {
    const data = await getArends();
    setArends(data);
  }

  const openArends = arends.filter(
    (a) => a.status === "Active" || a.status === "Processed",
  );

  const solvedArends = arends.filter((a) => a.status === "Solved");

  return (
    <div className="arend-right">
      {/* OPEN */}
      <div className="arend-section">
        <h2>Aktiva / Pågående</h2>

        {openArends.length === 0 && (
          <div className="arend-empty">Inga aktiva ärenden</div>
        )}

        {openArends.map((a) => (
          <div
            key={a.id}
            className="arend-card"
            onClick={() => setSelectedArend(a)}
          >
            <div className="arend-title">{a.itemName}</div>
            <div className="arend-customer">{a.customerName}</div>

            <div className={`arend-status ${a.status.toLowerCase()}`}>
              {a.status}
            </div>
          </div>
        ))}
      </div>

      {/* SOLVED */}
      <div className="arend-section">
        <h2>Lösta</h2>

        {solvedArends.length === 0 && (
          <div className="arend-empty">Inga lösta ärenden</div>
        )}

        <div className="solved-list">
          {solvedArends.map((a) => (
            <div
              key={a.id}
              className="arend-card solved"
              onClick={() => setSelectedArend(a)}
            >
              <div className="arend-title">{a.itemName}</div>
              <div className="arend-customer">{a.customerName}</div>

              <div className="arend-status solved">Solved</div>
            </div>
          ))}
        </div>
      </div>

      {selectedArend && (
        <ArendDetailModal
          arend={selectedArend}
          onClose={() => setSelectedArend(null)}
          onUpdated={loadArends}
        />
      )}
    </div>
  );
}
