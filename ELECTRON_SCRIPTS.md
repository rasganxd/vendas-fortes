
# Scripts para Adicionar ao package.json

Adicione os seguintes scripts na seção "scripts" do seu package.json:

```json
{
  "scripts": {
    "electron": "electron public/electron.js",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && electron public/electron.js\"",
    "electron:pack": "npm run build && electron-builder",
    "electron:dist": "npm run build && electron-builder --publish=never",
    "build:electron": "vite build --mode electron",
    "cap:init": "npx cap init",
    "cap:add:electron": "npx cap add @capacitor-community/electron",
    "cap:sync": "npx cap sync",
    "cap:open:electron": "npx cap open @capacitor-community/electron"
  }
}
```

## Dependências Adicionais Necessárias:

Execute estes comandos para instalar as dependências de desenvolvimento:

```bash
npm install --save-dev electron electron-builder concurrently wait-on
```

## Configuração do Electron Builder:

Adicione esta configuração no package.json (na raiz do objeto, não dentro de scripts):

```json
{
  "main": "public/electron.js",
  "homepage": "./",
  "build": {
    "appId": "app.lovable.c8013aadfbd9489ab9a1377a842607bd",
    "productName": "Vendas Fortes",
    "directories": {
      "output": "electron-dist"
    },
    "files": [
      "dist/**/*",
      "public/electron.js",
      "public/preload.js"
    ],
    "win": {
      "target": "nsis",
      "icon": "resources/icon.ico"
    },
    "mac": {
      "category": "public.app-category.business",
      "icon": "resources/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "resources/icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```
