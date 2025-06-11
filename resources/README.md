
# Recursos do Aplicativo

Esta pasta contém os recursos necessários para o build do aplicativo nativo:

## Ícones Necessários:

### Windows:
- `icon.ico` - Ícone principal (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)

### macOS:
- `icon.icns` - Ícone para macOS (múltiplas resoluções)

### Linux:
- `icon.png` - Ícone PNG (512x512 recomendado)

## Como Criar os Ícones:

1. Crie uma imagem PNG de 512x512 pixels com o logo da aplicação
2. Use ferramentas online como:
   - https://icoconvert.com/ (para .ico)
   - https://iconverticons.com/ (para .icns)
   - Ou use o Electron Builder que pode gerar automaticamente

## Placeholder:
Por enquanto, você pode usar qualquer imagem PNG como `icon.png` e o sistema gerará os outros formatos automaticamente durante o build.
