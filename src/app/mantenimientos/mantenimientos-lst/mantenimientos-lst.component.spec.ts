import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientosLstComponent } from './mantenimientos-lst.component';

describe('MantenimientosLstComponent', () => {
  let component: MantenimientosLstComponent;
  let fixture: ComponentFixture<MantenimientosLstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MantenimientosLstComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MantenimientosLstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
