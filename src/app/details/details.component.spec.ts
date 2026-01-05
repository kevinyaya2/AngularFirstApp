import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { HousingService } from "../housing.service";
import { DetailsComponent } from "./details.component";
import { vi } from "vitest";

describe("DetailsComponent", () => {
  let housingServiceStub: {
    getHousingLocationById: ReturnType<typeof vi.fn>;
    checkFirstNameExists: ReturnType<typeof vi.fn>;
    submitApplication: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    housingServiceStub = {
      getHousingLocationById: vi.fn(async () => undefined),
      checkFirstNameExists: vi.fn(async () => false),
      submitApplication: vi.fn(async () => undefined),
    };

    const activatedRouteStub: Partial<ActivatedRoute> = {
      snapshot: {
        params: { id: "1" },
      } as any,
    };

    const domSanitizerStub: Partial<DomSanitizer> = {
      bypassSecurityTrustResourceUrl: (value: string) => value as any,
    };

    TestBed.configureTestingModule({
      imports: [DetailsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: DomSanitizer, useValue: domSanitizerStub },
        { provide: HousingService, useValue: housingServiceStub as Partial<HousingService> },
      ],
    });
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(DetailsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should load housingLocation by route id and create mapUrl when lat/lng exist", async () => {
    housingServiceStub.getHousingLocationById.mockResolvedValueOnce({
      id: 1,
      name: "Test Home",
      city: "Taipei",
      state: "TW",
      photo: "test.jpg",
      availableUnits: 1,
      wifi: true,
      laundry: false,
      latitude: 25.033,
      longitude: 121.5654,
    } as any);

    const fixture = TestBed.createComponent(DetailsComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(housingServiceStub.getHousingLocationById).toHaveBeenCalledWith(1);
    expect(component.housingLocation).toBeTruthy();
    expect(component.mapUrl).toBeTruthy();
  });

  it("should set duplicate error when firstName exists", async () => {
    vi.useFakeTimers();

    housingServiceStub.checkFirstNameExists.mockResolvedValueOnce(true);
    const fixture = TestBed.createComponent(DetailsComponent);
    const component = fixture.componentInstance;

    component.applyForm.get("firstName")!.setValue("Amy");
    vi.advanceTimersByTime(500);
    await Promise.resolve();

    const control = component.applyForm.get("firstName")!;
    expect(housingServiceStub.checkFirstNameExists).toHaveBeenCalledWith("Amy");
    expect(control.hasError("duplicate")).toBe(true);

    vi.useRealTimers();
  });

  it("should clear duplicate error when firstName becomes unique", async () => {
    vi.useFakeTimers();

    housingServiceStub.checkFirstNameExists
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const fixture = TestBed.createComponent(DetailsComponent);
    const component = fixture.componentInstance;
    const control = component.applyForm.get("firstName")!;

    control.setValue("Amy");
    vi.advanceTimersByTime(500);
    await Promise.resolve();
    expect(control.hasError("duplicate")).toBe(true);

    control.setValue("Bob");
    vi.advanceTimersByTime(500);
    await Promise.resolve();
    expect(control.hasError("duplicate")).toBe(false);

    vi.useRealTimers();
  });
});
