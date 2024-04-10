import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FabricaComponent } from './fabrica.component';

describe('FabricaComponent', () => {
  let component: FabricaComponent;
  let fixture: ComponentFixture<FabricaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FabricaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FabricaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
