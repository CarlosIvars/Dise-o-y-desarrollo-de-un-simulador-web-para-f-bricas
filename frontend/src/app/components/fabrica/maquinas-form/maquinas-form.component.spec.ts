import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaquinasFormComponent } from './maquinas-form.component';

describe('MaquinasFormComponent', () => {
  let component: MaquinasFormComponent;
  let fixture: ComponentFixture<MaquinasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaquinasFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MaquinasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
