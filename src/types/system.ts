
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
