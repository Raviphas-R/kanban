import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LayoutModule } from '@angular/cdk/layout';
import { MatPaginatorModule } from '@angular/material/paginator';

import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { KanbanBoardComponent } from './body/kanban-board/kanban-board.component';
import { SettingsComponent } from './body/settings/settings.component';
import { ReportComponent } from './body/report/report.component';
import { ScheduleComponent } from './body/schedule/schedule.component';
import { MytasksComponent } from './body/mytasks/mytasks.component';
import { SharedModule } from '../shared/shared.module';
import { CreateTeamDialogComponent } from './body/kanban-board/dialog/create-team-dialog/create-team-dialog.component';
import { CreateTaskDialogComponent } from './body/kanban-board/dialog/create-task-dialog/create-task-dialog.component';
import { TaskDialogComponent } from './body/kanban-board/dialog/task-dialog/task-dialog.component';
import { ConfirmDeleteDialogComponent } from './body/kanban-board/dialog/confirm-delete-dialog/confirm-delete-dialog.component';
import { ScheduleTaskDialogComponent } from './body/schedule/schedule-task-dialog/schedule-task-dialog.component';
import { TaskListDialogComponent } from './body/schedule/task-list-dialog/task-list-dialog.component';

@NgModule({
  declarations: [
    DashboardComponent,
    SidebarComponent,
    HeaderComponent,
    KanbanBoardComponent,
    SettingsComponent,
    ReportComponent,
    ScheduleComponent,
    MytasksComponent,
    CreateTeamDialogComponent,
    CreateTaskDialogComponent,
    TaskDialogComponent,
    ConfirmDeleteDialogComponent,
    ScheduleTaskDialogComponent,
    TaskListDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    SharedModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    DragDropModule,
    MatDatepickerModule,
    MatCardModule,
    MatNativeDateModule,
    MatProgressBarModule,
    LayoutModule,
    MatPaginatorModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
})
export class DashboardModule {}
