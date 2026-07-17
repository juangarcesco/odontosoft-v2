import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaMateriales } from './lista-materiales';

describe('ListaMateriales', () => {
  let component: ListaMateriales;
  let fixture: ComponentFixture<ListaMateriales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaMateriales],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaMateriales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
