import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAgregarPhComponent } from './dialog-agregar-ph.component';

describe('DialogAgregarPhComponent', () => {
  let component: DialogAgregarPhComponent;
  let fixture: ComponentFixture<DialogAgregarPhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogAgregarPhComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogAgregarPhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
