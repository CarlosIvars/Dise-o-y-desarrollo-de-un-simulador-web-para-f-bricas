import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-zona-personal',
  templateUrl: './zona-personal.component.html',
  styleUrl: './zona-personal.component.css'
})
export class ZonaPersonalComponent {

  constructor(private router: Router) { }

  abrirFabrica() {
    this.router.navigate(['/fabrica']);
  }
}
