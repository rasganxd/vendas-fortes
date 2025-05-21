
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
  id?: string;
  companyName: string;
  companyLogo: string;
  theme?: Theme;
  createdAt: Date;
  updatedAt: Date;
  company?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    document: string;
    footer: string;
  };
}

export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  primaryColor: string;  // Ensure both naming conventions are supported
  secondaryColor: string;
  accentColor: string;
}
