import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../authenticate/auth.service';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  user: any;
  userImage = '../../../../assets/img/';
  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  onclick(select: string) {
    document
      .querySelector('.sidebar__icons.active')
      ?.classList.remove('active');

    document.querySelectorAll('.sidebar__icons').forEach((element) => {
      if (element.textContent === select) {
        element.classList.add('active');
      }
    });
  }

  logOut() {
    this.authService.logOut();
  }

  ngOnInit(): void {
    // this.dashboardService
    //   .getErrorObservable()
    //   .subscribe((error) => console.log(error));
    this.user = this.dashboardService.getData();
    this.userImage += this.user.image;
  }
}
