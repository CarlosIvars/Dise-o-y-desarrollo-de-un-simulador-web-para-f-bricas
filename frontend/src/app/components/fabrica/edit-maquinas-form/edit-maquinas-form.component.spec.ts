import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMaquinasFormComponent } from './edit-maquinas-form.component';

describe('EditMaquinasFormComponent', () => {
  let component: EditMaquinasFormComponent;
  let fixture: ComponentFixture<EditMaquinasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMaquinasFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditMaquinasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
