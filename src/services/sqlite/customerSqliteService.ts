
import db from './db';
import { Customer } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const rowToCustomer = (row: any): Customer => ({
  id: row.id,
  code: row.code,
  name: row.fantasyName, // Nome Fantasia
  companyName: row.name, // Razão Social
  document: row.cnpj,
  phone: row.phone,
  address: row.address,
  city: row.city,
  state: row.state,
  zip: row.zip,
  notes: row.notes || '',
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt),
  salesRepId: row.salesRepId,
  salesRepName: row.salesRepName,
  visitFrequency: row.visitFrequency,
  active: row.active === 1,
  email: row.email,
});

class CustomerSqliteService {
  getAll(): Promise<Customer[]> {
    return new Promise((resolve) => {
      const stmt = db.prepare('SELECT * FROM customers ORDER BY fantasyName');
      const rows = stmt.all() as any[];
      resolve(rows.map(rowToCustomer));
    });
  }

  getById(id: string): Promise<Customer | null> {
    return new Promise((resolve) => {
      const stmt = db.prepare('SELECT * FROM customers WHERE id = ?');
      const row = stmt.get(id) as any;
      resolve(row ? rowToCustomer(row) : null);
    });
  }

  add(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return new Promise((resolve) => {
      const id = uuidv4();
      const { code, name, companyName, document, email, phone, address, city, state, zip, salesRepId, salesRepName, active, visitFrequency, notes } = customer as Customer;
      
      const stmt = db.prepare(
        `INSERT INTO customers (id, code, name, fantasyName, cnpj, email, phone, address, city, state, zip, salesRepId, salesRepName, active, visitFrequency, notes, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );
      
      stmt.run(id, code, companyName, name, document, email, phone, address, city, state, zip, salesRepId, salesRepName, active === false ? 0 : 1, visitFrequency, notes);
      resolve(id);
    });
  }

  update(id: string, updates: Partial<Customer>): Promise<void> {
    return new Promise((resolve) => {
      const dbUpdates: Record<string, any> = {};

      if (updates.name !== undefined) dbUpdates.fantasyName = updates.name;
      if (updates.companyName !== undefined) dbUpdates.name = updates.companyName;
      if (updates.document !== undefined) dbUpdates.cnpj = updates.document;
      if (updates.active !== undefined) dbUpdates.active = updates.active ? 1 : 0;

      const allowedKeys: (keyof Customer)[] = ['email', 'phone', 'address', 'city', 'state', 'zip', 'salesRepId', 'salesRepName', 'visitFrequency', 'notes'];
      allowedKeys.forEach(key => {
        if (updates[key] !== undefined) {
          dbUpdates[key] = updates[key];
        }
      });
      
      const fields = Object.keys(dbUpdates);
      if (fields.length === 0) {
        return resolve();
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => dbUpdates[field]);

      const stmt = db.prepare(`UPDATE customers SET ${setClause} WHERE id = ?`);
      stmt.run(...values, id);
      resolve();
    });
  }

  delete(id: string): Promise<void> {
    return new Promise((resolve) => {
      const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
      stmt.run(id);
      resolve();
    });
  }

  getByCode(code: number): Promise<Customer | null> {
    return new Promise((resolve) => {
      const stmt = db.prepare('SELECT * FROM customers WHERE code = ?');
      const row = stmt.get(code) as any;
      resolve(row ? rowToCustomer(row) : null);
    });
  }

  getHighestCode(): Promise<number> {
    return new Promise((resolve) => {
      const stmt = db.prepare('SELECT MAX(code) as maxCode FROM customers');
      const result = stmt.get() as { maxCode: number | null };
      resolve(result?.maxCode || 0);
    });
  }
  
  setAll(customers: Customer[]): Promise<void> {
    return new Promise((resolve) => {
      const insert = db.prepare(
          `INSERT INTO customers (id, code, name, fantasyName, cnpj, email, phone, address, city, state, zip, salesRepId, salesRepName, active, visitFrequency, notes, createdAt, updatedAt) 
           VALUES (@id, @code, @name, @fantasyName, @cnpj, @email, @phone, @address, @city, @state, @zip, @salesRepId, @salesRepName, @active, @visitFrequency, @notes, @createdAt, @updatedAt)`
      );

      const insertMany = db.transaction((customersToInsert: Customer[]) => {
          db.prepare('DELETE FROM customers').run();
          for (const customer of customersToInsert) {
              insert.run({
                  id: customer.id,
                  code: customer.code,
                  name: customer.companyName,
                  fantasyName: customer.name,
                  cnpj: customer.document,
                  email: customer.email,
                  phone: customer.phone,
                  address: customer.address,
                  city: customer.city,
                  state: customer.state,
                  zip: customer.zip,
                  salesRepId: customer.salesRepId,
                  salesRepName: customer.salesRepName,
                  active: (customer.active ?? true) ? 1 : 0,
                  visitFrequency: customer.visitFrequency,
                  notes: customer.notes,
                  createdAt: (customer.createdAt || new Date()).toISOString(),
                  updatedAt: (customer.updatedAt || new Date()).toISOString(),
              });
          }
      });

      insertMany(customers);
      resolve();
    });
  }
}

export const customerSqliteService = new CustomerSqliteService();
