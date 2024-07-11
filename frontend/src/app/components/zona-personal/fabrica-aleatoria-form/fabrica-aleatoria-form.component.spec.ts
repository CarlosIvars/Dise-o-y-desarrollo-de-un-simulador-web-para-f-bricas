import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FabricaAleatoriaFormComponent } from './fabrica-aleatoria-form.component';

describe('FabricaAleatoriaFormComponent', () => {
  let component: FabricaAleatoriaFormComponent;
  let fixture: ComponentFixture<FabricaAleatoriaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FabricaAleatoriaFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FabricaAleatoriaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
