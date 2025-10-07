import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabDispAutolabComponent } from './lab-disp-autolab.component';

describe('LabDispAutolabComponent', () => {
  let component: LabDispAutolabComponent;
  let fixture: ComponentFixture<LabDispAutolabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabDispAutolabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LabDispAutolabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
