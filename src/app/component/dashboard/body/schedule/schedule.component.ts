import { Component, OnInit, ElementRef } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleTaskDialogComponent } from './schedule-task-dialog/schedule-task-dialog.component';
import { TaskListDialogComponent } from './task-list-dialog/task-list-dialog.component';
import { Task } from '../../data.model';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
})
export class ScheduleComponent implements OnInit {
  user: any;
  tasks: Task[];
  selected: Date | null;
  uniqueTaskDate: string[] = [];
  dateTasks: any = [];
  isLoading = false;
  taskInDate: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private elementRef: ElementRef,
    private dialog: MatDialog
  ) {}

  private formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const options = {
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const,
    };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate;
  }

  selectedDate(event: Event) {
    const target = event.target as HTMLElement;
    const calendarDate = target.getAttribute('aria-label');
    if (calendarDate) {
      for (const task of this.taskInDate) {
        if (calendarDate === task.date) {
          this.dateTasks = task.tasks;
        }
      }
    } else {
      this.dateTasks = [];
    }
    this.sortPriority(this.dateTasks);
    if (target.classList.contains('hasEvent')) {
      //open tasklist dialog
      const taskList: any = document.querySelector('.taskList');
      const taskListDisplayValue =
        getComputedStyle(taskList).getPropertyValue('display');
      if (taskListDisplayValue === 'none') {
        const dialogRef = this.dialog.open(TaskListDialogComponent, {
          position: { left: '30%' },
          data: this.dateTasks,
          autoFocus: false,
        });
      }
    }
  }

  addMarkOnDate() {
    this.taskInDate.forEach((taskEvent) => {
      this.sortPriority(taskEvent.tasks);
      const date = document.querySelector(`[aria-label="${taskEvent.date}"]`);
      date?.classList.add('hasEvent');
      date?.setAttribute('data-priority', taskEvent.tasks[0].priority);
    });
  }

  addBtnEvent() {
    const queryBtn = [
      '.mat-calendar-next-button',
      '.mat-calendar-previous-button',
    ];
    queryBtn.forEach((btn) => {
      const buttonElement = this.elementRef.nativeElement.querySelector(btn);
      buttonElement.addEventListener('click', () => {
        this.selected = null;
        this.addMarkOnDate();
      });
    });
  }

  sortPriority(priorities: any[]) {
    priorities.sort(function (a, b) {
      const priorityOrder: any = { H: 1, M: 2, L: 3 };
      return (
        priorityOrder[a.priority.slice(0, 1)] -
        priorityOrder[b.priority.slice(0, 1)]
      );
    });
  }

  loadTaskInDate() {
    let taskDate: string[] = [];
    this.tasks.forEach((task: any) => {
      task.formatDate = this.formatDate(task.createAt);
      taskDate.push(this.formatDate(task.createAt));
      let hasEvent = false;
      for (const taskInDate of this.taskInDate) {
        if (this.formatDate(task.createAt) === taskInDate.date) {
          taskInDate.tasks.push(task);
          hasEvent = true;
        }
      }
      if (!hasEvent) {
        const newTaskInDate: { date: string; tasks: any[] } = {
          date: '',
          tasks: [],
        };
        newTaskInDate['date'] = this.formatDate(task.createAt);
        newTaskInDate['tasks'].push(task);
        this.taskInDate.push(newTaskInDate);
      }
      hasEvent = false;
    });
    this.uniqueTaskDate = [...new Set(taskDate)];
  }

  openTaskDialog(task: any) {
    const dialogRef = this.dialog.open(ScheduleTaskDialogComponent, {
      data: task,
      width: '450px',
      autoFocus: false,
    });
  }

  ngOnInit(): void {
    this.user = this.dashboardService.getData();
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 700);
  }

  ngAfterViewInit() {
    this.dashboardService
      .getUserTasks(this.user.id)
      .subscribe((resonse: any) => {
        this.tasks = resonse.data.doc.tasks;
        this.loadTaskInDate();
        this.addMarkOnDate();
        this.addBtnEvent();
      });
  }
}
