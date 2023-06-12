import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../authenticate/auth.service';
import { Observable } from 'rxjs';
import { DashboardService } from './dashboard.service';

// import { Recipe } from './recipe.model';
// import { RecipeService } from './recipe.service';

interface Resolve<T> {
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<T> | Promise<T> | T;
}

@Injectable({ providedIn: 'root' })
export class DashboardResolverService implements Resolve<any> {
  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let user;

    this.authService.currentUserSubject.subscribe((response) => {
      user = response;
      this.dashboardService.setData(user);
    });

    // return user;
  }
}
