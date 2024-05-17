import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArbolDeTareasComponent } from './arbol-de-tareas.component';

describe('ArbolDeTareasComponent', () => {
  let component: ArbolDeTareasComponent;
  let fixture: ComponentFixture<ArbolDeTareasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArbolDeTareasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArbolDeTareasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
