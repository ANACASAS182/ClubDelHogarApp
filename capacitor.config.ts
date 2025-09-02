import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.embassy.app',       // cambia a tu id de paquete
  appName: 'EmbassyApp',          // nombre de la app
  webDir: 'www',                  // carpeta de build Angular/Ionic
  bundledWebRuntime: false,
  plugins: {
    Keyboard: {
      resize: 'ionic',            // evita el brinco del login
      resizeOnFullScreen: true,
      style: 'dark'               // teclado con estilo oscuro
    }
  }
};

export default config;