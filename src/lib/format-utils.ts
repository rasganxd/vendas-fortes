
// Format currency to Brazilian Real format
export const formatCurrency = (value: number | undefined | null): string => {
  // Handle undefined, null, or NaN values
  if (value === undefined || value === null || isNaN(value)) {
    value = 0;
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Convert a number to words (for currency)
export const formatCurrencyInWords = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return "zero reais";
  }

  if (value === 0) {
    return "zero reais";
  }

  const units = [
    "", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", 
    "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", 
    "dezoito", "dezenove"
  ];
  
  const tens = [
    "", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"
  ];
  
  const hundreds = [
    "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", 
    "seiscentos", "setecentos", "oitocentos", "novecentos"
  ];

  // Convert to number with 2 decimal places
  const valueFixed = Math.round(value * 100) / 100;
  
  // Split integer and decimal parts
  const [integerPart, decimalPart = 0] = valueFixed.toString().split('.').map(Number);
  
  // Format integer part
  const formatInteger = (num: number): string => {
    if (num === 0) return "";
    if (num < 20) return units[num];
    if (num < 100) {
      const unit = num % 10;
      return tens[Math.floor(num / 10)] + (unit ? " e " + units[unit] : "");
    }
    if (num === 100) return "cem";
    if (num < 1000) {
      const remainder = num % 100;
      return hundreds[Math.floor(num / 100)] + (remainder ? " e " + formatInteger(remainder) : "");
    }
    if (num < 1000000) {
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      const thousandsText = thousands === 1 ? "mil" : formatInteger(thousands) + " mil";
      return thousandsText + (remainder ? " " + formatInteger(remainder) : "");
    }
    // Handle millions
    const millions = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    const millionsText = millions === 1 ? "um milhão" : formatInteger(millions) + " milhões";
    return millionsText + (remainder ? " " + formatInteger(remainder) : "");
  };

  // Format the result
  let result = "";
  
  // Integer part
  if (integerPart === 0) {
    result = "zero reais";
  } else {
    const integerText = formatInteger(integerPart);
    result = integerText + " " + (integerPart === 1 ? "real" : "reais");
  }
  
  // Decimal part (centavos)
  if (decimalPart > 0) {
    // For formatting two digits (e.g., 0.05 -> "cinco centavos")
    const formattedDecimal = decimalPart < 10 ? formatInteger(decimalPart * 10) : formatInteger(decimalPart);
    result += " e " + formattedDecimal + " " + (decimalPart === 1 ? "centavo" : "centavos");
  }
  
  return result;
};

// Format date to Brazilian format (DD/MM/YYYY)
export const formatDateBR = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Format date to short format (DD/MM/YY)
export const formatDateShort = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).format(date);
};

// Format date and time
export const formatDateTime = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Format number with thousands separator
export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    value = 0;
  }
  return new Intl.NumberFormat('pt-BR').format(value);
};

// Format percentage
export const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    value = 0;
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
};
