import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { DashboardService } from 'src/app/component/dashboard/dashboard.service';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.css'],
})
export class TaskDialogComponent implements OnInit {
  @ViewChild('myForm') myForm: NgForm;

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onUpdateTask() {
    this.myForm.value.updatedAt = new Date(Date.now());
    this.dashboardService
      .updateTask(this.data.id, this.myForm.value)
      .subscribe((response) => {
        this.dialogRef.close(true);
      });
  }

  onDeleteTask() {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '500px',
      autoFocus: false,
      data: { title: this.data.title, id: this.data.id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dialogRef.close(true);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.dashboardService
      .getErrorObservable()
      .subscribe((error) => console.log(error));
  }
}
