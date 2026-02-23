import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleJabFijComponent } from './detalle-jab-fij.component';

describe('DetalleJabFijComponent', () => {
  let component: DetalleJabFijComponent;
  let fixture: ComponentFixture<DetalleJabFijComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleJabFijComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetalleJabFijComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
