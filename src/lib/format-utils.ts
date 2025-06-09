
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDateBR = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
};

export const formatDate = formatDateBR; // Alias para compatibilidade

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

// Função para converter número em palavras (versão simplificada)
export const formatCurrencyInWords = (value: number): string => {
  // Implementação simplificada - retorna apenas o valor em reais por extenso
  const integerPart = Math.floor(value);
  const decimalPart = Math.round((value - integerPart) * 100);
  
  if (integerPart === 0 && decimalPart === 0) {
    return "zero reais";
  }
  
  // Implementação básica para números pequenos
  const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const teens = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
  
  let result = "";
  
  if (integerPart >= 100) {
    if (integerPart === 100) {
      result += "cem";
    } else {
      result += hundreds[Math.floor(integerPart / 100)];
    }
    integerPart %= 100;
    if (integerPart > 0) result += " e ";
  }
  
  if (integerPart >= 20) {
    result += tens[Math.floor(integerPart / 10)];
    integerPart %= 10;
    if (integerPart > 0) result += " e ";
  } else if (integerPart >= 10) {
    result += teens[integerPart - 10];
    integerPart = 0;
  }
  
  if (integerPart > 0) {
    result += units[integerPart];
  }
  
  if (result === "") result = "zero";
  
  result += result === "um" ? " real" : " reais";
  
  if (decimalPart > 0) {
    result += " e ";
    if (decimalPart < 10) {
      result += units[decimalPart] + (decimalPart === 1 ? " centavo" : " centavos");
    } else if (decimalPart < 20) {
      result += teens[decimalPart - 10] + " centavos";
    } else {
      const tensDigit = Math.floor(decimalPart / 10);
      const unitsDigit = decimalPart % 10;
      result += tens[tensDigit];
      if (unitsDigit > 0) {
        result += " e " + units[unitsDigit];
      }
      result += " centavos";
    }
  }
  
  return result;
};
