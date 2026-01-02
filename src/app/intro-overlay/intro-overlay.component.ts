import { Component, EventEmitter, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-intro-overlay",
  standalone: true,
  templateUrl: "./intro-overlay.component.html",
  styleUrls: ["./intro-overlay.component.css"],
})
export class IntroOverlayComponent implements OnInit {
  @Output() done = new EventEmitter<void>();

  ngOnInit(): void {
    // 總時長計算：
    // 文字動畫 1.2s + 黑幕拉開 1s = 2.2s
    // 安全起見設定 2.3s 後發出完成事件
    setTimeout(() => {
      this.done.emit();
    }, 2300);
  }
}
