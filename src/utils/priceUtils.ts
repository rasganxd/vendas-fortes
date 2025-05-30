
// Utilitários unificados para manipulação de preços brasileiros

// Converte uma string de preço brasileiro (formato R$ 1.234,56 ou 1234,56) para número
export const parseBrazilianPrice = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  
  // Remove símbolos de moeda, espaços e caracteres especiais, mantendo apenas dígitos, pontos e vírgulas
  let cleanValue = value.replace(/[R$\s]/g, '');
  
  // Se não há vírgula, trata como valor inteiro ou centavos
  if (!cleanValue.includes(',')) {
    const num = parseInt(cleanValue) || 0;
    // Se é um número pequeno (até 3 dígitos), pode ser centavos
    if (num < 1000 && cleanValue.length <= 3) {
      return num / 100;
    }
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

// Formata um número para entrada de texto com máscara em tempo real
export const formatPriceForInput = (value: string): string => {
  if (!value) return '';
  
  // Remove tudo exceto dígitos
  let numbers = value.replace(/\D/g, '');
  
  // Se vazio, retorna vazio
  if (!numbers) return '';
  
  // Converte para centavos e depois para reais
  const cents = parseInt(numbers);
  const reais = cents / 100;
  
  return formatBrazilianPrice(reais);
};

// Aplica máscara de preço em tempo real durante digitação
export const applyPriceMask = (value: string): string => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para número (centavos)
  const num = parseInt(numbers);
  
  // Converte centavos para reais
  const reais = num / 100;
  
  // Formata com vírgulas e pontos
  return formatBrazilianPrice(reais);
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
