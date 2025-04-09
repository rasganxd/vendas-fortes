
export function formatDateToBR(date?: Date): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  
  return parsedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
}

export function formatDateTimeToDisplay(date?: Date | string): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  
  return parsedDate.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateForInput(date?: Date | string): string {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  
  return parsedDate.toISOString().split('T')[0];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
