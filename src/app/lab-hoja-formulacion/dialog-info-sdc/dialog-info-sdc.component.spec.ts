import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInfoSdcComponent } from './dialog-info-sdc.component';

describe('DialogInfoSdcComponent', () => {
  let component: DialogInfoSdcComponent;
  let fixture: ComponentFixture<DialogInfoSdcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogInfoSdcComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogInfoSdcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
