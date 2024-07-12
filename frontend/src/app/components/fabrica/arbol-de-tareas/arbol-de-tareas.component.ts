import { Component, EventEmitter, Output } from '@angular/core';
import { Tarea } from '../../../interfaces/interfaces';
import { Subject, Subscription } from 'rxjs';
import { TareasService } from '../../../services/tareas.service';
import { stepRoundAfter, stepRound, stepRoundBefore } from '../../../utilities/customStepCurvedGPT';
import * as shape from 'd3-shape';
import { MiniMapPosition, NgxGraphZoomOptions } from '@swimlane/ngx-graph';

@Component({
  selector: 'app-arbol-de-tareas',
  templateUrl: './arbol-de-tareas.component.html',
  styleUrl: './arbol-de-tareas.component.css'
})
export class ArbolDeTareasComponent {
  @Output() editarTareaForm = new EventEmitter<Tarea>();

  tareas: Tarea[] = [];
  private tareasSub?: Subscription;

  links: any = [];
  nodes: any = [];

  layoutSettings = {
    orientation: 'TB'
  }

  autoCenter = true;
  autoZoom = true;

  curve = shape.curveBasis; 
  //curve = stepRoundBefore;
  
  minimapPosition = MiniMapPosition.UpperLeft;

  center$: Subject<boolean> = new Subject();
  zoomToFit$: Subject<NgxGraphZoomOptions> = new Subject();

  constructor(private tareasService: TareasService) {}

  ngOnInit(): void {
    this.tareasSub = this.tareasService.tareas$.subscribe(tareas => {
      if(this.tareas.length == tareas.length) {
        // Vaciar sin romper la referencia para evitar actualizar el mapa
        this.nodes.length = 0;
        this.links.length = 0;
      } else {
        // Vaciar rompiendo la referencia para actualizar el mapa
        this.nodes = [];
        this.links = [];
      }

      this.tareas =  [...tareas];

      //Cargamos los datos en el mapa
      for(let tarea of tareas) {
        this.nodes.push({id: "" + tarea.id, label: "tarea_" + tarea.id, tarea});
        if(tarea.tareaPadre != undefined) {
          this.links.push({id: "link_" + tarea.id, source: "" + tarea.tareaPadre.id, target: "" + tarea.id});
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.tareasSub) {
      this.tareasSub.unsubscribe();
    }
  }

  centerGraph() {
    this.center$.next(true);
    this.zoomToFit$.next({autoCenter: true, force: true});
  }

  abrirEditTareasForm(tarea: Tarea): void {
    this.editarTareaForm.emit(tarea);
  }
}
