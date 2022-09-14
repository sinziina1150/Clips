import { NgModule,NO_ERRORS_SCHEMA,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthModalComponent } from './auth-modal/auth-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    AuthModalComponent,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    BrowserModule,
    FormsModule
  ],
  exports:[
    AuthModalComponent,
    LoginComponent,
    RegisterComponent,
    SharedModule,
    FormsModule
  ]
})
export class UserModule { }
