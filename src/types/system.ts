
export interface Backup {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    document: string;
    footer: string;
  };
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}
