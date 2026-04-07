import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabAnalisisDeltaComponent } from './lab-analisis-delta.component';

describe('LabAnalisisDeltaComponent', () => {
  let component: LabAnalisisDeltaComponent;
  let fixture: ComponentFixture<LabAnalisisDeltaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabAnalisisDeltaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LabAnalisisDeltaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
