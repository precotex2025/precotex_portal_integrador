import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAgregarOpcionComponent } from './dialog-agregar-opcion.component';

describe('DialogAgregarOpcionComponent', () => {
  let component: DialogAgregarOpcionComponent;
  let fixture: ComponentFixture<DialogAgregarOpcionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogAgregarOpcionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogAgregarOpcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
