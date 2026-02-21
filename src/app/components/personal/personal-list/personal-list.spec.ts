import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalListComponent } from './personal-list';

describe('PersonalListComponent', () => {
  let component: PersonalListComponent;
  let fixture: ComponentFixture<PersonalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
