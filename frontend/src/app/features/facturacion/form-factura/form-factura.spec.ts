import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFactura } from './form-factura';

describe('FormFactura', () => {
  let component: FormFactura;
  let fixture: ComponentFixture<FormFactura>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFactura],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFactura);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
