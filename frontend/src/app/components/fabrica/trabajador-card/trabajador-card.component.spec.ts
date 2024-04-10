import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrabajadorCardComponent } from './trabajador-card.component';

describe('TrabajadorCardComponent', () => {
  let component: TrabajadorCardComponent;
  let fixture: ComponentFixture<TrabajadorCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrabajadorCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrabajadorCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
