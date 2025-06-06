import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'people',
    loadComponent: () => import('./feature/people/people').then((c) => c.People),
  },
];
