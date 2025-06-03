
import { Product, Customer, DeliveryRoute, PaymentTable, SalesRep } from './index';
import { AppSettings } from './system';

export interface DadosVendedor {
  vendedor: {
    id: string;
    codigo: number;
    nome: string;
    email?: string;
    senha?: string; // Para login local mobile
  };
  produtos: Product[];
  clientes: Customer[];
  rotas: DeliveryRoute[];
  tabelasPreco: PaymentTable[];
  configuracoes: AppSettings;
  timestamp: string;
  versao: string;
}

export interface SalesRepSyncStatus {
  salesRepId: string;
  salesRepCode: number;
  salesRepName: string;
  lastSync: Date | null;
  isConnected: boolean;
  pendingOrders: number;
  totalDataSize: number;
  syncVersion: string;
}

export interface LocalServerStatus {
  isRunning: boolean;
  port: number;
  localIP: string;
  connectedDevices: number;
  totalRequests: number;
  lastActivity: Date | null;
}

export interface SyncLog {
  id: string;
  timestamp: Date;
  salesRepCode: number;
  action: 'download_data' | 'upload_orders' | 'validate_rep' | 'incremental_sync';
  status: 'success' | 'error' | 'pending';
  details: string;
  dataSize?: number;
  ip?: string;
}

export interface MobileOrderData {
  codigo: number;
  cliente_id: string;
  cliente_nome: string;
  vendedor_id: string;
  vendedor_nome: string;
  data: string;
  total: number;
  itens: {
    produto_codigo: number;
    produto_nome: string;
    quantidade: number;
    preco_unitario: number;
    total: number;
  }[];
  pagamento?: {
    metodo: string;
    tabela?: string;
  };
}
