import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SignInPageComponent } from './authPage/sign-in-page/sign-in-page.component';
import { SignUpPageComponent } from './authPage/sign-up-page/sign-up-page.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [SignInPageComponent, SignUpPageComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
})
export class AuthModule {}
