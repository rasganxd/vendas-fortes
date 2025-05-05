
export interface Backup {
  id: string;
  name: string;
  description: string;
  date: Date; // Changed from createdAt/updatedAt to match usage in code
  data: any; // Add the data property which is missing
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
