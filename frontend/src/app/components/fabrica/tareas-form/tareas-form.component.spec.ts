import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TareasFormComponent } from './tareas-form.component';

describe('TareasFormComponent', () => {
  let component: TareasFormComponent;
  let fixture: ComponentFixture<TareasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TareasFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TareasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
