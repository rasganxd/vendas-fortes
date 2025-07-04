
# Configurações para adicionar ao package.json

## 1. Adicionar no topo do package.json (junto com name, version, etc):

```json
"main": "public/electron.js",
"homepage": "./",
```

## 2. Adicionar na seção "scripts":

```json
"electron": "electron public/electron.js",
"electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && electron public/electron.js\"",
"electron:pack": "npm run build && electron-builder",
"electron:dist": "npm run build && electron-builder --publish=never",
"build:electron": "vite build --mode electron"
```

## 3. Adicionar configuração do Electron Builder (na raiz do objeto JSON, não dentro de scripts):

```json
"build": {
  "appId": "app.lovable.c8013aadfbd9489ab9a1377a842607bd",
  "productName": "Vendas Fortes",
  "directories": {
    "output": "electron-dist"
  },
  "files": [
    "dist/**/*",
    "public/electron.js",
    "public/preload.js",
    "electron/**/*"
  ],
  "win": {
    "target": "nsis",
    "icon": "resources/icon.ico",
    "requestedExecutionLevel": "asInvoker"
  },
  "mac": {
    "category": "public.app-category.business",
    "icon": "resources/icon.icns"
  },
  "linux": {
    "target": "AppImage",
    "icon": "resources/icon.png",
    "category": "Office"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

## Como aplicar essas configurações:

1. Abra o arquivo `package.json` na raiz do projeto
2. Adicione as configurações acima nas seções correspondentes
3. Salve o arquivo
