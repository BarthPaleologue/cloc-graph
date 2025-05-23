/**
 * Date utility functions
 */

/**
 * Get the ISO week number for a date
 *
 * @param date - Date to get week number for
 * @returns String in the format YYYY-WW
 */
export function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week =
    Math.floor(
      (d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 86400000 / 7,
    ) + 1;
  return `${d.getFullYear()}-${week.toString().padStart(2, "0")}`;
}

/**
 * Get the year and month for a date
 *
 * @param date - Date to get month for
 * @returns String in the format YYYY-MM
 */
export function getYearMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

/**
 * Format a date as YYYY-MM-DD
 *
 * @param date - Date to format
 * @returns String in the format YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
