import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTrabajadoresFormComponent } from './edit-trabajadores-form.component';

describe('EditTrabajadoresFormComponent', () => {
  let component: EditTrabajadoresFormComponent;
  let fixture: ComponentFixture<EditTrabajadoresFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTrabajadoresFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditTrabajadoresFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
