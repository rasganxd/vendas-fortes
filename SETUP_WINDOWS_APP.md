
# 🚀 Setup Completo para App Windows

## Passos para Completar a Configuração:

### 1. Instalar Dependências
```bash
npm install
npm install --save-dev electron electron-builder concurrently wait-on
```

### 2. Configurar package.json
- Abra o arquivo `PACKAGE_JSON_CONFIG.md`
- Copie e cole as configurações no seu `package.json`

### 3. Adicionar Ícone
- Coloque um arquivo `icon.png` (512x512) na pasta `resources/`
- O sistema gerará automaticamente os outros formatos

### 4. Testar em Desenvolvimento
```bash
npm run electron:dev
```

### 5. Gerar Executável
```bash
npm run build:electron
npm run electron:dist
```

## ✅ Recursos Já Configurados:

- ✅ Electron main process (`public/electron.js`)
- ✅ Preload script de segurança (`public/preload.js`)
- ✅ Integração com SQLite local
- ✅ Menu nativo com atalhos
- ✅ Janela redimensionável
- ✅ Configuração de impressão nativa
- ✅ Sistema de banco de dados offline

## 🎯 O que o App Terá:

- **Funcionamento Offline**: Completamente funcional sem internet
- **Base de Dados Local**: SQLite integrado para clientes
- **Menu Nativo**: Menu completo com atalhos (Ctrl+R, F11, etc)
- **Instalador Windows**: Arquivo .exe com instalador NSIS
- **Ícone Desktop**: Atalho automático no desktop
- **Performance**: Melhor que versão web

## 📁 Arquivos de Saída:

Após `npm run electron:dist`, você terá:
- `electron-dist/Vendas Fortes Setup.exe` - Instalador
- `electron-dist/win-unpacked/` - Arquivos do app
- Atalhos automáticos no desktop e menu iniciar

## 🔧 Comandos Disponíveis:

- `npm run electron:dev` - Desenvolvimento com hot-reload
- `npm run electron:pack` - Gerar executável de teste
- `npm run electron:dist` - Gerar instalador completo
- `npm run build:electron` - Build otimizado para Electron

Sua aplicação está 95% pronta para Windows! 🎉
