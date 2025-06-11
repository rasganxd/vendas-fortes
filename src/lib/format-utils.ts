
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

export const formatDateBR = (date: Date | string): string => {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  
  return parsedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
};

export const formatCurrencyInWords = (value: number): string => {
  // Simplified implementation for currency in words
  // This is a basic version - for production you might want a more complete implementation
  
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  
  if (value === 0) return 'zero reais';
  
  const integerPart = Math.floor(value);
  const decimalPart = Math.round((value - integerPart) * 100);
  
  const convertNumber = (num: number): string => {
    if (num === 0) return '';
    if (num === 100) return 'cem';
    if (num < 10) return unidades[num];
    if (num < 20) return especiais[num - 10];
    if (num < 100) {
      const dez = Math.floor(num / 10);
      const uni = num % 10;
      return dezenas[dez] + (uni > 0 ? ` e ${unidades[uni]}` : '');
    }
    if (num < 1000) {
      const cen = Math.floor(num / 100);
      const resto = num % 100;
      return centenas[cen] + (resto > 0 ? ` e ${convertNumber(resto)}` : '');
    }
    
    // For larger numbers, simplified approach
    return num.toString();
  };
  
  let result = convertNumber(integerPart);
  
  if (integerPart === 1) {
    result += ' real';
  } else {
    result += ' reais';
  }
  
  if (decimalPart > 0) {
    result += ` e ${convertNumber(decimalPart)}`;
    if (decimalPart === 1) {
      result += ' centavo';
    } else {
      result += ' centavos';
    }
  }
  
  return result;
};
