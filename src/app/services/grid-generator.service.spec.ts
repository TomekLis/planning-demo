import { TestBed } from '@angular/core/testing';

import { GridGeneratorService } from './grid-generator.service';

describe('GridGeneratorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GridGeneratorService = TestBed.get(GridGeneratorService);
    expect(service).toBeTruthy();
  });
});
