import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabHojaFormulacionComponent } from './lab-hoja-formulacion.component';

describe('LabHojaFormulacionComponent', () => {
  let component: LabHojaFormulacionComponent;
  let fixture: ComponentFixture<LabHojaFormulacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabHojaFormulacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LabHojaFormulacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
