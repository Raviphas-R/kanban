import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { DashboardService } from 'src/app/component/dashboard/dashboard.service';

@Component({
  selector: 'app-create-task-dialog',
  templateUrl: './create-task-dialog.component.html',
  styleUrls: ['./create-task-dialog.component.css'],
})
export class CreateTaskDialogComponent implements OnInit {
  @ViewChild('myForm') myForm: NgForm;
  priority: string = 'Low Priority';
  taskParticipantId: string[] = [this.data.myId];
  taskParticipantEmail: string[] = [this.data.myEmail];
  errorMsg: string;

  constructor(
    public dialogRef: MatDialogRef<CreateTaskDialogComponent>,
    private dashboardService: DashboardService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  private getErrorMsg(error: string, control: string) {
    this.myForm.form.controls[control].reset();
    this.errorMsg = error;
  }

  onCheckUser(participant: string) {
    const teamMember = this.data.selectedTeam.teamMember;
    const validEmail = this.dashboardService.checkEmailValid(participant);

    if (!validEmail) {
      this.getErrorMsg(
        `Please input the valid email.\tEx:user@kanban.com`,
        'participant'
      );

      return;
    }

    for (const member of teamMember) {
      if (member.email === participant) {
        if (!this.taskParticipantId.includes(member.id)) {
          this.taskParticipantId.push(member.id);
          this.taskParticipantEmail.push(member.email);
          this.getErrorMsg('', 'participant');
          this.errorMsg = '';
          return;
        }
        console.log(this.taskParticipantId);
        this.getErrorMsg(`"${participant}" is already in Team.`, 'participant');

        return;
      }
    }

    this.getErrorMsg(`"${participant}" is not in this team.`, 'participant');
  }

  removeParticipant(email: string, i: number) {
    this.taskParticipantEmail.splice(i, 1);
    this.taskParticipantId.splice(i, 1);
    if (
      this.taskParticipantEmail.length < 1 &&
      this.taskParticipantId.length < 1
    ) {
      this.getErrorMsg(
        `Each tasks must have at least one participant.`,
        'participant'
      );
    }
  }

  onCreateTask() {
    const taskData = this.myForm.value;
    taskData.team = this.data.selectedTeam.id;
    taskData.status = this.data.selectedStatus;
    taskData.participant = this.taskParticipantId;
    this.dashboardService.createTask(taskData).subscribe((response) => {
      this.dialogRef.close(taskData.team);
    });
  }

  oncloseAlertMsg() {
    this.errorMsg = '';
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
