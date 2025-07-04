const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { initializeDatabase } = require('../electron/services/sqlite/db');
const { customerSqliteService } = require('../electron/services/sqlite/customerSqliteService');

let mainWindow;

// Initialize the database on startup
initializeDatabase();

function createWindow() {
  // Criar a janela principal do aplicativo
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../resources/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Temporary for development - should be true in production
    },
    titleBarStyle: 'default',
    show: false
  });

  // Carregar a aplicação
  const startUrl = isDev 
    ? 'http://localhost:8080' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  console.log('Loading URL:', startUrl);
  
  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
    // Fallback: try loading without file:// protocol
    if (!isDev) {
      const fallbackPath = path.join(__dirname, '../dist/index.html');
      console.log('Trying fallback path:', fallbackPath);
      mainWindow.loadFile(fallbackPath);
    }
  });

  // Debug: Log when page fails to load
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Page failed to load:', {
      errorCode,
      errorDescription,
      validatedURL
    });
  });

  // Debug: Log when page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
    
    // Open DevTools in development for debugging
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Abrir links externos no navegador padrão
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Menu da aplicação
function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Sair',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Refazer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Colar', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Forçar Recarregar', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Ferramentas do Desenvolvedor', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Zoom Real', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Aumentar Zoom', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Diminuir Zoom', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Tela Cheia', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Janela',
      submenu: [
        { label: 'Minimizar', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Fechar', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre Vendas Fortes',
          click: () => {
            const aboutWindow = new BrowserWindow({
              width: 400,
              height: 300,
              resizable: false,
              minimizable: false,
              maximizable: false,
              parent: mainWindow,
              modal: true,
              webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
              }
            });
            
            aboutWindow.loadURL(`data:text/html;charset=utf-8,
              <html>
                <head><title>Sobre</title></head>
                <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                  <h2>Vendas Fortes</h2>
                  <p>Sistema de Gestão de Vendas</p>
                  <p>Versão 1.0.0</p>
                  <p>© 2024 Vendas Fortes Team</p>
                </body>
              </html>
            `);
            
            aboutWindow.setMenu(null);
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Eventos do app
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC Handlers for Database ---

// Helper to convert date strings from renderer to Date objects
const parseCustomerDates = (customer) => {
    const newCustomer = { ...customer };
    if (newCustomer.createdAt) newCustomer.createdAt = new Date(newCustomer.createdAt);
    if (newCustomer.updatedAt) newCustomer.updatedAt = new Date(newCustomer.updatedAt);
    return newCustomer;
};

ipcMain.handle('db:customers:getAll', () => customerSqliteService.getAll());
ipcMain.handle('db:customers:getById', (event, id) => customerSqliteService.getById(id));
ipcMain.handle('db:customers:getByCode', (event, code) => customerSqliteService.getByCode(code));
ipcMain.handle('db:customers:getHighestCode', () => customerSqliteService.getHighestCode());

ipcMain.handle('db:customers:add', (event, customer) => {
  return customerSqliteService.add(parseCustomerDates(customer));
});

ipcMain.handle('db:customers:update', (event, id, updates) => {
    const parsedUpdates = { ...updates };
    if (parsedUpdates.updatedAt) {
        parsedUpdates.updatedAt = new Date(parsedUpdates.updatedAt);
    }
    return customerSqliteService.update(id, parsedUpdates);
});

ipcMain.handle('db:customers:delete', (event, id) => customerSqliteService.delete(id));

ipcMain.handle('db:customers:setAll', (event, customers) => {
  const customersWithDates = customers.map(parseCustomerDates);
  return customerSqliteService.setAll(customersWithDates);
});

// Comunicação com o renderer process
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-save-dialog', async () => {
  const { dialog } = require('electron');
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Arquivos de Texto', extensions: ['txt'] },
      { name: 'Arquivos PDF', extensions: ['pdf'] },
      { name: 'Todos os Arquivos', extensions: ['*'] }
    ]
  });
  return result;
});

// Handler de impressão nativo do Electron
ipcMain.handle('print-content', async (event, htmlContent, options = {}) => {
  try {
    // Criar janela oculta para impressão
    const printWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // Carregar o conteúdo HTML
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // Aguardar o carregamento completo
    await new Promise(resolve => {
      printWindow.webContents.once('did-finish-load', resolve);
    });

    // Configurações de impressão
    const printOptions = {
      silent: false,
      printBackground: true,
      color: true,
      margins: {
        marginType: 'custom',
        top: 0.5,
        bottom: 0.5,
        left: 0.5,
        right: 0.5
      },
      landscape: false,
      scaleFactor: 100,
      ...options
    };

    // Executar impressão
    const success = await printWindow.webContents.print(printOptions);
    
    // Fechar janela de impressão
    printWindow.close();
    
    return { success };
  } catch (error) {
    console.error('Erro na impressão:', error);
    return { success: false, error: error.message };
  }
});
