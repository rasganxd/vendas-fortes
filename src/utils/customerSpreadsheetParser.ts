
import { Customer } from '@/types/customer';

interface SpreadsheetCustomerData {
  code: number;
  companyName: string; // Razão Social
  name: string; // Nome Fantasia
  address: string;
  number: string;
  neighborhood: string;
  zip: string;
  city: string;
  phone: string;
  document: string; // CPF/CNPJ
  salesRepCode: string;
  visitSequence: number;
  state: string;
}

/**
 * Parse spreadsheet format and extract customer information
 * Expected format based on the provided image:
 * CLIEN | RAZÃO SOCIAL | NOME FANTASIA | ENDEREÇO | NÚMERO | BAIRRO | CEP | CIDADE | FONE | CPF/CNPJ | VEN | SEQ DE VISITA | ESTADO
 */
export function parseCustomerSpreadsheet(text: string): Omit<Customer, 'id'>[] {
  const customers: Omit<Customer, 'id'>[] = [];
  const lines = text.split('\n');
  
  if (lines.length < 2) {
    console.warn('[SpreadsheetParser] Not enough lines in input');
    return customers;
  }
  
  // Find header line (should contain the column names)
  let headerLineIndex = -1;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].toUpperCase();
    if (line.includes('CLIEN') && line.includes('RAZÃO SOCIAL') && line.includes('NOME FANTASIA')) {
      headerLineIndex = i;
      break;
    }
  }
  
  if (headerLineIndex === -1) {
    console.warn('[SpreadsheetParser] Header line not found, trying to parse anyway');
    headerLineIndex = 0;
  }
  
  console.log(`[SpreadsheetParser] Found header at line ${headerLineIndex + 1}`);
  
  // Process data lines (skip header)
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    try {
      const customer = parseCustomerLine(line, i + 1);
      if (customer) {
        customers.push(customer);
      }
    } catch (error) {
      console.error(`[SpreadsheetParser] Error parsing line ${i + 1}:`, error);
    }
  }
  
  console.log(`[SpreadsheetParser] Successfully parsed ${customers.length} customers`);
  return customers;
}

/**
 * Parse a single customer line from the spreadsheet
 * Supports both tab-separated and pipe-separated formats
 */
function parseCustomerLine(line: string, lineNumber: number): Omit<Customer, 'id'> | null {
  // Try to determine separator (tab, pipe, or multiple spaces)
  let columns: string[];
  
  if (line.includes('\t')) {
    columns = line.split('\t');
  } else if (line.includes('|')) {
    columns = line.split('|');
  } else {
    // Split by multiple spaces (2 or more)
    columns = line.split(/\s{2,}/);
  }
  
  // Clean up columns
  columns = columns.map(col => col.trim()).filter(col => col !== '');
  
  if (columns.length < 8) {
    console.warn(`[SpreadsheetParser] Line ${lineNumber} has insufficient columns (${columns.length}), skipping`);
    return null;
  }
  
  try {
    // Map columns based on expected spreadsheet format
    const [
      codeStr,
      companyName,
      name,
      address,
      number,
      neighborhood,
      zip,
      city,
      phone,
      document,
      salesRepCode,
      visitSequenceStr,
      state
    ] = columns;
    
    // Parse and validate customer code
    const code = parseInt(codeStr, 10);
    if (isNaN(code) || code <= 0) {
      console.warn(`[SpreadsheetParser] Invalid customer code on line ${lineNumber}: ${codeStr}`);
      return null;
    }
    
    // Parse visit sequence
    const visitSequence = visitSequenceStr ? parseInt(visitSequenceStr, 10) : 0;
    
    // Build full address
    const fullAddress = number ? `${address}, ${number}` : address;
    
    // Create customer object
    const customer: Omit<Customer, 'id'> = {
      code,
      name: name || companyName || `Cliente ${code}`,
      companyName: companyName || '',
      phone: phone || '',
      address: fullAddress || '',
      neighborhood: neighborhood || '', // Campo bairro incluído
      city: city || '',
      state: state || '',
      zip: zip?.replace(/[^0-9]/g, '') || '', // Remove non-numeric characters
      zipCode: zip?.replace(/[^0-9]/g, '') || '',
      document: document?.replace(/[^0-9]/g, '') || '', // Remove non-numeric characters
      email: '',
      notes: '',
      visitDays: ['monday'], // Default to Monday
      visitFrequency: 'weekly', // Default to weekly
      visitSequence: isNaN(visitSequence) ? 0 : visitSequence,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log(`[SpreadsheetParser] Parsed customer on line ${lineNumber}:`, {
      code: customer.code,
      name: customer.name,
      neighborhood: customer.neighborhood,
      city: customer.city,
      state: customer.state
    });
    
    return customer;
  } catch (error) {
    console.error(`[SpreadsheetParser] Error parsing customer data on line ${lineNumber}:`, error);
    return null;
  }
}

/**
 * Validate parsed customer data
 */
export function validateCustomerData(customers: Omit<Customer, 'id'>[]): {
  valid: Omit<Customer, 'id'>[];
  invalid: { customer: Omit<Customer, 'id'>; errors: string[] }[];
} {
  const valid: Omit<Customer, 'id'>[] = [];
  const invalid: { customer: Omit<Customer, 'id'>; errors: string[] }[] = [];
  
  customers.forEach(customer => {
    const errors: string[] = [];
    
    // Required field validation
    if (!customer.name || customer.name.trim() === '') {
      errors.push('Nome é obrigatório');
    }
    
    if (!customer.code || customer.code <= 0) {
      errors.push('Código deve ser um número positivo');
    }
    
    // Optional validations
    if (customer.document && customer.document.length > 0) {
      const docLength = customer.document.length;
      if (docLength !== 11 && docLength !== 14) {
        errors.push('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos');
      }
    }
    
    if (customer.zip && customer.zip.length > 0 && customer.zip.length !== 8) {
      errors.push('CEP deve ter 8 dígitos');
    }
    
    if (errors.length === 0) {
      valid.push(customer);
    } else {
      invalid.push({ customer, errors });
    }
  });
  
  return { valid, invalid };
}
