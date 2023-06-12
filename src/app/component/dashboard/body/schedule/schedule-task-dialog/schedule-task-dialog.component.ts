import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-schedule-task-dialog',
  templateUrl: './schedule-task-dialog.component.html',
  styleUrls: ['./schedule-task-dialog.component.css'],
})
export class ScheduleTaskDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ScheduleTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    console.log(this.data);
  }
}
