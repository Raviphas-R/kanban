import { Component, OnInit } from '@angular/core';
import { NgForm, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-sign-in-page',
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.css'],
})
export class SignInPageComponent implements OnInit {
  logInForm: NgForm;
  resError: ValidationErrors | string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  logIn(form: NgForm) {
    this.authService.logIn(form.value);
    form.reset();
  }

  ngOnInit(): void {
    this.authService.getErrorObservable().subscribe((error) => {
      this.resError = error.error.message;
    });
  }
}
