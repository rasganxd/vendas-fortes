
export const VISIT_DAYS_OPTIONS = [
  { id: "monday", label: "Segunda" },
  { id: "tuesday", label: "Terça" },
  { id: "wednesday", label: "Quarta" },
  { id: "thursday", label: "Quinta" },
  { id: "friday", label: "Sexta" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
];

// Alias for backward compatibility
export const DaysOfWeekOptions = VISIT_DAYS_OPTIONS.map(day => ({ 
  value: day.id, 
  label: day.label 
}));

export const VISIT_FREQUENCY_OPTIONS = [
  { id: "weekly", label: "Semanal" },
  { id: "biweekly", label: "Quinzenal" },
  { id: "monthly", label: "Mensal" },
  { id: "quarterly", label: "Trimestral" },
];

// Alias for backward compatibility
export const VisitFrequencyOptions = VISIT_FREQUENCY_OPTIONS.map(freq => ({ 
  value: freq.id, 
  label: freq.label 
}));

export const getDayLabel = (dayId: string): string => {
  const day = VISIT_DAYS_OPTIONS.find(d => d.id === dayId);
  return day ? day.label : dayId;
};

export const formatVisitFrequency = (frequency: string): string => {
  switch (frequency) {
    case 'weekly':
      return 'Semanal';
    case 'biweekly':
      return 'Quinzenal';
    case 'monthly':
      return 'Mensal';
    case 'quarterly':
      return 'Trimestral';
    default:
      return frequency;
  }
};
