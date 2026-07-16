import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Odontograma } from './odontograma';

describe('Odontograma', () => {
  let component: Odontograma;
  let fixture: ComponentFixture<Odontograma>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Odontograma],
    }).compileComponents();

    fixture = TestBed.createComponent(Odontograma);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
