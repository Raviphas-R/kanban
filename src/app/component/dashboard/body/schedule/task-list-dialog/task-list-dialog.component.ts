import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ScheduleTaskDialogComponent } from '../schedule-task-dialog/schedule-task-dialog.component';

@Component({
  selector: 'app-task-list-dialog',
  templateUrl: './task-list-dialog.component.html',
  styleUrls: ['./task-list-dialog.component.css'],
})
export class TaskListDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<TaskListDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  openTaskDialog(task: any) {
    const dialogRef = this.dialog.open(ScheduleTaskDialogComponent, {
      width: '400px',
      data: task,
      autoFocus: false,
    });
  }

  ngOnInit(): void {
    console.log(this.data);
  }
}
