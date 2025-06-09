import { PeopleModel } from './people.model';

export type SortDirection = 'asc' | 'desc';
export type SortKey = { column: keyof PeopleModel; direction: SortDirection };
