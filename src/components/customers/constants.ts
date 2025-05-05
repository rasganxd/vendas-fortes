
export const VISIT_DAYS_OPTIONS = [
  { id: "monday", label: "Segunda" },
  { id: "tuesday", label: "Terça" },
  { id: "wednesday", label: "Quarta" },
  { id: "thursday", label: "Quinta" },
  { id: "friday", label: "Sexta" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
];

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
