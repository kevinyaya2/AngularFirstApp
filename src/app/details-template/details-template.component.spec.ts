import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { HousingService } from "../housing.service";
import { DetailsTemplateComponent } from "./details-template.component";
import { vi } from "vitest";

describe("DetailsTemplateComponent", () => {
  let housingServiceStub: {
    getHousingLocationById: ReturnType<typeof vi.fn>;
    submitApplication: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    housingServiceStub = {
      getHousingLocationById: vi.fn(async () => undefined),
      submitApplication: vi.fn(async () => undefined),
    };

    const activatedRouteStub: Partial<ActivatedRoute> = {
      snapshot: {
        params: { id: "123" },
      } as any,
    };

    TestBed.configureTestingModule({
      imports: [DetailsTemplateComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HousingService, useValue: housingServiceStub as Partial<HousingService> },
      ],
    });
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(DetailsTemplateComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should load housingLocation by route id", async () => {
    housingServiceStub.getHousingLocationById.mockResolvedValueOnce({
      id: 123,
      name: "Test Home",
      city: "Taipei",
      state: "TW",
      photo: "test.jpg",
      availableUnits: 1,
      wifi: true,
      laundry: false,
    } as any);

    const fixture = TestBed.createComponent(DetailsTemplateComponent);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(housingServiceStub.getHousingLocationById).toHaveBeenCalledWith(123);
    expect(component.housingLocation).toBeTruthy();
  });

  it("should submit and reset when form is valid", () => {
    const fixture = TestBed.createComponent(DetailsTemplateComponent);
    const component = fixture.componentInstance;
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => undefined);

    component.firstName = "Amy";
    component.lastName = "Chen";
    component.email = "amy@example.com";

    const formStub = { valid: true, reset: vi.fn() };
    component.submitApplication(formStub);

    expect(housingServiceStub.submitApplication).toHaveBeenCalledWith(
      "Amy",
      "Chen",
      "amy@example.com"
    );
    expect(alertSpy).toHaveBeenCalledWith("Template-Driven 資料已送出!");
    expect(formStub.reset).toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it("should not submit when form is invalid", () => {
    const fixture = TestBed.createComponent(DetailsTemplateComponent);
    const component = fixture.componentInstance;

    const formStub = { valid: false, reset: vi.fn() };
    component.submitApplication(formStub);

    expect(housingServiceStub.submitApplication).not.toHaveBeenCalled();
    expect(formStub.reset).not.toHaveBeenCalled();
  });
});
