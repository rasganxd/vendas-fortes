
# 🚀 Setup Completo para App Windows

## ⚠️ IMPORTANTE - Instalar Dependências Primeiro:

```bash
npm install --save-dev electron electron-builder concurrently wait-on
```

## Passos para Completar a Configuração:

### 1. Instalar Dependências do Electron
```bash
# Certifique-se de estar na pasta raiz do projeto
npm install --save-dev electron electron-builder concurrently wait-on

# Verificar se foi instalado corretamente
npx electron --version
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

## 🛠️ Resolução de Problemas:

### Se der erro na instalação do Electron:
1. Limpe o cache: `npm cache clean --force`
2. Delete `node_modules` e `package-lock.json`
3. Execute: `npm install`
4. Tente novamente: `npm install --save-dev electron electron-builder concurrently wait-on`

### Se o Windows Defender bloquear:
- Adicione exceção para a pasta do projeto
- Temporariamente desative proteção em tempo real durante desenvolvimento

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

Sua aplicação está pronta para Windows! 🎉
