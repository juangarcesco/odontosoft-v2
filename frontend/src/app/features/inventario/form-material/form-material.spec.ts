import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMaterial } from './form-material';

describe('FormMaterial', () => {
  let component: FormMaterial;
  let fixture: ComponentFixture<FormMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormMaterial],
    }).compileComponents();

    fixture = TestBed.createComponent(FormMaterial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
