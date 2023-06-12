import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, Subject, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Task } from './data.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private user: any;
  private tasks: Task[];

  private errorSubject = new Subject<HttpErrorResponse>();
  public currentUser: Observable<any>;

  private URL = 'http://127.0.0.1:8000/api';
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  getTeam(id: string) {
    return this.http.get<any>(`${this.URL}/team/${id}`, this.httpOptions).pipe(
      catchError((error) => {
        this.errorSubject.next(error);
        return EMPTY;
      })
    );
  }

  createTeam(teamName: any) {
    const body = JSON.stringify(teamName);
    return this.http.post<any>(`${this.URL}/team`, body, this.httpOptions).pipe(
      catchError((error) => {
        this.errorSubject.next(error);
        return EMPTY;
      })
    );
  }

  addMemberToTeam(teamId: string, email: any) {
    const body = JSON.stringify({ email });
    console.log(body);
    return this.http
      .post<any>(
        `${this.URL}/team/${teamId}/add-member`,
        body,
        this.httpOptions
      )
      .pipe(
        catchError((error) => {
          this.errorSubject.next(error);
          return EMPTY;
        })
      );
  }

  createTask(data: any) {
    const body = JSON.stringify(data);
    return this.http
      .post<any>(`${this.URL}/task/`, body, this.httpOptions)
      .pipe(
        catchError((error) => {
          this.errorSubject.next(error);
          return EMPTY;
        })
      );
  }

  getUserTasks(userId: string) {
    return this.http.get(`${this.URL}/user/${userId}`, this.httpOptions).pipe(
      catchError((error) => {
        this.errorSubject.next(error);
        return EMPTY;
      })
    );
  }

  updateTask(id: string, data: any) {
    const body = JSON.stringify(data);
    return this.http
      .patch<any>(`${this.URL}/task/${id}`, body, this.httpOptions)
      .pipe(
        catchError((error) => {
          this.errorSubject.next(error);
          return EMPTY;
        })
      );
  }

  deleteTask(id: string) {
    return this.http
      .delete<any>(`${this.URL}/task/${id}`, this.httpOptions)
      .pipe(
        catchError((error) => {
          this.errorSubject.next(error);
          return EMPTY;
        })
      );
  }

  checkEmailValid(email: string) {
    const validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (email.match(validRegex)) {
      return true;
    }
    return false;
  }

  getData() {
    return this.user;
  }

  setData(user: any) {
    this.user = user;
  }

  getErrorObservable(): Observable<HttpErrorResponse> {
    return this.errorSubject.asObservable();
  }
}
