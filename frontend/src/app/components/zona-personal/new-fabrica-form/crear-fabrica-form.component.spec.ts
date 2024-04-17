import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearFabricaFormComponent } from './crear-fabrica-form.component';

describe('NewFabricaFormComponent', () => {
  let component: CrearFabricaFormComponent;
  let fixture: ComponentFixture<CrearFabricaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearFabricaFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearFabricaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
