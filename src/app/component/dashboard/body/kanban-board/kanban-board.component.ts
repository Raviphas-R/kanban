import {
  Component,
  OnInit,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { DashboardService } from '../../dashboard.service';
import { Task, Team } from '../../data.model';
import { CreateTeamDialogComponent } from './dialog/create-team-dialog/create-team-dialog.component';
import { TaskDialogComponent } from './dialog/task-dialog/task-dialog.component';
import { CreateTaskDialogComponent } from './dialog/create-task-dialog/create-task-dialog.component';

class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  user: any;
  selectedTeam: Team;
  selectedTeamMember: any = [];
  showTeamMember: any = [];
  remainTeamMember: any = [];
  teams: Team[] = [];
  isLoading = false;
  isNewTeam = false;
  // Tasks
  backlog: Task[] = [];
  inProgress: Task[] = [];
  review: Task[] = [];
  complete: Task[] = [];
  selectedTask: Task;
  // Add User Form
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^\S+@\S+\.\S+$/),
  ]);
  matcher = new MyErrorStateMatcher();
  // Add User Message
  successAddUserMsg: string | undefined;
  failAddUserMsg: string | undefined;

  constructor(
    private dashboardService: DashboardService,
    private elRef: ElementRef,
    private dialog: MatDialog
  ) {}

  addTeamMember() {
    const addedUserEmail = this.emailFormControl.value;
    this.dashboardService
      .addMemberToTeam(this.selectedTeam.id, [addedUserEmail])
      .subscribe((response) => {
        console.log(response.message);
        this.getAddUserMsgAndClearForm(response.message, '');
        this.loadTeam(this.selectedTeam.id);
      });
  }

  onDropdownClose(): void {
    this.getAddUserMsgAndClearForm();
  }

  private getAddUserMsgAndClearForm(
    successMsg: string | undefined = undefined,
    errorMsg: string | undefined = undefined,
    clearForm: boolean = true
  ) {
    this.successAddUserMsg = successMsg;
    this.failAddUserMsg = errorMsg;
    if (clearForm) {
      this.emailFormControl.reset();
    }
  }

  closeAddUserDropDown() {
    const addUserForm = document.querySelector(
      '.kanban__team-member_add-user-form'
    );
    addUserForm?.classList.remove('show');
    this.getAddUserMsgAndClearForm();
  }

  openCreateTeamDialog() {
    const dialogRef = this.dialog.open(CreateTeamDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      this.isLoading = true;
      if (result) {
        this.isNewTeam = true;
        this.loadTeam(result);
      } else {
        this.isLoading = false;
      }
    });
  }

  openCreateTaskDialog(status: string) {
    console.log(this.selectedTeam);
    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      data: {
        selectedStatus: status,
        selectedTeam: this.selectedTeam,
        myId: this.user.id,
        myEmail: this.user.email,
      },
      width: '550px',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.isLoading = true;
      if (result) {
        this.loadTeam(result);
      } else {
        this.isLoading = false;
      }
    });
  }

  openTaskDialog(i: number, taskList: string) {
    let data;
    switch (taskList) {
      case 'backlog':
        data = this.backlog[i];
        break;
      case 'inProgress':
        data = this.inProgress[i];
        break;
      case 'review':
        data = this.review[i];
        break;
      case 'complete':
        data = this.complete[i];
        break;
    }
    console.log(data);
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '550px',
      data,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true;
        this.loadTeam(this.selectedTeam.id);
      }
    });
  }

  onTeamSelect(team: Team, event: Event) {
    this.elRef.nativeElement
      .querySelectorAll('.kanban__dropdown__teamlist span')
      .forEach((el: any) => el.classList.add('hidden'));
    const target = event.target as HTMLElement;
    target.firstElementChild?.classList.remove('hidden');
    this.loadTeam(team.id);
    console.log(this.selectedTeam);
  }

  clearTask() {
    this.backlog = [];
    this.inProgress = [];
    this.review = [];
    this.complete = [];
  }

  filterTask(data: Task[]) {
    this.clearTask();
    for (const task of data) {
      switch (task['status']) {
        case 'Backlog':
          this.backlog.push(task);
          break;
        case 'In Progress':
          this.inProgress.push(task);
          break;
        case 'Review':
          this.review.push(task);
          break;
        case 'Complete':
          this.complete.push(task);
          break;
      }
    }
  }

  clearTeamMember() {
    this.selectedTeamMember = [];
    this.showTeamMember = [];
    this.remainTeamMember = [];
  }

  loadSelectedTeamMember(selectedTeamMember: any) {
    // Clear selected Team member.
    this.clearTeamMember();
    for (const userMember of selectedTeamMember) {
      this.selectedTeamMember.push(userMember);
    }
    this.showTeamMember = this.selectedTeamMember.slice(-3);
    this.remainTeamMember = this.selectedTeamMember.slice(0, -3);
  }

  loadTeam(teamId: string) {
    this.dashboardService.getTeam(teamId).subscribe((response) => {
      setTimeout(() => (this.isLoading = false), 500);
      if (this.isNewTeam) {
        this.isNewTeam = false;
        this.teams.push(response.data.doc);
      }
      this.selectedTeam = response.data.doc;
      const tasks = response.data.doc.tasks;
      this.filterTask(tasks);
      this.loadSelectedTeamMember(this.selectedTeam.teamMember);
    });
  }

  loadData() {
    this.isLoading = true;
    this.user = this.dashboardService.getData();
    console.log(this.user);
    if (this.user.teams.length > 0) {
      this.user.teams.forEach((el: any) => this.teams.push(el));
      this.loadTeam(this.user.teams[0].id);
    } else {
      setTimeout(() => (this.isLoading = false), 500);
    }
  }

  // Drag&Drop function
  drop(event: CdkDragDrop<Task[]>, newTaskStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const task: Task = event.container.data[event.currentIndex];
      task.status = newTaskStatus;
      this.dashboardService.updateTask(task.id, task).subscribe();
    }
  }

  ngOnInit(): void {
    this.loadData();
    this.dashboardService.getErrorObservable().subscribe((error) => {
      this.getAddUserMsgAndClearForm('', error.error.message, false);
    });
  }

  ngOnDestroy(): void {}
}
