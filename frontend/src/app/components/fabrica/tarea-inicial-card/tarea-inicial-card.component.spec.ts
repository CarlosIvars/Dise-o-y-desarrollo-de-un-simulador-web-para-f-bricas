import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TareaInicialCardComponent } from './tarea-inicial-card.component';

describe('TareaInicialCardComponent', () => {
  let component: TareaInicialCardComponent;
  let fixture: ComponentFixture<TareaInicialCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TareaInicialCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TareaInicialCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
