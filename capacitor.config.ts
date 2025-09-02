import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.embassy.app',
  appName: 'EmbassyApp',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Body,   // ✅ antes ponías "ionic" (string inválido)
      resizeOnFullScreen: true,
      style: KeyboardStyle.Dark      // ✅ antes "dark" (string inválido)
    }
  }
};

export default config;