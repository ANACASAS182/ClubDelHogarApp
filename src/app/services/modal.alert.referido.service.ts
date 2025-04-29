import { Injectable } from "@angular/core";
import { AlertController } from "@ionic/angular";
@Injectable({
    providedIn: 'root'
})
export class ModalAlerReferidoService {
    constructor(private alertCtrl: AlertController,) {

    }
    async confirmarCierreModal(): Promise<boolean> {
        return new Promise(async (resolve) => {
            const alert = await this.alertCtrl.create({
                header: '',
                message: `Está por cerrar el registro\nsin haber agregado los datos.\n\nSi lo cierra perderá toda la información\n que no haya sido guardada.`,
                cssClass: 'alerta-personalizada',
                buttons: [
                    {
                        text: 'CONTINUAR CON EL REGISTRO',
                        role: 'cancel',
                        cssClass: 'btn-continuar',
                        handler: () => resolve(false)
                    },
                    {
                        text: 'CERRAR SIN GUARDAR LOS DATOS',
                        cssClass: 'btn-cerrar',
                        handler: () => resolve(true)
                    }
                ]
            });

            await alert.present();
        });
    }

}