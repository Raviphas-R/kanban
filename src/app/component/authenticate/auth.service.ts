import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, Subject, EMPTY, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;
  private token: string | null;
  private errorSubject = new Subject<HttpErrorResponse>();
  private userId: string;
  currentUserSubject = new BehaviorSubject<any>(null);
  private URL = 'http://127.0.0.1:8000/api/user';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getErrorObservable(): Observable<HttpErrorResponse> {
    return this.errorSubject.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  logIn(user: any) {
    const body = JSON.stringify(user);
    this.http
      .post<any>(`${this.URL}/login`, body, this.httpOptions)
      .pipe(
        catchError((error) => {
          this.errorSubject.next(error);
          return EMPTY;
        })
      )
      .subscribe({
        next: (response) => {
          const token = response.token;
          this.token = token;
          if (token) {
            this.currentUserSubject.next(response.data.user);
            this.isAuthenticated = true;
            this.saveAuthData(token);
            this.router.navigate(['/dashboard/kanban-board']);
            console.clear();
          }
        },
      });
  }

  autoAuthUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    const decodeToken: { id: string; iat: number; exp: number } =
      jwt_decode(token);
    const expiresIn = decodeToken.exp - Math.floor(Date.now() / 1000);
    if (expiresIn > 0) {
      this.token = token;
      this.userId = decodeToken.id;
      this.getData(this.userId).subscribe((response) => {
        this.isAuthenticated = true;
        this.currentUserSubject.next(response.data.doc);
        this.router.navigate(['/dashboard/kanban-board']);
      });
      this.autoLogout(expiresIn);
    } else {
      this.clearAuthData();
    }
  }

  signUp(user: any) {
    const body = JSON.stringify(user);
    this.http
      .post(`${this.URL}/signup`, body, this.httpOptions)
      .pipe(
        catchError((error) => {
          this.errorSubject.next(error);
          return EMPTY;
        })
      )
      .subscribe();
  }

  logOut() {
    return this.http.get(`${this.URL}/logout`).subscribe((resData) => {
      this.token = null;
      this.isAuthenticated = false;
      this.clearAuthData();
      this.router.navigate(['/']);
    });
  }

  private getData(id: string) {
    return this.http.get<any>(`${this.URL}/${id}`, this.httpOptions).pipe(
      catchError((error) => {
        this.errorSubject.next(error);
        return EMPTY;
      })
    );
  }

  private autoLogout(expiresIn: number) {
    setTimeout(() => this.logOut(), expiresIn * 1000);
  }

  private saveAuthData(token: string) {
    localStorage.setItem('token', token);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
  }
}
