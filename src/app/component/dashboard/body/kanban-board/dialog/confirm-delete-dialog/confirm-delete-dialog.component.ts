import { Component, Inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DashboardService } from 'src/app/component/dashboard/dashboard.service';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.css'],
})
export class ConfirmDeleteDialogComponent {
  @ViewChild('myForm') myForm: NgForm;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    private dashboardService: DashboardService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClick() {
    if (this.myForm.value.title === this.data.title) {
      this.dashboardService.deleteTask(this.data.id).subscribe();
      this.dialogRef.close(true);
    }
  }

  onNoClick() {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.dashboardService
      .getErrorObservable()
      .subscribe((error) => console.log(error));
  }
}
