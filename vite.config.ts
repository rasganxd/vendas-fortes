
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const isElectron = mode === 'electron' || process.env.ELECTRON === 'true';
  
  return {
    server: {
      host: "::",
      port: 8080,
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      },
    },
    plugins: [
      react(),
      mode === 'development' && !isElectron &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: isElectron || command === 'build' ? './' : '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
      // Ensure compatibility with file:// protocol
      target: isElectron ? 'node14' : 'es2015',
    },
    define: {
      global: 'globalThis',
    },
  };
});
