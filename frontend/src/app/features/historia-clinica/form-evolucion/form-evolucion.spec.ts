import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormEvolucion } from './form-evolucion';

describe('FormEvolucion', () => {
  let component: FormEvolucion;
  let fixture: ComponentFixture<FormEvolucion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormEvolucion],
    }).compileComponents();

    fixture = TestBed.createComponent(FormEvolucion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
