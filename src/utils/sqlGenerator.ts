
import { 
  Customer, 
  Product, 
  Order, 
  OrderItem, 
  Payment, 
  SalesRep, 
  Vehicle, 
  PaymentMethod, 
  PaymentTable,
  ProductGroup,
  ProductCategory,
  ProductBrand,
  DeliveryRoute,
  Load,
  RouteStop,
  LoadItem
} from '@/types';

type FieldTypeMapping = {
  [key: string]: {
    sqlType: string;
    isArray?: boolean;
    foreignKey?: string;
    unique?: boolean;
  }
};

const typeNameMapping: Record<string, string> = {
  'string': 'text',
  'number': 'numeric',
  'boolean': 'boolean',
  'Date': 'timestamp with time zone',
  'any': 'jsonb'
};

// Define mappings for each type with field types and relationships
const typeMappings: Record<string, FieldTypeMapping> = {
  'Customer': {
    id: { sqlType: 'uuid', unique: true },
    code: { sqlType: 'integer' },
    name: { sqlType: 'text' },
    phone: { sqlType: 'text' },
    email: { sqlType: 'text' },
    address: { sqlType: 'text' },
    city: { sqlType: 'text' },
    state: { sqlType: 'text' },
    zip: { sqlType: 'text' },
    zipCode: { sqlType: 'text' },
    notes: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' },
    document: { sqlType: 'text' },
    visitDays: { sqlType: 'text', isArray: true },
    visitFrequency: { sqlType: 'text' },
    visitSequence: { sqlType: 'integer' }
  },
  'Product': {
    id: { sqlType: 'uuid', unique: true },
    code: { sqlType: 'integer' },
    name: { sqlType: 'text' },
    description: { sqlType: 'text' },
    price: { sqlType: 'numeric' },
    cost: { sqlType: 'numeric' },
    stock: { sqlType: 'numeric' },
    minStock: { sqlType: 'numeric' },
    maxDiscountPercentage: { sqlType: 'numeric' },
    groupId: { sqlType: 'uuid', foreignKey: 'product_groups' },
    categoryId: { sqlType: 'uuid', foreignKey: 'product_categories' },
    brandId: { sqlType: 'uuid', foreignKey: 'product_brands' },
    unit: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' }
  },
  'Order': {
    id: { sqlType: 'uuid', unique: true },
    code: { sqlType: 'integer' },
    customerId: { sqlType: 'uuid', foreignKey: 'customers' },
    customerName: { sqlType: 'text' },
    salesRepId: { sqlType: 'uuid', foreignKey: 'sales_reps' },
    salesRepName: { sqlType: 'text' },
    date: { sqlType: 'timestamp with time zone' },
    dueDate: { sqlType: 'timestamp with time zone' },
    total: { sqlType: 'numeric' },
    discount: { sqlType: 'numeric' },
    status: { sqlType: 'text' },
    paymentStatus: { sqlType: 'text' },
    paymentMethodId: { sqlType: 'uuid', foreignKey: 'payment_methods' },
    paymentMethod: { sqlType: 'text' },
    paymentTableId: { sqlType: 'uuid', foreignKey: 'payment_tables' },
    payments: { sqlType: 'text', isArray: true },
    notes: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' },
    archived: { sqlType: 'boolean' },
    deliveryZip: { sqlType: 'text' },
    deliveryAddress: { sqlType: 'text' },
    deliveryCity: { sqlType: 'text' },
    deliveryState: { sqlType: 'text' }
  },
  'OrderItem': {
    id: { sqlType: 'uuid', unique: true },
    productId: { sqlType: 'uuid', foreignKey: 'products' },
    productName: { sqlType: 'text' },
    productCode: { sqlType: 'integer' },
    quantity: { sqlType: 'numeric' },
    price: { sqlType: 'numeric' },
    unitPrice: { sqlType: 'numeric' },
    discount: { sqlType: 'numeric' },
    total: { sqlType: 'numeric' },
    orderId: { sqlType: 'uuid', foreignKey: 'orders' }
  },
  'Payment': {
    id: { sqlType: 'uuid', unique: true },
    orderId: { sqlType: 'uuid', foreignKey: 'orders' },
    date: { sqlType: 'timestamp with time zone' },
    amount: { sqlType: 'numeric' },
    method: { sqlType: 'text' },
    notes: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' },
    status: { sqlType: 'text' },
    dueDate: { sqlType: 'timestamp with time zone' },
    amountInWords: { sqlType: 'text' },
    paymentLocation: { sqlType: 'text' },
    emissionLocation: { sqlType: 'text' },
    customerName: { sqlType: 'text' },
    customerDocument: { sqlType: 'text' },
    customerAddress: { sqlType: 'text' }
  },
  'PaymentInstallment': {
    id: { sqlType: 'uuid', unique: true },
    paymentId: { sqlType: 'uuid', foreignKey: 'payments' },
    dueDate: { sqlType: 'timestamp with time zone' },
    amount: { sqlType: 'numeric' }
  },
  'SalesRep': {
    id: { sqlType: 'uuid', unique: true },
    name: { sqlType: 'text' },
    email: { sqlType: 'text' },
    phone: { sqlType: 'text' },
    document: { sqlType: 'text' },
    notes: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' },
    role: { sqlType: 'text' },
    region: { sqlType: 'text' },
    active: { sqlType: 'boolean' },
    code: { sqlType: 'integer' },
    address: { sqlType: 'text' },
    city: { sqlType: 'text' },
    state: { sqlType: 'text' },
    zip: { sqlType: 'text' }
  },
  'Vehicle': {
    id: { sqlType: 'uuid', unique: true },
    name: { sqlType: 'text' },
    type: { sqlType: 'text' },
    licensePlate: { sqlType: 'text' },
    model: { sqlType: 'text' },
    capacity: { sqlType: 'numeric' },
    active: { sqlType: 'boolean' },
    status: { sqlType: 'text' },
    notes: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' },
    driverName: { sqlType: 'text' }
  },
  'ProductGroup': {
    id: { sqlType: 'uuid', unique: true },
    name: { sqlType: 'text' },
    description: { sqlType: 'text' },
    notes: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' }
  },
  'ProductCategory': {
    id: { sqlType: 'uuid', unique: true },
    name: { sqlType: 'text' },
    description: { sqlType: 'text' },
    notes: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' }
  },
  'ProductBrand': {
    id: { sqlType: 'uuid', unique: true },
    name: { sqlType: 'text' },
    description: { sqlType: 'text' },
    notes: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' }
  },
  'PaymentMethod': {
    id: { sqlType: 'uuid', unique: true },
    name: { sqlType: 'text' },
    description: { sqlType: 'text' },
    notes: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' },
    type: { sqlType: 'text' },
    active: { sqlType: 'boolean' }
  },
  'PaymentTable': {
    id: { sqlType: 'uuid', unique: true },
    name: { sqlType: 'text' },
    description: { sqlType: 'text' },
    notes: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' },
    type: { sqlType: 'text' },
    payableTo: { sqlType: 'text' },
    paymentLocation: { sqlType: 'text' },
    active: { sqlType: 'boolean' }
  },
  'PaymentTableInstallment': {
    id: { sqlType: 'uuid', unique: true },
    installment: { sqlType: 'integer' },
    percentage: { sqlType: 'numeric' },
    days: { sqlType: 'integer' },
    description: { sqlType: 'text' },
    paymentTableId: { sqlType: 'uuid', foreignKey: 'payment_tables' }
  },
  'DeliveryRoute': {
    id: { sqlType: 'uuid', unique: true },
    name: { sqlType: 'text' },
    date: { sqlType: 'timestamp with time zone' },
    driverId: { sqlType: 'uuid', foreignKey: 'sales_reps' },
    driverName: { sqlType: 'text' },
    vehicleId: { sqlType: 'uuid', foreignKey: 'vehicles' },
    vehicleName: { sqlType: 'text' },
    status: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' }
  },
  'RouteStop': {
    id: { sqlType: 'uuid', unique: true },
    routeId: { sqlType: 'uuid', foreignKey: 'routes' },
    customerId: { sqlType: 'uuid', foreignKey: 'customers' },
    customerName: { sqlType: 'text' },
    address: { sqlType: 'text' },
    city: { sqlType: 'text' },
    state: { sqlType: 'text' },
    zip: { sqlType: 'text' },
    zipCode: { sqlType: 'text' },
    lat: { sqlType: 'numeric' },
    lng: { sqlType: 'numeric' },
    sequence: { sqlType: 'integer' },
    position: { sqlType: 'integer' },
    status: { sqlType: 'text' },
    completed: { sqlType: 'boolean' },
    orderId: { sqlType: 'uuid', foreignKey: 'orders' }
  },
  'Load': {
    id: { sqlType: 'uuid', unique: true },
    name: { sqlType: 'text' },
    date: { sqlType: 'timestamp with time zone' },
    vehicleId: { sqlType: 'uuid', foreignKey: 'vehicles' },
    vehicleName: { sqlType: 'text' },
    salesRepId: { sqlType: 'uuid', foreignKey: 'sales_reps' },
    status: { sqlType: 'text' },
    total: { sqlType: 'numeric' },
    notes: { sqlType: 'text' },
    createdAt: { sqlType: 'timestamp with time zone' },
    updatedAt: { sqlType: 'timestamp with time zone' },
    orderIds: { sqlType: 'text', isArray: true },
    locked: { sqlType: 'boolean' }
  },
  'LoadItem': {
    id: { sqlType: 'uuid', unique: true },
    loadId: { sqlType: 'uuid', foreignKey: 'loads' },
    productId: { sqlType: 'uuid', foreignKey: 'products' },
    productName: { sqlType: 'text' },
    quantity: { sqlType: 'numeric' },
    price: { sqlType: 'numeric' },
    total: { sqlType: 'numeric' },
    orderId: { sqlType: 'uuid', foreignKey: 'orders' },
    productCode: { sqlType: 'integer' },
    customerId: { sqlType: 'uuid', foreignKey: 'customers' }
  }
};

