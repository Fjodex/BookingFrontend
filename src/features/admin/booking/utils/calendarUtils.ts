/**
 * Converts a YYYY-MM-DD date string into a local Date.
 * Avoids UTC timezone shifts from new Date("YYYY-MM-DD").
 */
export function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
}

/**
 * Returns the weekday offset for a Monday-first calendar.
 * Monday = 0, Sunday = 6.
 */
export function getMonthStartOffset(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Formats a month and year in Swedish.
 */
export function formatMonthLabel(year: number, month: number): string {
  const label = new Date(year, month - 1).toLocaleDateString("sv-SE", {
    month: "long",
    year: "numeric",
  });

  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Checks whether a calendar date is today or in the past.
 */
export function getDateStatus(date: Date, today = new Date()) {
  const calendarDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return {
    isToday: calendarDate.getTime() === currentDate.getTime(),
    isPast: calendarDate < currentDate,
  };
}
