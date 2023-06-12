import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from '@angular/cdk/layout';
import { PageEvent } from '@angular/material/paginator';

import { DashboardService } from '../../dashboard.service';
import type { EChartsOption } from 'echarts';
import { Task } from '../../data.model';
import { TaskDialogComponent } from '../kanban-board/dialog/task-dialog/task-dialog.component';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit, OnDestroy {
  @ViewChildren('sorted') sortedEl: QueryList<ElementRef>;

  user: any;
  options: EChartsOption;
  isLoading = false;
  // Tasks
  taskOverview: any;
  selectedTask: Task[];
  allTasks: Task[];
  backlog: Task[] = [];
  inProgress: Task[] = [];
  review: Task[] = [];
  complete: Task[] = [];
  // Check screen width > 1400px
  isXL_screen = false;
  // Sort
  taskBeforeSorted: Task[] | undefined;
  // Filter
  filteredTask: Task[] | undefined;
  selectedStatus = 'All Tasks';
  selectedPriority = 'None';
  filter = ['All Tasks', 'None'];
  // Page
  showTask: Task[];
  page = 0;

  constructor(
    private dashboardService: DashboardService,
    private dialog: MatDialog,
    breakpointObserver: BreakpointObserver
  ) {
    breakpointObserver
      .observe(['(min-width: 1400px)', '(max-width: 900px)'])
      .subscribe((state: BreakpointState) => {
        this.isXL_screen =
          state.matches && state.breakpoints['(min-width: 1400px)']
            ? true
            : false;

        // if (state.matches && state.breakpoints['(max-width: 900px)']) {
        //   console.log('test');
        // }
      });
  }

  filterPriority(selectedPriority: string) {
    this.filter[1] = selectedPriority;
    this.taskFilter(this.filter);
  }

  filterStatus(selectedStatus: string) {
    this.filter[0] = selectedStatus;
    this.taskFilter(this.filter);
  }

  taskFilter(filter: string[]) {
    this.page = 0;
    const tasks = [...this.allTasks];
    const filteredTask = [];
    if (filter[0] === 'All Tasks' && filter[1] === 'None') {
      this.selectedTask = [...this.allTasks];
      return;
    }
    for (const task of tasks) {
      // Filter Priority
      if (filter[0] === 'All Tasks' && filter[1] !== 'None') {
        if (task.priority === filter[1]) {
          filteredTask.push(task);
        }
      }

      // Filter Status
      if (filter[0] !== 'All Tasks' && filter[1] === 'None') {
        if (task.status === filter[0]) {
          filteredTask.push(task);
        }
      }

      // Filter Status and Priority
      if (task.status === filter[0] && task.priority === filter[1]) {
        filteredTask.push(task);
      }
    }
    this.selectedTask = filteredTask;
  }

  clearFilter() {
    this.selectedStatus = 'All Tasks';
    this.selectedPriority = 'None';
    this.filter = ['All Tasks', 'None'];
    this.selectedTask = [...this.allTasks];
    this.taskBeforeSorted = undefined;
    this.page = 0;
    this.clearSortAcitve();
  }

  chartClick(event: any) {
    this.selectedStatus = event.name;
    this.filterStatus(this.selectedStatus);
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
      const status = task['status'];
      switch (status) {
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
    this.taskOverview = [
      ['All Tasks', this.allTasks.length],
      ['Backlog', this.backlog.length],
      ['In Progress', this.inProgress.length],
      ['Review', this.review.length],
      ['Complete', this.complete.length],
    ];
  }

  private calculatePercent(value: number): string {
    return ((value / this.allTasks.length) * 100).toFixed(2);
  }

  getTasks() {
    this.isLoading = true;
    this.dashboardService
      .getUserTasks(this.user.id)
      .subscribe((response: any) => {
        setTimeout(() => (this.isLoading = false), 500);
        this.allTasks = response.data.doc.tasks;
        this.selectedTask = [...this.allTasks];
        this.filterTask([...this.allTasks]);
        this.getChartOptions();
      });
  }

  getChartlabel(params: any) {
    const labelString = `${params.data.name.padEnd(8)}\n(${params.percent}%)`;
    return labelString;
  }

  getChartLegend(name: any) {
    const legend = name.split(/([0-9]+)/);
    return legend[0];
  }

  getChartOptions() {
    this.options = {
      // title: {
      //   text: 'Task Report',
      //   subtext: `Total tasks: ${this.allTasks.length}`,
      //   left: 'center',
      //   textStyle: {
      //     fontSize: 32,
      //   },
      //   subtextStyle: {
      //     fontSize: 20,
      //   },
      // },

      tooltip: {
        trigger: 'item',
        valueFormatter: (value) =>
          `${value} / ${this.allTasks.length} tasks (${this.calculatePercent(
            +value
          )}%)`,
      },
      textStyle: {
        fontSize: 16,
      },
      legend: {
        orient: 'horizontal',
        left: 'center',
        bottom: '10%',
        align: 'auto',
        textStyle: {
          fontSize: 14,
        },
        formatter: this.getChartLegend,
      },
      series: [
        {
          // name: 'Access From',
          type: 'pie',
          radius: '50%',
          top: '-20%',
          label: {
            fontSize: 12,
            color: 'inherit',
            formatter: this.getChartlabel,
          },
          itemStyle: {
            borderWidth: 1,
            borderColor: '#fff',
          },
          data: [
            {
              value: this.backlog.length,
              name: `Backlog`,
              itemStyle: {
                color: '#ba94d1',
              },
            },
            {
              value: this.inProgress.length,
              name: `In Progress`,
              itemStyle: {
                color: '#febe8c',
              },
            },
            {
              value: this.review.length,
              name: `Review`,
              itemStyle: {
                color: '#98a8f8',
              },
            },
            {
              value: this.complete.length,
              name: `Complete`,
              itemStyle: {
                color: '#90a17d ',
              },
            },
          ],
          emphasis: {
            scaleSize: 12,
            itemStyle: {
              color: 'inherit',
              shadowBlur: 10,
              shadowOffsetX: 1,
              shadowOffsetY: 1,
              shadowColor: '#fff',
            },
          },
        },
      ],
    };
  }

  sortPriority(a: any, b: any) {
    const priorityOrder: any = { H: 1, M: 2, L: 3 };
    return (
      priorityOrder[a.priority.slice(0, 1)] -
      priorityOrder[b.priority.slice(0, 1)]
    );
  }

  sortStatus(a: any, b: any) {
    const statusOrder: any = { B: 1, I: 2, R: 3, C: 4 };
    return (
      statusOrder[a.status.slice(0, 1)] - statusOrder[b.status.slice(0, 1)]
    );
  }

  sortDate(dateField: string, a: any, b: any): any {
    const field = dateField === 'UpdatedAt' ? 'updatedAt' : 'createAt';
    if (b[field] == undefined) {
      return -1;
    }
    if (b[field] < a[field]) {
      return -1;
    }

    if (b[field] > a[field]) {
      return 1;
    }

    if (b[field] == a[field]) {
      return 0;
    }
  }

  onSort(string: string, event: Event) {
    const target = event.target as HTMLElement;
    if (!this.taskBeforeSorted) {
      this.taskBeforeSorted = [...this.selectedTask];
    }
    // Check task is sorted or not
    if (target.classList.contains('active')) {
      this.selectedTask = [...this.taskBeforeSorted];
      target.classList.toggle('active');
      return;
    }

    // Clear all active sort then sort task
    this.clearSortAcitve();
    target.classList.toggle('active');
    if (target.classList.contains('active') && string === 'Priority') {
      this.selectedTask.sort(this.sortPriority);
    } else if (target.classList.contains('active') && string === 'Status') {
      this.selectedTask.sort(this.sortStatus);
    } else if (
      target.classList.contains('active') &&
      (string === 'CreateAt' || 'UpdatedAt')
    ) {
      this.selectedTask.sort(this.sortDate.bind(null, string));
    }
  }

  clearSortAcitve() {
    this.sortedEl.forEach((el) => el.nativeElement.classList.remove('active'));
  }

  handlePageEvent(event: PageEvent) {
    this.page = event.pageIndex;
  }

  openTaskDialog(task: any) {
    task.disableField = true;
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '550px',
      data: task,
      autoFocus: false,
    });
  }

  ngOnInit(): void {
    this.user = this.dashboardService.getData();
    this.getTasks();
  }

  ngOnDestroy(): void {}
}
