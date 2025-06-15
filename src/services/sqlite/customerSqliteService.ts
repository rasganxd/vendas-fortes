
import db from './db';
import { Customer } from '@/types';
import { v4 as uuidv4 } from 'uuid';

class CustomerSqliteService {
  /**
   * Obtém todos os clientes do banco de dados.
   */
  getAll(): Customer[] {
    const stmt = db.prepare('SELECT * FROM customers ORDER BY name');
    const customers = stmt.all().map(c => ({
      ...c,
      active: c.active === 1,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    }));
    return customers as Customer[];
  }

  /**
   * Obtém um cliente pelo ID.
   */
  getById(id: string): Customer | null {
    const stmt = db.prepare('SELECT * FROM customers WHERE id = ?');
    const customer = stmt.get(id);
    if (customer) {
      return {
        ...customer,
        active: customer.active === 1,
        createdAt: new Date(customer.createdAt),
        updatedAt: new Date(customer.updatedAt),
      } as Customer;
    }
    return null;
  }

  /**
   * Adiciona um novo cliente.
   */
  add(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = uuidv4();
    const { code, name, fantasyName, cnpj, email, phone, address, city, state, zip, salesRepId, salesRepName, active, visitFrequency } = customer;
    
    const stmt = db.prepare(
      `INSERT INTO customers (id, code, name, fantasyName, cnpj, email, phone, address, city, state, zip, salesRepId, salesRepName, active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    
    stmt.run(id, code, name, fantasyName, cnpj, email, phone, address, city, state, zip, salesRepId, salesRepName, active === false ? 0 : 1);
    return id;
  }

  /**
   * Atualiza um cliente existente.
   */
  update(id: string, updates: Partial<Customer>): void {
    const fields = Object.keys(updates).filter(k => k !== 'id');
    const values = fields.map(field => (updates as any)[field]);

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const stmt = db.prepare(`UPDATE customers SET ${setClause} WHERE id = ?`);
    stmt.run(...values, id);
  }

  /**
   * Deleta um cliente.
   */
  delete(id: string): void {
    const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
    stmt.run(id);
  }

  /**
   * Obtém um cliente pelo código.
   */
  getByCode(code: number): Customer | null {
    const stmt = db.prepare('SELECT * FROM customers WHERE code = ?');
    const customer = stmt.get(code);
     if (customer) {
      return {
        ...customer,
        active: customer.active === 1,
        createdAt: new Date(customer.createdAt),
        updatedAt: new Date(customer.updatedAt),
      } as Customer;
    }
    return null;
  }

  /**
   * Obtém o maior código de cliente utilizado.
   */
  getHighestCode(): number {
    const stmt = db.prepare('SELECT MAX(code) as maxCode FROM customers');
    const result = stmt.get();
    return result.maxCode || 0;
  }
}

export const customerSqliteService = new CustomerSqliteService();
