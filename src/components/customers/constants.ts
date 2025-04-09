
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
