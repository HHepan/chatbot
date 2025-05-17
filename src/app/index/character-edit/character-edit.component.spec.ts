import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterEditComponent } from './character-edit.component';

describe('CharacterEditComponent', () => {
  let component: CharacterEditComponent;
  let fixture: ComponentFixture<CharacterEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CharacterEditComponent]
    });
    fixture = TestBed.createComponent(CharacterEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
