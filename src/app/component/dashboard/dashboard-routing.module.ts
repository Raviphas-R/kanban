import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { authGuard } from '../authenticate/auth.guard';
import { DashboardResolverService } from './dashboard.resolver.service';
import { KanbanBoardComponent } from './body/kanban-board/kanban-board.component';
import { SettingsComponent } from './body/settings/settings.component';
import { ReportComponent } from './body/report/report.component';
import { ScheduleComponent } from './body/schedule/schedule.component';
import { MytasksComponent } from './body/mytasks/mytasks.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    resolve: { user: DashboardResolverService },
    children: [
      {
        path: 'kanban-board',
        component: KanbanBoardComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'report',
        component: ReportComponent,
      },
      {
        path: 'schedule',
        component: ScheduleComponent,
      },
      {
        path: 'my-tasks',
        component: MytasksComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
