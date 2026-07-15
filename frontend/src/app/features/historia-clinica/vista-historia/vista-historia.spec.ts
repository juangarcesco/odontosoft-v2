import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaHistoria } from './vista-historia';

describe('VistaHistoria', () => {
  let component: VistaHistoria;
  let fixture: ComponentFixture<VistaHistoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaHistoria],
    }).compileComponents();

    fixture = TestBed.createComponent(VistaHistoria);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
