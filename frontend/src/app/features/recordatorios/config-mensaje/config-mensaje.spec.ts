import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigMensaje } from './config-mensaje';

describe('ConfigMensaje', () => {
  let component: ConfigMensaje;
  let fixture: ComponentFixture<ConfigMensaje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigMensaje],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigMensaje);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
