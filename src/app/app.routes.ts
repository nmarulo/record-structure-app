import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./modules/home/pages/home/home').then(m => m.Home)
  }
];
