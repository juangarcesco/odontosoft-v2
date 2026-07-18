import { TestBed } from '@angular/core/testing';

import { Rips } from './rips';

describe('Rips', () => {
  let service: Rips;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Rips);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
