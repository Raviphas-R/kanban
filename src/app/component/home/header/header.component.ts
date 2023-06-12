import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../authenticate/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @ViewChild('loginForm', { static: true })
  loginForm!: NgForm;
  isLogin: boolean = false;

  constructor(private authService: AuthService) {}
}
