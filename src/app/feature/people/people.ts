import { Component, inject, OnInit } from '@angular/core';

import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { PeopleModel } from '../../shared/models/people.model';
import { CommonModule } from '@angular/common';
import { PeopleService } from '../../core/services/people.service';
import { SortDirection, SortKey } from '../../shared/models/sort.model';

@Component({
  selector: 'app-people',
  imports: [CommonModule],
  templateUrl: './people.html',
  styleUrl: './people.scss',
})
export class People implements OnInit {
  searchInput$ = new BehaviorSubject<string>('');
  sortColumn$ = new BehaviorSubject<keyof PeopleModel>('firstName');

  multiSort$ = new BehaviorSubject<SortKey[]>([]);

  filteredPeople$!: Observable<PeopleModel[]>;

  private peopleService = inject(PeopleService);

  ngOnInit(): void {
    this.filteredPeople$ = combineLatest([
      this.peopleService.getPeople(),
      this.searchInput$,
      this.multiSort$,
    ]).pipe(
      map(([people, search, multiSort]) => {
        const filtered = people.filter((person) => {
          const searchable = [
            person.firstName,
            person.lastName,
            person.dateOfBirth,
            person.title,
            person.phoneNumber,
          ]
            .join(' ')
            .toLowerCase();

          return searchable.includes(search.toLowerCase());
        });

        filtered.sort((a, b) => {
          for (const sort of multiSort) {
            const aVal = String(a[sort.column]).toLowerCase();
            const bVal = String(b[sort.column]).toLowerCase();

            if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });

        return filtered;
      }),
    );
  }

  handleOnSearchChange(value: string) {
    this.searchInput$.next(value);
  }

  handleOnSort(column: keyof PeopleModel) {
    const current = this.multiSort$.value;
    const existing = current.find((s) => s.column === column);
    let newDirection: SortDirection = 'asc';

    if (existing) {
      newDirection = existing.direction === 'asc' ? 'desc' : 'asc';
    }

    const newSort: SortKey[] = [
      { column, direction: newDirection },
      ...current.filter((s) => s.column !== column),
    ];

    this.multiSort$.next(newSort);
  }
}
