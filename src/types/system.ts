
export interface AppSettings {
  id: string;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    document: string;
    footer: string;
  };
  theme: {
    primaryColor: string;
  };
}

export interface Backup {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  size: number;
  status: 'completed' | 'in_progress' | 'failed';
}
