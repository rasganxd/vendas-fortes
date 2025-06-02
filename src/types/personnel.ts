
export interface SalesRep {
  id: string;
  code: number;
  name: string;
  phone: string;
  email?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SalesRepFormValues = {
  code: number;
  name: string;
  phone: string;
  email?: string;
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
