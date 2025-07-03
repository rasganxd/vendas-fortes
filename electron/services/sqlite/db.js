
const Database = require('better-sqlite3');
const path = require('node:path');
const { app } = require('electron');

// In an Electron app, data should be stored in the user's data directory.
const dbPath = path.join(app.getPath('userData'), 'vendas.db');

console.log(`Database path: ${dbPath}`);

const db = new Database(dbPath, { verbose: console.log });

// Database schema. Starting with customers.
// "name" is Razão Social (optional)
// "fantasyName" is Nome Fantasia (required, as it's the display name)
const schema = `
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    code INTEGER UNIQUE,
    name TEXT,
    fantasyName TEXT NOT NULL,
    cnpj TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    salesRepId TEXT,
    salesRepName TEXT,
    active BOOLEAN DEFAULT TRUE,
    visitFrequency TEXT,
    visitSequence INTEGER DEFAULT 0,
    visitSequences TEXT,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS update_customers_updatedAt
AFTER UPDATE ON customers
FOR EACH ROW
BEGIN
    UPDATE customers SET updatedAt = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
`;

/**
 * Initializes the database, creating tables if they don't exist.
 */
const initializeDatabase = () => {
  try {
    console.log('Initializing database schema...');
    db.exec(schema);
    
    // Add visitSequences column if it doesn't exist (migration)
    try {
      db.exec(`ALTER TABLE customers ADD COLUMN visitSequences TEXT;`);
      console.log('Added visitSequences column to customers table');
    } catch (error) {
      // Column already exists, ignore error
      console.log('visitSequences column already exists');
    }
    
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = { db, initializeDatabase };
