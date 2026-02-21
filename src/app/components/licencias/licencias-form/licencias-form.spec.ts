import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenciasForm } from './licencias-form';

describe('LicenciasForm', () => {
  let component: LicenciasForm;
  let fixture: ComponentFixture<LicenciasForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenciasForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenciasForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
