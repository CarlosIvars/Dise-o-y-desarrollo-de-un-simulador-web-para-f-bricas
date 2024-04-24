import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTareasFormComponent } from './edit-tareas-form.component';

describe('EditTareasFormComponent', () => {
  let component: EditTareasFormComponent;
  let fixture: ComponentFixture<EditTareasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTareasFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditTareasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
