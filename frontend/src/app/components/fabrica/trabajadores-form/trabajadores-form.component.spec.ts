import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrabajadoresFormComponent } from './trabajadores-form.component';

describe('TrabajadoresFormComponent', () => {
  let component: TrabajadoresFormComponent;
  let fixture: ComponentFixture<TrabajadoresFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrabajadoresFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrabajadoresFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
