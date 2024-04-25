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
import { LoginFormComponent } from './components/inicio/login-form/login-form.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorHandlerInterceptor } from './interceptors/error-handler.interceptor';
import { RegisterFormComponent } from './components/inicio/register-form/register-form.component';
import { FormsModule } from '@angular/forms';
import { CrearFabricaFormComponent } from './components/zona-personal/new-fabrica-form/crear-fabrica-form.component';
import { TrabajadoresFormComponent } from './components/fabrica/trabajadores-form/trabajadores-form.component';
import { MaquinasFormComponent } from './components/fabrica/maquinas-form/maquinas-form.component';
import { TareasFormComponent } from './components/fabrica/tareas-form/tareas-form.component';
import { EditTrabajadoresFormComponent } from './components/fabrica/edit-trabajadores-form/edit-trabajadores-form.component';
import { EditMaquinasFormComponent } from './components/fabrica/edit-maquinas-form/edit-maquinas-form.component';
import { EditTareasFormComponent } from './components/fabrica/edit-tareas-form/edit-tareas-form.component';
import { EditFabricaFormComponent } from './components/zona-personal/edit-fabrica-form/edit-fabrica-form.component';

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    ZonaPersonalComponent,
    FabricaComponent,
    TrabajadorCardComponent,
    MaquinaCardComponent,
    TareaCardComponent,
    LoginFormComponent,
    RegisterFormComponent,
    CrearFabricaFormComponent,
    TrabajadoresFormComponent,
    MaquinasFormComponent,
    TareasFormComponent,
    EditTrabajadoresFormComponent,
    EditMaquinasFormComponent,
    EditTareasFormComponent,
    EditFabricaFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [provideHttpClient(withInterceptors([errorHandlerInterceptor]))],
  bootstrap: [AppComponent]
})

export class AppModule { }
