import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEntregaAjusteComponent } from './dialog-entrega-ajuste.component';

describe('DialogEntregaAjusteComponent', () => {
  let component: DialogEntregaAjusteComponent;
  let fixture: ComponentFixture<DialogEntregaAjusteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogEntregaAjusteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogEntregaAjusteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
