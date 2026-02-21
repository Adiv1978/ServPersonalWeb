import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenciasList } from './licencias-list';

describe('LicenciasList', () => {
  let component: LicenciasList;
  let fixture: ComponentFixture<LicenciasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenciasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenciasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
