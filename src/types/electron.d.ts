
interface ElectronAPI {
  getVersion: () => Promise<string>;
  showSaveDialog: () => Promise<any>;
  printContent: (htmlContent: string, options?: any) => Promise<{ success: boolean; error?: string }>;
  isElectron: boolean;
  platform: string;
  showNotification: (title: string, body: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
