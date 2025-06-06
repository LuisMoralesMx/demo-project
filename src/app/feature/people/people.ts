import { Component, inject, OnInit } from '@angular/core';

import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { PeopleModel } from '../../shared/models/people.model';
import { CommonModule } from '@angular/common';
import { PeopleService } from '../../core/services/people.service';
import { SortDirection } from '../../shared/models/sort.model';

@Component({
  selector: 'app-people',
  imports: [CommonModule],
  templateUrl: './people.html',
  styleUrl: './people.scss',
})
export class People implements OnInit {
  searchInput$ = new BehaviorSubject<string>('');
  sortColumn$ = new BehaviorSubject<keyof PeopleModel>('firstName');
  sortDirection$ = new BehaviorSubject<SortDirection>('asc');

  filteredPeople$!: Observable<PeopleModel[]>;

  private peopleService = inject(PeopleService);

  ngOnInit(): void {
    this.filteredPeople$ = combineLatest([
      this.peopleService.getPeople(),
      this.searchInput$,
      this.sortColumn$,
      this.sortDirection$,
    ]).pipe(
      map(([people, keyword, sortColumn, sortDirection]) => {
        const filtered = people.filter((person) =>
          Object.values(person).some((val: string) =>
            val.toLowerCase().includes(keyword.toLowerCase()),
          ),
        );

        filtered.sort((a, b) => {
          const aVal = a[sortColumn].toLowerCase();
          const bVal = b[sortColumn].toLowerCase();

          if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;

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
    if (column === this.sortColumn$.value) {
      const direction = this.sortDirection$.value === 'asc' ? 'desc' : 'asc';
      this.sortDirection$.next(direction);
    } else {
      this.sortColumn$.next(column);
      this.sortDirection$.next('asc');
    }
  }
}
