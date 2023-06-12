import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { NgForm, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up-page',
  templateUrl: './sign-up-page.component.html',
  styleUrls: ['./sign-up-page.component.css'],
})
export class SignUpPageComponent implements OnInit {
  resError: ValidationErrors;

  constructor(private authService: AuthService, private router: Router) {}

  signUp(form: NgForm) {
    this.authService.signUp(form.value);
    // form.reset();
  }

  ngOnInit(): void {
    this.authService.getErrorObservable().subscribe((error) => {
      this.resError = error.error.message;
    });
  }
}
