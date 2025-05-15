
export interface SalesRep {
  id: string;
  code: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  region: string;
  role: string;
  active: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SalesRepFormValues = {
  code: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  region: string;
  role: string;
  active: boolean;
  notes: string;
};

export interface SyncStatus {
  lastSync: Date | null;
  devices: {
    deviceId: string;
    lastSync: Date;
    salesRepName: string;
  }[];
}
