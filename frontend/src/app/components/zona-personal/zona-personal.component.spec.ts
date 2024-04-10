import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonaPersonalComponent } from './zona-personal.component';

describe('ZonaPersonalComponent', () => {
  let component: ZonaPersonalComponent;
  let fixture: ComponentFixture<ZonaPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonaPersonalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ZonaPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
