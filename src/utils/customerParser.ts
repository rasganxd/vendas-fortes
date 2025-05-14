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
  // First try to detect if this is the new single-line format
  const lines = text.split('\n');
  
  // Check if the first line contains the headers for the new format
  if (lines[0].includes('CLIEN RAZAO SOCIAL') && 
      lines[0].includes('NOME FANTASIA') && 
      lines[0].includes('COMPRADOR') && 
      lines[0].includes('ENDERECO')) {
    return parseCustomerSimpleFormat(text);
  }
  
  // Otherwise use the original multi-line format parser
  return parseCustomerMultilineFormat(text);
}

/**
 * Parse the single-line format report and extract customer information
 * Format example:
 * ```
 * CLIEN RAZAO SOCIAL                   NOME FANTASIA        COMPRADOR        ENDERECO                       BAIRRO       CIDADE
 *         3 JOSE MARIA RODRIGUES DOS SANTO CATADOR INDIVIDUAL                    RUA ALBINO CAMPOS COLETTI318D  SANTO ANTONIOCHAPECO
 * ```
 */
function parseCustomerSimpleFormat(text: string): Omit<Customer, 'id'>[] {
  const customers: Omit<Customer, 'id'>[] = [];
  const lines = text.split('\n');
  
  // Skip empty lines
  if (lines.length < 2) return customers;
  
  const headerLine = lines[0].trim();
  
  // Try to identify column positions from the header
  const columnPositions = {
    codeStart: headerLine.indexOf('CLIEN') >= 0 ? headerLine.indexOf('CLIEN') : 0,
    nameStart: headerLine.indexOf('RAZAO SOCIAL') >= 0 ? headerLine.indexOf('RAZAO SOCIAL') : 10,
    tradingNameStart: headerLine.indexOf('NOME FANTASIA') >= 0 ? headerLine.indexOf('NOME FANTASIA') : 40,
    contactNameStart: headerLine.indexOf('COMPRADOR') >= 0 ? headerLine.indexOf('COMPRADOR') : 60,
    addressStart: headerLine.indexOf('ENDERECO') >= 0 ? headerLine.indexOf('ENDERECO') : 80,
    neighborhoodStart: headerLine.indexOf('BAIRRO') >= 0 ? headerLine.indexOf('BAIRRO') : 110,
    cityStart: headerLine.indexOf('CIDADE') >= 0 ? headerLine.indexOf('CIDADE') : 125
  };
  
  // Process each line (skip the header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Ensure the line is long enough by padding it
    const paddedLine = line.padEnd(150);
    
    try {
      // Extract customer code - usually appears at the beginning of the line after some spaces
      const codeMatch = paddedLine.trim().match(/^\s*(\d+)\s+/);
      let customerCode = 0;
      if (codeMatch && codeMatch[1]) {
        customerCode = parseInt(codeMatch[1], 10);
      }
      
      // Extract customer data based on identified column positions
      const name = paddedLine.substring(
        paddedLine.indexOf(' ') + 1, 
        columnPositions.tradingNameStart
      ).trim();
      
      const tradingName = paddedLine.substring(
        columnPositions.tradingNameStart, 
        columnPositions.contactNameStart
      ).trim();
      
      const contactName = paddedLine.substring(
        columnPositions.contactNameStart, 
        columnPositions.addressStart
      ).trim();
      
      const address = paddedLine.substring(
        columnPositions.addressStart, 
        columnPositions.neighborhoodStart
      ).trim();
      
      const neighborhood = paddedLine.substring(
        columnPositions.neighborhoodStart, 
        columnPositions.cityStart
      ).trim();
      
      const cityStateMatch = paddedLine.substring(columnPositions.cityStart).match(/([A-Za-zÀ-ÿ\s.-]+)([A-Z]{2})?/);
      let city = '';
      let state = '';
      
      if (cityStateMatch) {
        city = cityStateMatch[1].trim();
        state = cityStateMatch[2] ? cityStateMatch[2].trim() : '';
      }
      
      // Build customer object
      const customer: Omit<Customer, 'id'> = {
        name: name || tradingName || "Cliente sem nome",
        code: customerCode || 0,
        phone: "",
        address: address || "",
        city: city || "",
        state: state || "",
        zip: "",
        zipCode: "",
        document: "",
        email: "",
        notes: tradingName ? `Nome Fantasia: ${tradingName}\nBairro: ${neighborhood}` : `Bairro: ${neighborhood}`,
        visitDays: ['monday'], // Default to Monday
        visitFrequency: 'weekly', // Default to weekly
        visitSequence: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add contact name to notes if present
      if (contactName) {
        customer.notes = `${customer.notes}\nContato: ${contactName}`.trim();
      }
      
      customers.push(customer);
    } catch (error) {
      console.error(`Error parsing customer at line ${i}:`, error);
    }
  }
  
  return customers;
}

/**
 * Parse the multi-line format report and extract customer information (original parser)
 */
function parseCustomerMultilineFormat(text: string): Omit<Customer, 'id'>[] {
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
