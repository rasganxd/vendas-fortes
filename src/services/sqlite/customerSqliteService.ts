
import db from './db';
import { Customer } from '@/types';

type CustomerRow = {
  id: string;
  code: number;
  name: string;
  fantasyName: string;
  cnpj: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  salesRepId: string;
  salesRepName: string;
  visitFrequency: string;
  active: number;
  email: string;
};

const rowToCustomer = (row: CustomerRow): Customer => ({
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
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare('SELECT * FROM customers ORDER BY fantasyName');
        const rows = stmt.all() as CustomerRow[];
        resolve(rows.map(rowToCustomer));
      } catch (error) {
        console.error("Error in getAll customers from SQLite:", error);
        reject(error);
      }
    });
  }

  getById(id: string): Promise<Customer | null> {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare('SELECT * FROM customers WHERE id = ?');
        const row = stmt.get(id) as CustomerRow | undefined;
        resolve(row ? rowToCustomer(row) : null);
      } catch (error) {
        console.error("Error in getById customer from SQLite:", error);
        reject(error);
      }
    });
  }

  // Modified to accept a full customer object, making it usable for syncing from Supabase.
  add(customer: Customer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const { id, code, name, companyName, document, email, phone, address, city, state, zip, salesRepId, salesRepName, active, visitFrequency, notes, createdAt, updatedAt } = customer;
        
        const stmt = db.prepare(
          `INSERT INTO customers (id, code, name, fantasyName, cnpj, email, phone, address, city, state, zip, salesRepId, salesRepName, active, visitFrequency, notes, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        
        stmt.run(id, code, companyName, name, document, email, phone, address, city, state, zip, salesRepId, salesRepName, active === false ? 0 : 1, visitFrequency, notes, createdAt.toISOString(), updatedAt.toISOString());
        resolve();
      } catch (error) {
        console.error("Error in add customer to SQLite:", error);
        reject(error);
      }
    });
  }

  update(id: string, updates: Partial<Customer>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const dbUpdates: Record<string, any> = {};

        if (updates.name !== undefined) dbUpdates.fantasyName = updates.name;
        if (updates.companyName !== undefined) dbUpdates.name = updates.companyName;
        if (updates.document !== undefined) dbUpdates.cnpj = updates.document;
        if (updates.active !== undefined) dbUpdates.active = updates.active ? 1 : 0;
        if (updates.updatedAt !== undefined) dbUpdates.updatedAt = updates.updatedAt.toISOString();


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
      } catch(error) {
        console.error("Error in update customer in SQLite:", error);
        reject(error);
      }
    });
  }

  delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
        stmt.run(id);
        resolve();
      } catch(error) {
        console.error("Error in delete customer from SQLite:", error);
        reject(error);
      }
    });
  }

  getByCode(code: number): Promise<Customer | null> {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare('SELECT * FROM customers WHERE code = ?');
        const row = stmt.get(code) as CustomerRow | undefined;
        resolve(row ? rowToCustomer(row) : null);
      } catch (error) {
        console.error("Error in getByCode customer from SQLite:", error);
        reject(error);
      }
    });
  }

  getHighestCode(): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const stmt = db.prepare('SELECT MAX(code) as maxCode FROM customers');
        const result = stmt.get() as { maxCode: number | null };
        resolve(result?.maxCode || 0);
      } catch (error) {
        console.error("Error in getHighestCode from SQLite:", error);
        reject(error);
      }
    });
  }
  
  setAll(customers: Customer[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const insert = db.prepare(
          `INSERT OR REPLACE INTO customers (id, code, name, fantasyName, cnpj, email, phone, address, city, state, zip, salesRepId, salesRepName, active, visitFrequency, notes, createdAt, updatedAt) 
           VALUES (@id, @code, @name, @fantasyName, @cnpj, @email, @phone, @address, @city, @state, @zip, @salesRepId, @salesRepName, @active, @visitFrequency, @notes, @createdAt, @updatedAt)`
      );

      try {
        const insertMany = db.transaction((customersToInsert: Customer[]) => {
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
      } catch (error) {
        console.error("Error in setAll customers in SQLite:", error);
        reject(error);
      }
    });
  }
}

export const customerSqliteService = new CustomerSqliteService();
