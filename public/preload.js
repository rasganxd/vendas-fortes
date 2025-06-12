
const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Informações do app
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Diálogos do sistema
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  
  // Sistema de impressão nativo
  printContent: (htmlContent, options) => ipcRenderer.invoke('print-content', htmlContent, options),
  
  // Verificar se está rodando no Electron
  isElectron: true,
  
  // Platform info
  platform: process.platform,
  
  // Notificações do sistema (se suportado)
  showNotification: (title, body) => {
    if ('Notification' in window) {
      new Notification(title, { body });
    }
  }
});

// Adicionar classes CSS para identificar que está no Electron
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('electron-app');
  document.body.classList.add(`platform-${process.platform}`);
});
