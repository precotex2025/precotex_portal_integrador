import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLabColTrabajoDetalleComponent } from './dialog-lab-col-trabajo-detalle.component';

describe('DialogLabColTrabajoDetalleComponent', () => {
  let component: DialogLabColTrabajoDetalleComponent;
  let fixture: ComponentFixture<DialogLabColTrabajoDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogLabColTrabajoDetalleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogLabColTrabajoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
