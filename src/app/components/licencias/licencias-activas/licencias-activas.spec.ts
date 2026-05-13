import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenciasActivas } from './licencias-activas';

describe('LicenciasActivas', () => {
  let component: LicenciasActivas;
  let fixture: ComponentFixture<LicenciasActivas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenciasActivas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenciasActivas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
