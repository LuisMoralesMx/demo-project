import { Injectable } from '@angular/core';
import { PeopleModel } from '../../shared/models/people.model';
import { BehaviorSubject, delay, map, Observable } from 'rxjs';
import { peopleList } from './people.mock';

@Injectable({
  providedIn: 'root',
})
export class PeopleService {
  constructor() {}

  private peopleSubject = new BehaviorSubject<PeopleModel[]>(peopleList);
  people$ = this.peopleSubject.asObservable();

  getPeople(): Observable<PeopleModel[]> {
    return this.people$.pipe(delay(100));
  }
}
