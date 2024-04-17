import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userSubject = new BehaviorSubject<User>({} as User);
  user$ = this.userSubject.asObservable();

  constructor() { }

  actualizarUser(user: User) {
    this.userSubject.next(user);
  }
}
