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

  checkedList = new Set();

  private peopleService = inject(PeopleService);

  ngOnInit(): void {
    this.filteredPeople$ = combineLatest([
      this.peopleService.getPeople(),
      this.searchInput$,
      this.sortColumn$,
      this.sortDirection$,
    ]).pipe(
      map(([people, search, sortColumn, sortDirection]) => {
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

          return searchable.includes(search);
        });

        filtered.sort((a, b) => {
          const aVal = String(a[sortColumn]).toLowerCase();
          const bVal = String(b[sortColumn]).toLowerCase();

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

  handleChecked(id: number): void {
    this.checkedList.has(id) ? this.checkedList.delete(id) : this.checkedList.add(id);
  }

  handleAllChecked(peopleList: PeopleModel[], checked: boolean) {
    checked
      ? peopleList.forEach((p) => this.checkedList.add(p.id))
      : peopleList.forEach((p) => this.checkedList.delete(p.id));
  }

  handleAreAllSelected(peopleList: PeopleModel[]): boolean {
    return peopleList.every((p) => this.checkedList.has(p.id));
  }

  handleIconSort(sortColumn: string, column: string, sortDirection: string) {
    let direction = '';
    if (sortColumn === column) {
      direction = sortDirection === 'asc' ? '↑' : '↓';
    }
    return direction;
  }

  submit(peopleList: PeopleModel[]): void {
    const result = peopleList.filter((p) => this.checkedList.has(p.id));
    console.log('Result', result);
  }
}
