import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { HousingService } from "../housing.service";
import { SignalFormComponent } from "./signal-form.component";

describe("SignalFormComponent", () => {
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
        params: { id: "1" },
      } as any,
    };

    TestBed.configureTestingModule({
      imports: [SignalFormComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: HousingService, useValue: housingServiceStub as Partial<HousingService> },
      ],
    });
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(SignalFormComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should update isValid when fields change", () => {
    const fixture = TestBed.createComponent(SignalFormComponent);
    const component = fixture.componentInstance;

    expect(component.isValid()).toBe(false);

    component.updateField("firstName", "Amy");
    component.updateField("lastName", "Chen");
    component.updateField("email", "amy@example.com");

    expect(component.isValid()).toBe(true);
  });

  it("should not submit when invalid", async () => {
    const fixture = TestBed.createComponent(SignalFormComponent);
    const component = fixture.componentInstance;
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => undefined);

    await component.submit();

    expect(housingServiceStub.submitApplication).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("請確認表單內容正確");

    alertSpy.mockRestore();
  });

  it("should submit and reset when valid", async () => {
    const fixture = TestBed.createComponent(SignalFormComponent);
    const component = fixture.componentInstance;
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => undefined);

    component.updateField("firstName", "Amy");
    component.updateField("lastName", "Chen");
    component.updateField("email", "amy@example.com");

    await component.submit();

    expect(housingServiceStub.submitApplication).toHaveBeenCalledWith(
      "Amy",
      "Chen",
      "amy@example.com"
    );
    expect(alertSpy).toHaveBeenCalledWith("Signal Form 資料已成功送出！");
    expect(component.form()).toEqual({ firstName: "", lastName: "", email: "" });

    alertSpy.mockRestore();
  });
});
