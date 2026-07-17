import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleMaterial } from './detalle-material';

describe('DetalleMaterial', () => {
  let component: DetalleMaterial;
  let fixture: ComponentFixture<DetalleMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleMaterial],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleMaterial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
