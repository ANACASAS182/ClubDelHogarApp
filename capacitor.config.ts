import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.embassy.app',
  appName: 'EmbassyApp',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    // Permite que WKWebView navegue/llame a estos hosts
    allowNavigation: [
      'ebg-api.bithub.com.mx',
      'ebg.bithub.com.mx',
      'ebg-admin.bithub.com.mx',
      'admin.embassyen.com',
      'www.embassyen.com',
      'localhost',
    ],
    // androidScheme: 'https', // si lo ocupas en Android
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
      style: KeyboardStyle.Dark,
    },
  },
};

export default config;