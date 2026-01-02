import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HomeComponent } from "./home/home.component";
import { RouterLink, RouterOutlet } from "@angular/router";
import { IntroOverlayComponent } from "./intro-overlay/intro-overlay.component";

@Component({
  selector: "app-root",
  imports: [CommonModule, RouterLink, RouterOutlet, IntroOverlayComponent],
  template: `
    <!-- 開場動畫 Overlay（使用 *ngIf 控制） -->
    <app-intro-overlay *ngIf="showIntro" (done)="onIntroDone()">
    </app-intro-overlay>

    <main>
      <a [routerLink]="['/']">
        <header class="brand-name">
          <img
            class="brand-logo"
            src="/assets/logo.svg"
            alt="logo"
            aria-hidden="true"
          />
        </header>
      </a>
      <section class="content">
        <router-outlet></router-outlet>
      </section>
    </main>
  `,
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "homes";
  showIntro = true;

  // 動畫完成後的處理
  onIntroDone(): void {
    // 將 overlay 從 DOM 移除
    this.showIntro = false;
  }
}
