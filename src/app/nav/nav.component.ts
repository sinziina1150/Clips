import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  constructor(
    private Router: Router,
    public modal: ModalService,
    public auth: AuthService,
    private afauth: AngularFireAuth,
  ) {}

  ngOnInit(): void {}

  openModal($event: Event) {
    $event.preventDefault();
    this.modal.toggleModal('auth');
  }

  
}
