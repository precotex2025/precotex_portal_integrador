import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNuevoCompExtraComponent } from './dialog-nuevo-comp-extra.component';

describe('DialogNuevoCompExtraComponent', () => {
  let component: DialogNuevoCompExtraComponent;
  let fixture: ComponentFixture<DialogNuevoCompExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogNuevoCompExtraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogNuevoCompExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
