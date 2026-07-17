import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPago } from './form-pago';

describe('FormPago', () => {
  let component: FormPago;
  let fixture: ComponentFixture<FormPago>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPago],
    }).compileComponents();

    fixture = TestBed.createComponent(FormPago);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
