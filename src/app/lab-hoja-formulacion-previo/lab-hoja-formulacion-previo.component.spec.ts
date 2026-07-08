import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabHojaFormulacionPrevioComponent } from './lab-hoja-formulacion-previo.component';

describe('LabHojaFormulacionPrevioComponent', () => {
  let component: LabHojaFormulacionPrevioComponent;
  let fixture: ComponentFixture<LabHojaFormulacionPrevioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabHojaFormulacionPrevioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LabHojaFormulacionPrevioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
