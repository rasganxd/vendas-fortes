import { VISIT_DAYS_OPTIONS } from '@/components/customers/constants';

/**
 * Validates and normalizes visit days to ensure consistency
 */
export const validateVisitDays = (visitDays: string[]): string[] => {
  if (!Array.isArray(visitDays)) {
    console.warn('visitDays is not an array:', visitDays);
    return [];
  }

  const validIds = VISIT_DAYS_OPTIONS.map(option => option.id);
  
  return visitDays
    .map(day => {
      // If it's already a valid English ID, keep it
      if (validIds.includes(day)) {
        return day;
      }
      
      // Convert Portuguese to English (for legacy data)
      const portugueseToEnglishMap: { [key: string]: string } = {
        'segunda': 'monday',
        'terca': 'tuesday',
        'quarta': 'wednesday',
        'quinta': 'thursday',
        'sexta': 'friday',
        'sabado': 'saturday',
        'domingo': 'sunday'
      };
      
      const englishDay = portugueseToEnglishMap[day.toLowerCase()];
      if (englishDay) {
        console.log(`Converting Portuguese day '${day}' to English '${englishDay}'`);
        return englishDay;
      }
      
      console.warn(`Invalid visit day: ${day}. Skipping.`);
      return null;
    })
    .filter((day): day is string => day !== null);
};

/**
 * Gets the display label for a visit day ID
 */
export const getVisitDayLabel = (dayId: string): string => {
  const day = VISIT_DAYS_OPTIONS.find(d => d.id === dayId);
  return day ? day.label : dayId;
};

/**
 * Validates if a visit day ID is valid
 */
export const isValidVisitDay = (dayId: string): boolean => {
  return VISIT_DAYS_OPTIONS.some(option => option.id === dayId);
};
