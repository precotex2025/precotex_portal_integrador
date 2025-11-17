import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabDosificacionComponent } from './lab-dosificacion.component';

describe('LabDosificacionComponent', () => {
  let component: LabDosificacionComponent;
  let fixture: ComponentFixture<LabDosificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabDosificacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LabDosificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
