
// Utilitários unificados para manipulação de preços brasileiros

// Converte uma string de preço brasileiro (formato R$ 1.234,56) para número
export const parseBrazilianPrice = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  
  // Remove símbolos de moeda, espaços e caracteres especiais, mantendo apenas dígitos, pontos e vírgulas
  let cleanValue = value.replace(/[R$\s]/g, '');
  
  // Se não há vírgula, trata como valor inteiro em reais
  if (!cleanValue.includes(',')) {
    // Remove pontos de milhares e converte
    const num = parseInt(cleanValue.replace(/\./g, '')) || 0;
    return num;
  }
  
  // Separa a parte inteira da decimal
  const parts = cleanValue.split(',');
  const integerPart = parts[0].replace(/\./g, ''); // Remove pontos de milhares
  const decimalPart = parts[1] ? parts[1].substring(0, 2) : '00'; // Máximo 2 decimais
  
  return parseFloat(`${integerPart}.${decimalPart}`);
};

// Formata um número para o formato de preço brasileiro (com R$)
export const formatBrazilianPrice = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return 'R$ ' + new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Aplica máscara de preço em tempo real - SIMPLIFICADA para uso com jQuery MaskMoney
export const applyPriceMask = (value: string): string => {
  // Esta função agora é principalmente para compatibilidade
  // O jQuery MaskMoney fará o trabalho pesado
  if (!value) return 'R$ ';
  
  // Se já tem R$, retorna como está
  if (value.includes('R$')) return value;
  
  // Caso contrário, aplica formatação básica
  const numValue = parseBrazilianPrice(value);
  return formatBrazilianPrice(numValue);
};

// Valida se uma string representa um preço válido
export const isValidPrice = (value: string): boolean => {
  if (!value) return false;
  
  const parsed = parseBrazilianPrice(value);
  return !isNaN(parsed) && parsed >= 0;
};

// Converte valor formatado para número (para uso em formulários)
export const priceStringToNumber = (priceString: string): number => {
  return parseBrazilianPrice(priceString);
};

// Converte número para string formatada (para exibição)
export const numberToPriceString = (num: number): string => {
  return formatBrazilianPrice(num);
};

// Função específica para extrair valor numérico do jQuery MaskMoney
export const extractNumericValue = (maskedValue: string): number => {
  return parseBrazilianPrice(maskedValue);
};
