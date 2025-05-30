
// Converte uma string de preço brasileiro (formato R$ 1.234,56) para número
export const parseBrazilianPrice = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  
  // Remove o símbolo da moeda e espaços
  let cleanValue = value.replace(/[R$\s]/g, '');
  
  // Se não há vírgula, trata como centavos se for menor que 1000
  if (!cleanValue.includes(',')) {
    const num = parseInt(cleanValue);
    if (num < 1000 && cleanValue.length <= 3) {
      return num / 100; // Trata como centavos
    }
    return num;
  }
  
  // Separa a parte inteira da decimal
  const parts = cleanValue.split(',');
  const integerPart = parts[0].replace(/\./g, ''); // Remove pontos de milhares
  const decimalPart = parts[1] ? parts[1].substring(0, 2) : '00'; // Máximo 2 decimais
  
  return parseFloat(`${integerPart}.${decimalPart}`);
};

// Formata um número para o formato de preço brasileiro
export const formatBrazilianPrice = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Formata um número para entrada de texto (sem R$)
export const formatPriceForInput = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '';
  }
  
  return formatBrazilianPrice(value);
};

// Valida se uma string representa um preço válido
export const isValidPrice = (value: string): boolean => {
  if (!value) return false;
  
  const parsed = parseBrazilianPrice(value);
  return !isNaN(parsed) && parsed >= 0;
};
