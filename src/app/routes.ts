import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './details/details.component';
import { DetailsTemplateComponent } from './details-template/details-template.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home page',
  },
  {
    path: 'details/:id',
    component: DetailsComponent,
    title: 'Home details',
  },
  { path: 'details-template/:id', component: DetailsTemplateComponent }, // Template
  {
  path: 'signal-form/:id',
  loadComponent: () =>
    import('./signal-form/signal-form.component').then(
      (m) => m.SignalFormComponent
    ),
  title: 'Signal Form Demo',
  },

];
