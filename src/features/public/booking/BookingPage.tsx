import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import type { Item } from "../../sharedTypes/Item";

import CalendarContainer from "./calendar/CalendarContainer";

import { getItem } from "../items/api/itemsApi";

import { createBooking } from "./api/bookings";

import "./bookingPage.css";

export default function BookingPage() {
  const { itemId } = useParams<{
    itemId: string;
  }>();

  /* ============================================================
     ITEM
     ============================================================ */

  const [item, setItem] = useState<Item | null>(null);

  /* ============================================================
     CALENDAR
     ============================================================ */

  const [fromDate, setFromDate] = useState<string | null>(null);
  const [, setToDate] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<string[]>([]);

  /* ============================================================
     CUSTOMER INFO
     ============================================================ */

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  /* ============================================================
     UI STATE
     ============================================================ */

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [receipt, setReceipt] = useState<{
    dates: string[];
    total: number;
  } | null>(null);

  /* ============================================================
     LOAD ITEM
     ============================================================ */

  useEffect(() => {
    if (!itemId) return;

    getItem(itemId).then(setItem);
  }, [itemId]);

  /* ============================================================
     DATE SELECTION
     ============================================================ */

  const selectDate = (date: string) => {
    /*
     * No pickup date yet.
     *
     * This is the first selection and therefore
     * triggers the calendar recalculation.
     */
    if (!fromDate) {
      setFromDate(date);
      setToDate(null);
      setSelectedRange([date]);

      return;
    }

    /*
     * Clicking the pickup date again clears
     * the entire selection.
     */
    if (date === fromDate) {
      setFromDate(null);
      setToDate(null);
      setSelectedRange([]);

      return;
    }

    /*
     * Pickup date already exists.
     *
     * Any other selectable date becomes/replaces
     * the return date.
     *
     * Do NOT trigger a calendar recalculation.
     */
    if (date > fromDate) {
      setToDate(date);
      setSelectedRange([fromDate, date]);

      return;
    }
  };

  /* ============================================================
     CONFIRM MODAL
     ============================================================ */

  const handleConfirmClick = () => {
    if (!item || selectedRange.length === 0) return;

    setShowConfirm(true);
  };

  /* ============================================================
     CREATE BOOKING
     ============================================================ */

  const handleConfirmBooking = async () => {
    if (!item) return;

    try {
      setIsSubmitting(true);

      await createBooking({
        itemId: item.id,

        fromDate: selectedRange[0],

        toDate: selectedRange[selectedRange.length - 1],

        firstName,
        lastName,
        phoneNumber,
        customerNotes,
      });

      const total = selectedRange.length * item.pricePerDay;

      setReceipt({
        dates: [...selectedRange],
        total,
      });

      /*
       * Reset
       */

      setFromDate(null);
      setToDate(null);
      setSelectedRange([]);

      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setCustomerNotes("");

      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================================================
     LOADING
     ============================================================ */

  if (!itemId) return <div>Laddar...</div>;
  if (!item) return <div>Laddar...</div>;

  /* ============================================================
     PRICE
     ============================================================ */

  const rentalDays = selectedRange.length;

  const totalPrice = rentalDays * item.pricePerDay;

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="booking-page">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="selected-item-card">
        <div className="selected-left">
          <Link to={`/items/${item.id}`} className="back-button">
            ← Tillbaka
          </Link>

          {item.imageData && (
            <div className="selected-image">
              <img
                src={
                  item.imageData[1]
                    ? `data:image/*;base64,${item.imageData[1]}`
                    : `data:image/*;base64,${item.imageData[0]}`
                }
                alt={item.name}
              />
            </div>
          )}

          <div className="selected-text">
            <div className="selected-label">Vald</div>

            <div className="selected-name">{item.name}</div>

            <div className="selected-description">
              {item.productDescription}
            </div>
          </div>
        </div>

        <div className="selected-right">
          <div className="price-label">Pris</div>

          <div className="price-value">{item.pricePerDay} SEK / dag</div>
        </div>
      </div>

      {/* ======================================================
          MAIN
          ====================================================== */}

      <div className="booking-layout">
        {/* ==================================================
            CALENDAR
            ================================================== */}

        <div className="calendar-wrapper">
          <CalendarContainer
            itemId={itemId}
            selectedRange={selectedRange}
            onSelect={selectDate}
          />
        </div>

        {/* ==================================================
            SIDEBAR
            ================================================== */}

        <div className="booking-sidebar">
          {/* ==============================================
              FORM
              ============================================== */}

          <div className="form-card">
            <div className="form-title">Kontaktuppgifter</div>

            <div className="field">
              <span className="field-label">
                Förnamn <span className="required">*</span>
              </span>

              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="field">
              <span className="field-label">
                Efternamn <span className="required">*</span>
              </span>

              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="field">
              <span className="field-label">
                Telefonnummer <span className="required">*</span>
              </span>

              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="field">
              <span className="field-label">Meddelande (valfritt)</span>

              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* ==============================================
              SUMMARY
              ============================================== */}

          <div className="summary-box">
            <h3>Sammanställning</h3>

            <div className="summary-grid">
              <div className="summary-left">
                {selectedRange.map((d) => (
                  <div key={d} className="summary-row">
                    <span>{d}</span>

                    <span>{item.pricePerDay} SEK</span>
                  </div>
                ))}
              </div>

              <div className="summary-right">
                <div className="summary-info">
                  <div className="summary-info-title">Information</div>

                  <p>{item.details}</p>
                </div>

                <div className="summary-footer">
                  <div className="total">
                    <span>Totalt</span>

                    <strong>{totalPrice} SEK</strong>
                  </div>

                  <button
                    className="confirm-button"
                    disabled={
                      isSubmitting ||
                      !selectedRange.length ||
                      !firstName ||
                      !lastName ||
                      !phoneNumber
                    }
                    onClick={handleConfirmClick}
                  >
                    {isSubmitting ? "Bokar..." : "Bekräfta Bokning"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ==============================================
              RECEIPT
              ============================================== */}

          {receipt && (
            <div className="receipt">
              <h3>Bokningskvitto</h3>

              {receipt.dates.map((d) => (
                <div key={d}>{d}</div>
              ))}

              <strong>Totalt: {receipt.total} SEK</strong>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          MODAL
          ====================================================== */}

      {showConfirm && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <h3>Bekräfta bokning</h3>

            <p>{rentalDays} dag(ar)</p>

            <div className="modal-summary">
              {selectedRange.map((d) => (
                <div key={d} className="modal-row">
                  <span>{d}</span>

                  <span>{item.pricePerDay} SEK</span>
                </div>
              ))}
            </div>

            <div className="modal-total">
              Totalt: <strong>{totalPrice} SEK</strong>
            </div>

            {customerNotes && (
              <div className="modal-notes">
                <strong>Meddelande:</strong>

                <p>{customerNotes}</p>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={() => setShowConfirm(false)}>Avbryt</button>

              <button className="confirm-button" onClick={handleConfirmBooking}>
                Bekräfta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
