import { TestBed } from "@angular/core/testing";
import { IntroOverlayComponent } from "./intro-overlay.component";
import { vi } from "vitest";

describe("IntroOverlayComponent", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IntroOverlayComponent],
    });
  });

  it("should emit done after 2300ms", () => {
    vi.useFakeTimers();

    const fixture = TestBed.createComponent(IntroOverlayComponent);
    const component = fixture.componentInstance;
    const emitSpy = vi.spyOn(component.done, "emit");

    fixture.detectChanges();

    vi.advanceTimersByTime(2299);
    expect(emitSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(emitSpy).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