// Table definitions with proper naming
const tableDefinitions: Record<string, string> = {
  'Customer': 'customers',
  'Product': 'products',
  'Order': 'orders',
  'OrderItem': 'order_items',
  'Payment': 'payments',
  'PaymentInstallment': 'payment_installments',
  'SalesRep': 'sales_reps',
  'Vehicle': 'vehicles',
  'ProductGroup': 'product_groups',
  'ProductCategory': 'product_categories',
  'ProductBrand': 'product_brands',
  'PaymentMethod': 'payment_methods',
  'PaymentTable': 'payment_tables',
  'PaymentTableInstallment': 'payment_table_installments',
  'DeliveryRoute': 'routes',
  'RouteStop': 'route_stops',
  'Load': 'loads',
  'LoadItem': 'load_items',
};

/**
 * Generates SQL to create a table for a specific type
 */
export const generateTableSQL = (typeName: string): string => {
  const tableName = tableDefinitions[typeName];
  if (!tableName) {
    return `-- Type ${typeName} not found in table definitions`;
  }
  
  const typeMapping = typeMappings[typeName];
  if (!typeMapping) {
    return `-- Type mapping for ${typeName} not found`;
  }
  
  const fieldLines = Object.entries(typeMapping).map(([field, config]) => {
    let line = `  ${field}_snake_case ${config.sqlType}`;
    
    if (config.isArray) {
      line = `  ${field}_snake_case ${config.sqlType}[]`;
    }
    
    if (field === 'id') {
      line += ' PRIMARY KEY DEFAULT uuid_generate_v4()';
    } else if (config.unique) {
      line += ' UNIQUE';
    }
    
    return line;
  }).join(',\n');
  
  let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n${fieldLines}\n);\n\n`;
  
  // Add foreign key constraints
  const foreignKeys = Object.entries(typeMapping)
    .filter(([_field, config]) => config.foreignKey)
    .map(([field, config]) => {
      return `ALTER TABLE ${tableName} ADD CONSTRAINT fk_${tableName}_${field}_snake_case
  FOREIGN KEY (${field}_snake_case) REFERENCES ${config.foreignKey} (id_snake_case);`;
    });
  
  if (foreignKeys.length > 0) {
    sql += foreignKeys.join('\n') + '\n';
  }
  
  // Replace placeholder column names with snake_case versions
  return sql.replace(/_snake_case/g, '');
}

/**
 * Generates SQL create extension statement for UUID support
 */
const generateExtensionsSQL = (): string => {
  return `-- Enable UUID extension\nCREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n`;
}

/**
 * Generates SQL for dropping all tables in reverse dependency order
 */
const generateDropTablesSQL = (): string => {
  // Order tables based on dependencies (children first, then parents)
  const orderedTables = [
    'route_stops', 'load_items', 'order_items', 'payment_installments',
    'payments', 'orders', 'loads', 'routes',
    'customers', 'products', 'vehicles', 'sales_reps',
    'product_groups', 'product_categories', 'product_brands',
    'payment_methods', 'payment_tables', 'payment_table_installments'
  ];
  
  return `-- Drop tables in reverse dependency order\n${
    orderedTables.map(table => `DROP TABLE IF EXISTS ${table} CASCADE;`).join('\n')
  }\n\n`;
}

/**
 * Generates complete SQL script for all tables
 */
export const generateCompleteSQL = (includeDrops: boolean = false): string => {
  let sql = '-- Generated SQL script for creating tables in Supabase\n\n';
  
  if (includeDrops) {
    sql += generateDropTablesSQL();
  }
  
  sql += generateExtensionsSQL();
  
  const tableCreationOrder = [
    'ProductGroup', 'ProductCategory', 'ProductBrand',
    'PaymentMethod', 'PaymentTable', 'Customer',
    'SalesRep', 'Vehicle', 'Product',
    'Order', 'OrderItem', 'Payment', 'PaymentInstallment',
    'DeliveryRoute', 'RouteStop', 'Load', 'LoadItem'
  ];
  
  for (const typeName of tableCreationOrder) {
    sql += `-- Create table for ${typeName}\n`;
    sql += generateTableSQL(typeName);
    sql += '\n';
  }
  
  // Add additional indexes for performance
  sql += `-- Create indexes for better performance\n`;
  sql += `CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (name);\n`;
  sql += `CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);\n`;
  sql += `CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders (customer_id);\n`;
  sql += `CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);\n`;
  sql += `CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments (order_id);\n`;
  
  return sql;
}
