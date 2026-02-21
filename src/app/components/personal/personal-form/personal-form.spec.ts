import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalForm } from './personal-form';

describe('PersonalForm', () => {
  let component: PersonalForm;
  let fixture: ComponentFixture<PersonalForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
