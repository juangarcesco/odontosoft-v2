import { TestBed } from '@angular/core/testing';

import { Recordatorio } from './recordatorio';

describe('Recordatorio', () => {
  let service: Recordatorio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Recordatorio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
