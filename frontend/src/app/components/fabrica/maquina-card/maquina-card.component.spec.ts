import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaquinaCardComponent } from './maquina-card.component';

describe('MaquinaCardComponent', () => {
  let component: MaquinaCardComponent;
  let fixture: ComponentFixture<MaquinaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaquinaCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MaquinaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
