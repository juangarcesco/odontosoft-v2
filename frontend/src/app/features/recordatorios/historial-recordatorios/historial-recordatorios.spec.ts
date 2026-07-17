import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialRecordatorios } from './historial-recordatorios';

describe('HistorialRecordatorios', () => {
  let component: HistorialRecordatorios;
  let fixture: ComponentFixture<HistorialRecordatorios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialRecordatorios],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialRecordatorios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
