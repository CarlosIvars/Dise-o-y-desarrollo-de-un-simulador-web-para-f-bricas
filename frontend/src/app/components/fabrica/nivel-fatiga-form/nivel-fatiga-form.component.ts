import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-nivel-fatiga-form',
  templateUrl: './nivel-fatiga-form.component.html',
  styleUrl: './nivel-fatiga-form.component.css'
})
export class NivelFatigaFormComponent {
  @Input() nivelFatiga!: number;

  @Output() close = new EventEmitter();

  calificaciones = ["muy buena", "buena", "aceptable", "mala", "muy mala"];

  cerrarModal(): void {
    this.close.emit();
  }
}
