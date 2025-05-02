
/**
 * Format a number as Brazilian currency (BRL)
 * @param value - The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Format a number as a percentage
 * @param value - The number to format
 * @returns Formatted percentage string
 */
export const formatPercent = (value: number | undefined): string => {
  if (value === undefined || value === null) {
    return '0%';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

/**
 * Convert a number to its text representation in Portuguese
 * @param value - The number to convert
 * @returns Text representation of the number
 */
export const numberToWords = (value: number): string => {
  if (value === undefined || value === null) {
    return 'zero';
  }
  
  const units = [
    '', 'um', 'dois', 'três', 'quatro', 'cinco', 
    'seis', 'sete', 'oito', 'nove', 'dez', 'onze',
    'doze', 'treze', 'catorze', 'quinze', 'dezesseis',
    'dezessete', 'dezoito', 'dezenove'
  ];
  
  const tens = [
    '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta',
    'sessenta', 'setenta', 'oitenta', 'noventa'
  ];
  
  const hundreds = [
    '', 'cento', 'duzentos', 'trezentos', 'quatrocentos',
    'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'
  ];
  
  if (value === 0) return 'zero';
  
  const formatBelowThousand = (n: number): string => {
    let result = '';
    
    if (n >= 100) {
      if (n === 100) return 'cem';
      result += hundreds[Math.floor(n / 100)] + ' e ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' e ';
      n %= 10;
    }
    
    if (n > 0) {
      result += units[n];
    } else if (result.endsWith(' e ')) {
      result = result.slice(0, -3); // Remove trailing ' e '
    }
    
    return result;
  };

  // Handle thousands and millions
  let result = '';
  if (value >= 1000000) {
    const millions = Math.floor(value / 1000000);
    value %= 1000000;
    result += formatBelowThousand(millions) + (millions === 1 ? ' milhão' : ' milhões');
    if (value > 0) result += ' e ';
  }
  
  if (value >= 1000) {
    const thousands = Math.floor(value / 1000);
    value %= 1000;
    result += formatBelowThousand(thousands) + ' mil';
    if (value > 0) result += ' e ';
  }
  
  if (value > 0) {
    result += formatBelowThousand(value);
  }
  
  return result;
};

/**
 * Format a currency amount in words (for official documents)
 * @param value - The amount to format
 * @returns Text representation of the amount
 */
export const formatCurrencyInWords = (value: number | undefined): string => {
  if (value === undefined || value === null) {
    return 'zero reais';
  }
  
  const intValue = Math.floor(value);
  const centValue = Math.round((value - intValue) * 100);
  
  const reaisText = intValue > 0 ? numberToWords(intValue) + (intValue === 1 ? ' real' : ' reais') : '';
  const centavosText = centValue > 0 ? numberToWords(centValue) + (centValue === 1 ? ' centavo' : ' centavos') : '';
  
  if (reaisText && centavosText) {
    return reaisText + ' e ' + centavosText;
  } else if (reaisText) {
    return reaisText;
  } else if (centavosText) {
    return centavosText;
  } else {
    return 'zero reais';
  }
};
