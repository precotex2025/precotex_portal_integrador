import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaboratorioTabsComponent } from './laboratorio-tabs.component';

describe('LaboratorioTabsComponent', () => {
  let component: LaboratorioTabsComponent;
  let fixture: ComponentFixture<LaboratorioTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LaboratorioTabsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LaboratorioTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
