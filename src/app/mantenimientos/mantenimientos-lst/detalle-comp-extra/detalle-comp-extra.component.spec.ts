import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCompExtraComponent } from './detalle-comp-extra.component';

describe('DetalleCompExtraComponent', () => {
  let component: DetalleCompExtraComponent;
  let fixture: ComponentFixture<DetalleCompExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleCompExtraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetalleCompExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
