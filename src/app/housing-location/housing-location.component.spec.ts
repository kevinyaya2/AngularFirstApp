import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { HousingLocationComponent } from "./housing-location.component";
import { By } from "@angular/platform-browser";
import { RouterLink } from "@angular/router";

describe("HousingLocationComponent", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HousingLocationComponent],
      providers: [provideRouter([])],
    });
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(HousingLocationComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render when housingLocation input is provided", () => {
    const fixture = TestBed.createComponent(HousingLocationComponent);
    const component = fixture.componentInstance;

    component.housingLocation = {
      id: 1,
      name: "Test Home",
      city: "Taipei",
      state: "TW",
      photo: "test.jpg",
      availableUnits: 1,
      wifi: true,
      laundry: false,
    } as any;

    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it("should bind routerLink commands correctly", () => {
    const fixture = TestBed.createComponent(HousingLocationComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);

    component.housingLocation = {
      id: 7,
      name: "Test Home",
      city: "Taipei",
      state: "TW",
      photo: "test.jpg",
      availableUnits: 1,
      wifi: true,
      laundry: false,
    } as any;

    fixture.detectChanges();

    const links = fixture.debugElement.queryAll(By.directive(RouterLink));
    const urls = links.map((el) => {
      const routerLink = el.injector.get(RouterLink);
      return router.serializeUrl(routerLink.urlTree!);
    });

    expect(urls).toEqual(["/details/7", "/details-template/7", "/signal-form/7"]);
  });
});
