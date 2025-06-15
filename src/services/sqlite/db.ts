
import Database from 'better-sqlite3';
import path from 'node:path';

// Em uma aplicação Electron, os dados devem ser armazenados no diretório de dados do usuário.
// Isso normalmente seria obtido do processo principal via IPC.
// Por enquanto, vamos colocá-lo na raiz do projeto para desenvolvimento.
// O arquivo se chamará 'vendas.db'.
const dbPath = path.resolve(process.cwd(), 'vendas.db');

console.log(`Caminho do banco de dados: ${dbPath}`);

const db = new Database(dbPath, { verbose: console.log });

// Esquema do banco de dados. Começando com clientes.
const schema = `
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    code INTEGER UNIQUE,
    name TEXT NOT NULL,
    fantasyName TEXT,
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
 * Inicializa o banco de dados, criando as tabelas se não existirem.
 */
export const initializeDatabase = () => {
  try {
    console.log('Inicializando esquema do banco de dados...');
    db.exec(schema);
    console.log('Banco de dados inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
};

// Inicializa o banco na primeira vez que este módulo é importado.
initializeDatabase();

export default db;
