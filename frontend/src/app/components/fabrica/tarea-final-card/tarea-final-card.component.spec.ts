import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TareaFinalCardComponent } from './tarea-final-card.component';

describe('TareaFinalCardComponent', () => {
  let component: TareaFinalCardComponent;
  let fixture: ComponentFixture<TareaFinalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TareaFinalCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TareaFinalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
