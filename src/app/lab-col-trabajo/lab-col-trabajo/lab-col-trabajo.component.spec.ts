import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabColTrabajoComponent } from './lab-col-trabajo.component';

describe('LabColTrabajoComponent', () => {
  let component: LabColTrabajoComponent;
  let fixture: ComponentFixture<LabColTrabajoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LabColTrabajoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LabColTrabajoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
