import { Component, inject, OnInit } from '@angular/core';

import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
} from 'rxjs';
import { PeopleModel } from '../../shared/models/people.model';
import { CommonModule } from '@angular/common';
import { PeopleService } from '../../core/services/people.service';
import { SortDirection, SortKey } from '../../shared/models/sort.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-people',
  imports: [CommonModule, FormsModule],
  templateUrl: './people.html',
  styleUrl: './people.scss',
})
export class People implements OnInit {
  searchInput$ = new BehaviorSubject<string>('');
  sortColumn$ = new BehaviorSubject<keyof PeopleModel>('firstName');
  multiSort$ = new BehaviorSubject<SortKey[]>([]);

  totalPeople$!: Observable<PeopleModel[]>;
  filteredPeople$!: Observable<PeopleModel[]>;
  searchInputDebounce$!: Observable<string>;

  // Edit Input
  editInputId = -1;

  // Checkboxes
  checkedList = new Set();
  checkedAll = false;

  // Filters
  titleFilter$ = new BehaviorSubject('all');
  titleList!: Observable<string[]>;

  // Pagination
  currentPage$ = new BehaviorSubject(1);
  pageSize = 10;

  private peopleService = inject(PeopleService);

  ngOnInit(): void {
    this.titleList = this.peopleService.getTitlesOptions();
    this.totalPeople$ = this.peopleService.getPeople();
    this.searchInputDebounce$ = this.searchInput$.pipe(debounceTime(300), distinctUntilChanged());

    this.filteredPeople$ = combineLatest([
      this.totalPeople$,
      this.searchInputDebounce$,
      this.multiSort$,
      this.currentPage$,
      this.titleFilter$,
    ]).pipe(
      map(([people, search, multiSort, currentPage, titleFilter]) => {
        let filtered = people.filter((person) => {
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

        // Filtering
        filtered =
          titleFilter !== 'all' ? filtered.filter((f) => f.title === titleFilter) : filtered;

        // Pagination
        const start = (currentPage - 1) * this.pageSize;
        const paginated = filtered.slice(start, start + this.pageSize);

        return paginated;
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

  nextPage(peopleList: PeopleModel[]) {
    const current = this.currentPage$.value;
    const max = Math.ceil(peopleList.length / this.pageSize);

    if (current < max) {
      this.currentPage$.next(current + 1);
    }
  }

  prevPage() {
    const current = this.currentPage$.value;
    if (current > 1) {
      this.currentPage$.next(current - 1);
    }
  }

  handleTitleFilter(title: string): void {
    this.titleFilter$.next(title);
  }

  handleSortIcon(column: keyof PeopleModel): string {
    const current = this.multiSort$.value;
    const existing = current.find((s) => s.column === column);
    let icon = '';

    if (existing) {
      icon = existing.direction === 'asc' ? '↑' : '↓';
    }

    return icon;
  }

  handleChecked(id: number, peopleList: PeopleModel[]): void {
    this.checkedList.has(id) ? this.checkedList.delete(id) : this.checkedList.add(id);
    this.checkedAll = peopleList.every((p) => this.checkedList.has(p.id));
  }

  handleAllChecked(checked: boolean, peopleList: PeopleModel[]) {
    if (checked) {
      peopleList.forEach((p) => this.checkedList.add(p.id));
      this.checkedAll = true;
    } else {
      peopleList.forEach((p) => this.checkedList.delete(p.id));
      this.checkedAll = false;
    }
  }

  handleEdit(id: number): void {
    this.editInputId = id;
  }

  handleEditCancel() {
    this.editInputId = -1;
  }

  handleSubmit(people: PeopleModel[]) {
    const selected = people.filter((p) => this.checkedList.has(p.id));
    console.log('Result', selected);
  }
}
