import { TestBed } from '@angular/core/testing';

import { FabricaService } from './fabrica.service';

describe('FabricaService', () => {
  let service: FabricaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FabricaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
