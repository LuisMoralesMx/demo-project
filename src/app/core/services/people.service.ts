import { Injectable } from '@angular/core';
import { PeopleModel } from '../../shared/models/people.model';
import { delay, Observable, of } from 'rxjs';
import { peopleList } from './people.mock';

@Injectable({
  providedIn: 'root',
})
export class PeopleService {
  constructor() {}

  people = peopleList;

  getPeople(): Observable<PeopleModel[]> {
    return of(this.people).pipe(delay(100));
  }

  getTitlesOptions(): Observable<string[]> {
    const titles = new Set(this.people.map((p) => p.title));
    return of([...titles]);
  }
}
