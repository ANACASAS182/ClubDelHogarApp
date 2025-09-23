// push.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  PushNotificationToken,
  PushNotificationActionPerformed,
  PushNotificationSchema
} from '@capacitor/push-notifications';

@Injectable({ providedIn: 'root' })
export class PushService {
  constructor(private http: HttpClient) {}

  async init(usuarioId: number) {
    // 1) permisos
    const permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive !== 'granted') {
      const req = await PushNotifications.requestPermissions();
      if (req.receive !== 'granted') return;
    }

    // 2) register
    await PushNotifications.register();

    // 3) token
    PushNotifications.addListener('registration', (token: PushNotificationToken) => {
      this.http.post('/api/Notificaciones/RegisterToken', {
        usuarioId,
        token: token.value,
        plataforma: Capacitor.getPlatform() // 'ios' | 'android' | 'web'
      }).subscribe();
    });

    // (opcional) errores de registro
    PushNotifications.addListener('registrationError', (e) => {
      console.error('FCM registration error', e);
    });

    // (opcional) notificación recibida en foreground
    PushNotifications.addListener('pushNotificationReceived', (n: PushNotificationSchema) => {
      // mostrar toast/badge/etc.
    });

    // (opcional) cuando el usuario toca la notificación
    PushNotifications.addListener('pushNotificationActionPerformed', (a: PushNotificationActionPerformed) => {
      // navegar según a.notification.data
    });
  }
}