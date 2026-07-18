import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialRips } from './historial-rips';

describe('HistorialRips', () => {
  let component: HistorialRips;
  let fixture: ComponentFixture<HistorialRips>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialRips],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialRips);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
