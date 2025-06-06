import { Injectable } from '@angular/core';
import { PeopleModel } from '../../shared/models/people.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PeopleService {
  constructor() {}

  private people: PeopleModel[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1985-05-15',
      title: 'Engineer',
      phoneNumber: '123-456-7890',
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1990-10-20',
      title: 'Manager',
      phoneNumber: '987-654-3210',
    },
    {
      id: 3,
      firstName: 'Alice',
      lastName: 'Johnson',
      dateOfBirth: '1975-03-22',
      title: 'Designer',
      phoneNumber: '555-123-4567',
    },
    {
      id: 4,
      firstName: 'Bob',
      lastName: 'Williams',
      dateOfBirth: '2000-12-01',
      title: 'Developer',
      phoneNumber: '444-333-2222',
    },
  ];

  getPeople(): Observable<PeopleModel[]> {
    return of(this.people);
  }
}
