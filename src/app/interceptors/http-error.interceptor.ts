import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private toastController: ToastController) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    const skipErrorHandler = req.headers.get('skipErrorHandler') === 'true';

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = 'Error inesperado.';
        let showMessage = true;

        if (error.error instanceof ErrorEvent) { //Error proveniente del client
          errorMsg = `Error del cliente: ${error.error.message}`;
        } 
        else if (error.error?.message) { //Error proveniente del API tipo GenericResponse
          showMessage = error.error.autoShowError;
          errorMsg = error.error.message;
          if (Array.isArray(error.error.errors)) {
            errorMsg += `\n- ${error.error.errors.join('\n- ')}`;
          }
        } else {
          // Error del lado del servidor
          if (error.status === 400 && error.error.errors) {
            const validationErrors = error.error.errors;
            let messages = [];
        
            for (const key in validationErrors) {
              if (validationErrors.hasOwnProperty(key)) {
                messages.push(...validationErrors[key]);
              }
            }
        
            errorMsg = `Errores de validación: ${messages.join(' | ')}`;
          } else {
            errorMsg = `Error del servidor (${error.status}): ${error.message}`;
          }
        }


        var color = (error.status == 404) ? "warning" : "danger";

        if(!skipErrorHandler && showMessage){
          this.toastController.create({
            message: errorMsg,
            duration: 3000,
            color: color,
            position: 'top'
          }).then(toast => toast.present());
        }
        
        return throwError(() => error);
      })
    );
  }
}
