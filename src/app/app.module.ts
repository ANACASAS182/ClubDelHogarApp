import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { IonicStorageModule } from '@ionic/storage-angular';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getSpanishPaginatorIntl } from './classes/spanish.paginator';
import { DatePipe } from '@angular/common';
import localeEs from '@angular/common/locales/es-mx'; 
import { registerLocaleData } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

registerLocaleData(localeEs); 

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,     
    IonicStorageModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    DatePipe,
    { provide: LOCALE_ID, useValue: 'es-MX' },
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
