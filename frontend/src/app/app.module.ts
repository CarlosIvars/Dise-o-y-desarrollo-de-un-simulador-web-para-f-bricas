import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FabricaComponent } from './components/fabrica/fabrica.component';
import { TrabajadorCardComponent } from './components/fabrica/trabajador-card/trabajador-card.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { ZonaPersonalComponent } from './components/zona-personal/zona-personal.component';
import { MaquinaCardComponent } from './components/fabrica/maquina-card/maquina-card.component';
import { TareaCardComponent } from './components/fabrica/tarea-card/tarea-card.component';
import { TareaInicialCardComponent } from './components/fabrica/tarea-inicial-card/tarea-inicial-card.component';
import { TareaFinalCardComponent } from './components/fabrica/tarea-final-card/tarea-final-card.component';
import { LoginFormComponent } from './components/inicio/login-form/login-form.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorHandlerInterceptor } from './interceptors/error-handler.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    ZonaPersonalComponent,
    FabricaComponent,
    TrabajadorCardComponent,
    MaquinaCardComponent,
    TareaCardComponent,
    TareaInicialCardComponent,
    TareaFinalCardComponent,
    LoginFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [provideHttpClient(withInterceptors([errorHandlerInterceptor]))],
  bootstrap: [AppComponent]
})

export class AppModule { }
