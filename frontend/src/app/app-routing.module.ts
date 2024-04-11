import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InicioComponent } from './components/inicio/inicio.component';
import { ZonaPersonalComponent } from './components/zona-personal/zona-personal.component'; 
import { FabricaComponent } from './components/fabrica/fabrica.component';

import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';


const routes: Routes = [
    { path: '', component: InicioComponent },
    { path: 'zona-personal', component: ZonaPersonalComponent},
    { path: 'fabrica', component: FabricaComponent},
    { path: '**', component: PageNotFoundComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }