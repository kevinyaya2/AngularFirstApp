import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

export default function bootstrap(context: unknown) {
  // 在這裡用 `as any`，因為 Angular 沒有 export BootstrapContext 型別
  return bootstrapApplication(AppComponent, config, context as any);
}
