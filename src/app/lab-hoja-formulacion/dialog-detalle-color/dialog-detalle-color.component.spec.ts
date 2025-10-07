import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDetalleColorComponent } from './dialog-detalle-color.component';

describe('DialogDetalleColorComponent', () => {
  let component: DialogDetalleColorComponent;
  let fixture: ComponentFixture<DialogDetalleColorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogDetalleColorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogDetalleColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
