
export function formatDateToBR(date?: Date | string): string {
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

// Helper to ensure a value is a Date object
export function ensureDate(date: Date | string): Date {
  return typeof date === 'string' ? new Date(date) : date;
}

// New date period utilities
export function isToday(date: Date | string): boolean {
  if (!date) return false;
  
  const checkDate = ensureDate(date);
  const today = new Date();
  
  return checkDate.toDateString() === today.toDateString();
}

export function isYesterday(date: Date | string): boolean {
  if (!date) return false;
  
  const checkDate = ensureDate(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return checkDate.toDateString() === yesterday.toDateString();
}

export function isThisWeek(date: Date | string): boolean {
  if (!date) return false;
  
  const checkDate = ensureDate(date);
  const today = new Date();
  
  // Get start of this week (Monday)
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so we want Monday
  startOfWeek.setDate(today.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Get end of this week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return checkDate >= startOfWeek && checkDate <= endOfWeek;
}

export function isLastWeek(date: Date | string): boolean {
  if (!date) return false;
  
  const checkDate = ensureDate(date);
  const today = new Date();
  
  // Get start of last week
  const startOfLastWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfLastWeek.setDate(today.getDate() - daysToSubtract - 7);
  startOfLastWeek.setHours(0, 0, 0, 0);
  
  // Get end of last week
  const endOfLastWeek = new Date(startOfLastWeek);
  endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
  endOfLastWeek.setHours(23, 59, 59, 999);
  
  return checkDate >= startOfLastWeek && checkDate <= endOfLastWeek;
}

export function isThisMonth(date: Date | string): boolean {
  if (!date) return false;
  
  const checkDate = ensureDate(date);
  const today = new Date();
  
  return checkDate.getMonth() === today.getMonth() && 
         checkDate.getFullYear() === today.getFullYear();
}

export function isLastMonth(date: Date | string): boolean {
  if (!date) return false;
  
  const checkDate = ensureDate(date);
  const today = new Date();
  
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  
  return checkDate.getMonth() === lastMonth.getMonth() && 
         checkDate.getFullYear() === lastMonth.getFullYear();
}

export function getDateRangeLabel(period: string): string {
  switch (period) {
    case 'today':
      return 'Hoje';
    case 'yesterday':
      return 'Ontem';
    case 'this_week':
      return 'Esta semana';
    case 'last_week':
      return 'Semana passada';
    case 'this_month':
      return 'Este mês';
    case 'last_month':
      return 'Mês passado';
    case 'all':
    default:
      return 'Todos os períodos';
  }
}
