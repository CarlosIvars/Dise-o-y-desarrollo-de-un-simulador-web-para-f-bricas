import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NivelFatigaFormComponent } from './nivel-fatiga-form.component';

describe('NivelFatigaFormComponent', () => {
  let component: NivelFatigaFormComponent;
  let fixture: ComponentFixture<NivelFatigaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NivelFatigaFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NivelFatigaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
