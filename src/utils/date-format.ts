
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

/**
 * Format a Date object to a localized string
 * @param date Date object to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString();
};
