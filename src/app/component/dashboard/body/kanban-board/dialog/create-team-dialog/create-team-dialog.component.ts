import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgForm, FormGroup } from '@angular/forms';
import { DashboardService } from '../../../../dashboard.service';

@Component({
  selector: 'app-create-team-dialog',
  templateUrl: './create-team-dialog.component.html',
  styleUrls: ['./create-team-dialog.component.css'],
})
export class CreateTeamDialogComponent implements OnInit {
  myForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<CreateTeamDialogComponent>,
    private dashboardService: DashboardService
  ) {}

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onSubmit(form: NgForm) {
    if (form) {
      this.dashboardService.createTeam(form).subscribe((response) => {
        this.dialogRef.close(response.doc.id);
      });
    }
  }

  ngOnInit(): void {
    this.dashboardService
      .getErrorObservable()
      .subscribe((error) => console.log(error));
  }
}
