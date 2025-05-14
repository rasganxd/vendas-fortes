
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
  tradingName: string; // Added for fancy name
  priceTable: string;  // Added for price table
  contactName: string; // Added for contact name
}

/**
 * Parse the fixed-width format report and extract customer information
 * Format example:
 * ```
 * CLIEN RAZAO SOCIAL                CANAL                          EMP
 * ENDERECO                        BAIRRO              CEP         EXCL ESP
 * CIDADE                      UF  COMPRADOR           FONE        ANIVER.
 * CGC                  INSCRICAO EST.      VEN  ROTA  SEQ-VI  SEQ-EN  FREQ.
 * TRADING_NAME                   TAB:  PRICE_TABLE
 * ```
 */
export function parseCustomerReportText(text: string): Omit<Customer, 'id'>[] {
  const customers: Omit<Customer, 'id'>[] = [];
  const lines = text.split('\n');
  
  // Process the input in blocks of 5 lines (each customer record)
  for (let i = 0; i < lines.length; i += 5) {
    // Skip if we don't have enough lines for a complete customer record
    if (i + 5 > lines.length) break;
    
    // Skip if this appears to be a header block
    if (lines[i].includes('CLIEN') && lines[i+1].includes('ENDERECO')) {
      continue;
    }
    
    // Skip empty blocks
    if (!lines[i].trim()) continue;

    try {
      const customerData = extractCustomerDataFromBlock(lines.slice(i, i + 5));
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
 * Extract customer data from a 5-line block in the report
 */
function extractCustomerDataFromBlock(block: string[]): RawCustomerData | null {
  if (block.length < 5 || !block[0].trim()) {
    return null;
  }
  
  // Line 1: Contains customer code, name and channel
  // Line 2: Contains address, neighborhood, zip code
  // Line 3: Contains city, state, buyer name, phone, birth date
  // Line 4: Contains document, sales rep, route, visit sequence, etc.
  // Line 5: Contains trading name and price table
  
  const line1 = block[0].padEnd(80); // Ensure line has enough characters
  const line2 = block[1].padEnd(80);
  const line3 = block[2].padEnd(80);
  const line4 = block[3].padEnd(80);
  const line5 = block.length > 4 ? block[4].padEnd(80) : '';
  
  // Extract customer code (appears at the beginning of line 1)
  let customerCode = 0;
  const codeMatch = line1.trim().match(/^\s*(\d+)\s+/);
  if (codeMatch && codeMatch[1]) {
    customerCode = parseInt(codeMatch[1], 10);
  }
  
  // Extract customer name - after the code at the beginning
  const customerName = line1.substring(line1.indexOf(' ') + 1, 40).trim();
  
  // Extract address from line 2
  const address = line2.substring(0, 34).trim();
  
  // Extract neighborhood from line 2
  const neighborhood = line2.substring(34, 50).trim();
  
  // Extract zip code from line 2
  const zip = line2.substring(50, 58).trim().replace(/[^0-9]/g, '');
  
  // Extract city from line 3
  const city = line3.substring(0, 26).trim();
  
  // Extract state from line 3
  const state = line3.substring(26, 28).trim();
  
  // Extract contact/buyer name from line 3
  const contactName = line3.substring(28, 45).trim();
  
  // Extract phone from line 3
  const phone = line3.substring(45, 60).trim();
  
  // Extract document from line 4
  const document = line4.substring(0, 18).trim().replace(/[^0-9]/g, '');
  
  // Extract sales rep code from line 4
  const salesRepCode = line4.substring(43, 46).trim();
  
  // Extract visit sequence from line 4
  let visitSequence = 0;
  try {
    const seqStr = line4.substring(46, 60).trim();
    const seqMatch = seqStr.match(/(\d+)/);
    if (seqMatch && seqMatch[1]) {
      visitSequence = parseInt(seqMatch[1], 10);
    }
    if (isNaN(visitSequence)) visitSequence = 0;
  } catch (e) {
    visitSequence = 0;
  }
  
  // Extract trading name and price table from line 5
  let tradingName = '';
  let priceTable = '';
  
  if (line5) {
    tradingName = line5.substring(0, 35).trim();
    
    // Look for "TAB:" followed by the price table
    const tabMatch = line5.match(/TAB:\s*(\d+)\s+([^\n]+)/);
    if (tabMatch) {
      priceTable = tabMatch[2] ? tabMatch[2].trim() : '';
    }
  }
  
  // Map frequency code to system values
  const rawFreq = line4.substring(60, 70).trim().split(/\s+/).pop() || '';
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
    case '67': // Added this based on your data
      visitFrequency = 'quarterly';
      break;
    default:
      visitFrequency = 'weekly';
  }
  
  return {
    customerCode,
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
    notes: '',
    tradingName,
    priceTable,
    contactName
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
  
  // Use trading name if available, otherwise use the regular name
  const displayName = data.tradingName ? data.tradingName : data.name;
  
  // Prepare notes with additional information
  const notes = [
    data.contactName ? `Contato: ${data.contactName}` : '',
    data.priceTable ? `Tabela de Preços: ${data.priceTable}` : '',
  ].filter(note => note).join('\n');
  
  return {
    name: displayName,
    code: data.customerCode || 0,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    zip: data.zip,
    zipCode: data.zip,
    document: data.document,
    email: '',
    notes: notes,
    visitDays,
    visitFrequency: data.visitFrequency,
    visitSequence: data.visitSequence,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
