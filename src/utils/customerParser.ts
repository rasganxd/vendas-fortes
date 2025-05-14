
import { Customer } from '@/types/customer';

interface RawCustomerData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  document: string;
  salesRepCode: string;
  visitSequence: number;
  visitFrequency: string;
  customerCode: number;
  notes: string;
}

/**
 * Parse the fixed-width format report and extract customer information
 * Format example:
 * ```
 * CLIEN RAZAO SOCIAL                CANAL                          EMP
 * ENDERECO                        BAIRRO              CEP         EXCL ESP
 * CIDADE                      UF  COMPRADOR           FONE        ANIVER.
 * CGC                  INSCRICAO EST.      VEN  ROTA  SEQ-VI  SEQ-EN  FREQ.
 * ```
 */
export function parseCustomerReportText(text: string): Omit<Customer, 'id'>[] {
  const customers: Omit<Customer, 'id'>[] = [];
  const lines = text.split('\n');
  
  // Process the input in blocks of 4 lines (each customer record)
  for (let i = 0; i < lines.length; i += 4) {
    // Skip if we don't have enough lines for a complete customer record
    if (i + 4 > lines.length) break;
    
    // Skip if this appears to be a header block
    if (lines[i].includes('CLIEN') && lines[i+1].includes('ENDERECO')) {
      continue;
    }
    
    // Skip empty blocks
    if (!lines[i].trim()) continue;

    try {
      const customerData = extractCustomerDataFromBlock(lines.slice(i, i + 4));
      if (customerData) {
        customers.push(mapToCustomer(customerData));
      }
    } catch (error) {
      console.error(`Error parsing customer block at line ${i}:`, error);
    }
  }
  
  return customers;
}

/**
 * Extract customer data from a 4-line block in the report
 */
function extractCustomerDataFromBlock(block: string[]): RawCustomerData | null {
  if (block.length < 4 || !block[0].trim()) {
    return null;
  }
  
  // Line 1: Contains customer name and channel
  // Line 2: Contains address, neighborhood, zip code
  // Line 3: Contains city, state, buyer name, phone, birth date
  // Line 4: Contains document, sales rep, route, visit sequence, etc.
  
  const line1 = block[0].padEnd(80); // Ensure line has enough characters
  const line2 = block[1].padEnd(80);
  const line3 = block[2].padEnd(80);
  const line4 = block[3].padEnd(80);
  
  const customerName = line1.substring(6, 40).trim();
  const address = line2.substring(0, 34).trim();
  const zip = line2.substring(50, 58).trim().replace(/[^0-9]/g, '');
  const city = line3.substring(0, 26).trim();
  const state = line3.substring(26, 28).trim();
  const phone = line3.substring(50, 62).trim();
  const document = line4.substring(0, 18).trim().replace(/[^0-9]/g, '');
  const salesRepCode = line4.substring(43, 46).trim();
  
  // Parse visit sequence and frequency
  let visitSequence = 0;
  try {
    const seqStr = line4.substring(53, 59).trim();
    visitSequence = seqStr ? parseInt(seqStr, 10) : 0;
    if (isNaN(visitSequence)) visitSequence = 0;
  } catch (e) {
    visitSequence = 0;
  }
  
  // Parse customer code
  let customerCode = 0;
  try {
    // Try to find a numeric code pattern in the text (often at the beginning of line 1)
    const codeMatch = line1.match(/^\s*(\d+)\s+/);
    if (codeMatch && codeMatch[1]) {
      customerCode = parseInt(codeMatch[1], 10);
    }
  } catch (e) {
    customerCode = 0;
  }
  
  // Map frequency code to system values
  const rawFreq = line4.substring(68, 70).trim();
  let visitFrequency = 'weekly'; // Default
  
  // Convert numerical frequency to string values used in the system
  switch (rawFreq) {
    case '1':
    case 'S':
      visitFrequency = 'weekly';
      break;
    case '2':
    case 'Q':
      visitFrequency = 'biweekly';
      break;
    case '3':
    case 'M':
      visitFrequency = 'monthly';
      break;
    case '4':
      visitFrequency = 'quarterly';
      break;
    default:
      visitFrequency = 'weekly';
  }
  
  return {
    name: customerName,
    address,
    city,
    state,
    zip,
    phone,
    document,
    salesRepCode,
    visitSequence,
    visitFrequency,
    customerCode,
    notes: ''
  };
}

/**
 * Map the extracted raw data to a Customer object
 */
function mapToCustomer(data: RawCustomerData): Omit<Customer, 'id'> {
  // Default visit days based on frequency
  let visitDays: string[] = [];
  switch (data.visitFrequency) {
    case 'weekly':
      visitDays = ['monday'];
      break;
    case 'biweekly':
      visitDays = ['monday'];
      break;
    case 'monthly':
      visitDays = ['monday'];
      break;
    case 'quarterly':
      visitDays = ['monday'];
      break;
  }
  
  return {
    name: data.name,
    code: data.customerCode || 0,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip,
    zipCode: data.zip,
    document: data.document,
    email: '',
    notes: data.notes,
    visitDays,
    visitFrequency: data.visitFrequency,
    visitSequence: data.visitSequence,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
