
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c8013aadfbd9489ab9a1377a842607bd',
  appName: 'Vendas Fortes',
  webDir: 'dist',
  server: {
    url: 'https://c8013aad-fbd9-489a-b9a1-377a842607bd.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
