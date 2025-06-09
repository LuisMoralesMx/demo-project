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

  titleFilter$ = new BehaviorSubject<string>('all');
  titleList$!: Observable<string[]>;

  debounceSearch$!: Observable<string>;
  filteredPeople$!: Observable<PeopleModel[]>;

  editFieldById: number = -1;
  checkedPeopleList = new Set();

  currentPage$ = new BehaviorSubject(1);
  pageSize = 10;

  private peopleService = inject(PeopleService);

  ngOnInit(): void {
    this.debounceSearch$ = this.searchInput$.pipe(debounceTime(300), distinctUntilChanged());

    this.filteredPeople$ = combineLatest([
      this.peopleService.getPeople(),
      this.debounceSearch$,
      this.multiSort$,
      this.titleFilter$,
      this.currentPage$,
    ]).pipe(
      map(([people, search, multiSort, titleFilter, currentPage]) => {
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

        // Filters
        filtered =
          titleFilter !== 'all' ? filtered.filter((f) => f.title === titleFilter) : filtered;

        // Sorting
        filtered.sort((a, b) => {
          for (const sort of multiSort) {
            const aVal = String(a[sort.column]).toLowerCase();
            const bVal = String(b[sort.column]).toLowerCase();

            if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });

        // Pagination
        const start = (currentPage - 1) * this.pageSize;
        const paginated = filtered.slice(start, start + this.pageSize);

        return paginated;
      }),
    );

    this.titleList$ = this.peopleService.getPeopleTitles();
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

  handleOnSortIcon(column: keyof PeopleModel): string {
    const current = this.multiSort$.value;
    const existing = current.find((s) => s.column === column);
    let icon = '';

    if (existing) {
      icon = existing?.direction === 'asc' ? '↑' : '↓';
    }

    return icon;
  }

  handleOnEdit(id: number) {
    this.editFieldById = id;
  }

  handleOnEditCancel() {
    this.editFieldById = -1;
  }

  handleOnTitleFilter(title: string) {
    this.titleFilter$.next(title);
  }

  handleChecked(id: number): void {
    this.checkedPeopleList.has(id)
      ? this.checkedPeopleList.delete(id)
      : this.checkedPeopleList.add(id);
  }

  handleAllChecked(peopleList: PeopleModel[], checked: boolean): void {
    checked
      ? peopleList.forEach((p) => this.checkedPeopleList.add(p.id))
      : peopleList.forEach((p) => this.checkedPeopleList.delete(p.id));
  }

  handleAreAllChecked(peopleList: PeopleModel[]): boolean {
    return peopleList.every((p) => this.checkedPeopleList.has(p.id));
  }

  handleNextPage() {
    const current = this.currentPage$.value;
    this.currentPage$.next(current + 1);
  }

  handlePrevPage() {
    const current = this.currentPage$.value;
    if (current > 1) {
      this.currentPage$.next(current - 1);
    }
  }
}
