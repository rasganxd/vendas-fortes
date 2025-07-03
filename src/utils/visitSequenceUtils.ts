import { Customer } from '@/types';

/**
 * Gets the visit sequence for a customer on a specific day
 * @param customer Customer object
 * @param day Day of the week (e.g., 'monday', 'tuesday')
 * @returns The visit sequence number for that day, or the default sequence if day-specific not found
 */
export const getVisitSequenceForDay = (customer: Customer, day: string): number => {
  // If the customer has day-specific sequences, use them
  if (customer.visitSequences && customer.visitSequences[day] !== undefined) {
    return customer.visitSequences[day];
  }
  
  // Otherwise, fall back to the general visit sequence
  return customer.visitSequence || 1;
};

/**
 * Checks if a customer uses advanced (day-specific) visit sequencing
 * @param customer Customer object
 * @returns true if customer uses day-specific sequences, false otherwise
 */
export const usesAdvancedSequencing = (customer: Customer): boolean => {
  return !!(customer.visitSequences && Object.keys(customer.visitSequences).length > 0);
};

/**
 * Sorts customers by their visit sequence for a specific day
 * @param customers Array of customers
 * @param day Day of the week
 * @returns Sorted array of customers by their sequence for that day
 */
export const sortCustomersByDaySequence = (customers: Customer[], day: string): Customer[] => {
  return [...customers].sort((a, b) => {
    const seqA = getVisitSequenceForDay(a, day);
    const seqB = getVisitSequenceForDay(b, day);
    return seqA - seqB;
  });
};

/**
 * Gets all unique visit sequences for a specific day across multiple customers
 * @param customers Array of customers
 * @param day Day of the week
 * @returns Array of unique sequence numbers sorted ascending
 */
export const getUniqueSequencesForDay = (customers: Customer[], day: string): number[] => {
  const sequences = customers.map(customer => getVisitSequenceForDay(customer, day));
  return [...new Set(sequences)].sort((a, b) => a - b);
};
