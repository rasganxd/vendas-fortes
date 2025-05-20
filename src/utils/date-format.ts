
/**
 * Convert a Date object to ISO string format for API calls
 * @param date Date object to convert
 * @returns ISO string representation of the date
 */
export const dateToString = (date: Date): string => {
  return date.toISOString();
};

/**
 * Convert an ISO string to a Date object
 * @param dateStr ISO string representation of a date
 * @returns Date object
 */
export const stringToDate = (dateStr: string): Date => {
  return new Date(dateStr);
};
