import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleTaskDialogComponent } from './schedule-task-dialog.component';

describe('ScheduleTaskDialogComponent', () => {
  let component: ScheduleTaskDialogComponent;
  let fixture: ComponentFixture<ScheduleTaskDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduleTaskDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleTaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
