import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteClinico } from './reporte-clinico';

describe('ReporteClinico', () => {
  let component: ReporteClinico;
  let fixture: ComponentFixture<ReporteClinico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteClinico],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteClinico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
