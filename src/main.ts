import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication, provideProtractorTestingSupport, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/routes';
import { appConfig } from './app/app.config'; 
bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),provideProtractorTestingSupport(),
    provideRouter(routes),
    ...appConfig.providers, provideClientHydration(withEventReplay()), 
  ],
}).catch((err) => console.error(err));
