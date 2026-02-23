import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogJabonadosComponent } from './dialog-jabonados.component';

describe('DialogJabonadosComponent', () => {
  let component: DialogJabonadosComponent;
  let fixture: ComponentFixture<DialogJabonadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogJabonadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogJabonadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
