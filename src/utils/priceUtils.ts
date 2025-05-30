
// Utilitários unificados para manipulação de preços brasileiros

// Converte uma string de preço brasileiro (formato R$ 1.234,56 ou 1234,56) para número
export const parseBrazilianPrice = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  
  // Remove símbolos de moeda, espaços e caracteres especiais, mantendo apenas dígitos, pontos e vírgulas
  let cleanValue = value.replace(/[R$\s]/g, '');
  
  // Se não há vírgula, trata como valor inteiro em reais
  if (!cleanValue.includes(',')) {
    const num = parseInt(cleanValue) || 0;
    return num;
  }
  
  // Separa a parte inteira da decimal
  const parts = cleanValue.split(',');
  const integerPart = parts[0].replace(/\./g, ''); // Remove pontos de milhares
  const decimalPart = parts[1] ? parts[1].substring(0, 2) : '00'; // Máximo 2 decimais
  
  return parseFloat(`${integerPart}.${decimalPart}`);
};

// Formata um número para o formato de preço brasileiro (sem R$)
export const formatBrazilianPrice = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Aplica máscara de preço em tempo real durante digitação - VERSÃO CORRIGIDA
export const applyPriceMask = (value: string): string => {
  // Remove tudo exceto números e vírgula
  let cleanValue = value.replace(/[^\d,]/g, '');
  
  if (!cleanValue) return '';
  
  // Se já contém vírgula, formatar mantendo a vírgula
  if (cleanValue.includes(',')) {
    const parts = cleanValue.split(',');
    const integerPart = parts[0];
    const decimalPart = parts[1] ? parts[1].substring(0, 2) : '';
    
    // Formatar parte inteira com pontos de milhares apenas se tiver 4+ dígitos
    const formattedInteger = integerPart.length >= 4 
      ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : integerPart;
    
    return decimalPart ? `${formattedInteger},${decimalPart}` : `${formattedInteger},`;
  }
  
  // Para números sem vírgula, não aplicar formatação de centavos automaticamente
  // Permitir digitação livre até que o usuário adicione vírgula manualmente
  const num = parseInt(cleanValue);
  if (isNaN(num)) return '';
  
  // Aplicar pontos de milhares apenas se tiver 4+ dígitos
  if (cleanValue.length >= 4) {
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  
  return cleanValue;
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
