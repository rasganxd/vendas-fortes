
export interface SalesRep {
  id: string;
  code: number;
  name: string;
  phone: string;
  email?: string;
  password?: string; // Adicionado campo de senha
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SalesRepFormValues = {
  code: number;
  name: string;
  phone: string;
  email?: string;
  password?: string; // Adicionado campo de senha
  confirmPassword?: string; // Campo para confirmação de senha
  active: boolean;
};

export interface SyncStatus {
  lastSync: Date | null;
  devices: {
    deviceId: string;
    lastSync: Date;
    salesRepName: string;
  }[];
}
