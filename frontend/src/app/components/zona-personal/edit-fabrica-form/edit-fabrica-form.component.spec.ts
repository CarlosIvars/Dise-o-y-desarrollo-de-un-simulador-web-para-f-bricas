import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFabricaFormComponent } from './edit-fabrica-form.component';

describe('EditFabricaFormComponent', () => {
  let component: EditFabricaFormComponent;
  let fixture: ComponentFixture<EditFabricaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditFabricaFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditFabricaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
