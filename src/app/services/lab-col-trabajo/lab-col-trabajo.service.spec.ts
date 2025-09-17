import { TestBed } from '@angular/core/testing';

import { LabColTrabajoService } from './lab-col-trabajo.service';

describe('LabColTrabajoService', () => {
  let service: LabColTrabajoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabColTrabajoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
