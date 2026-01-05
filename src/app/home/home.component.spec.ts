import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { HousingService } from "../housing.service";
import { HomeComponent } from "./home.component";
import { vi } from "vitest";

describe("HomeComponent", () => {
  let housingServiceStub: {
    getAllHousingLocations: ReturnType<typeof vi.fn>;
  };

  let translateServiceStub: {
    setDefaultLang: ReturnType<typeof vi.fn>;
    use: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    housingServiceStub = {
      getAllHousingLocations: vi.fn(async () => []),
    };

    translateServiceStub = {
      setDefaultLang: vi.fn(() => undefined),
      use: vi.fn(() => undefined as any),
    };

    TestBed.overrideComponent(HomeComponent, {
      set: {
        template: "",
      },
    });

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: HousingService, useValue: housingServiceStub as Partial<HousingService> },
        { provide: TranslateService, useValue: translateServiceStub as Partial<TranslateService> },
      ],
    });
  });

  it("should create", () => {
    const fixture = TestBed.createComponent(HomeComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should load locations and initialize visibleLocations", async () => {
    vi.useFakeTimers();

    housingServiceStub.getAllHousingLocations.mockResolvedValueOnce([
      { id: 1, name: "A", city: "Taipei", state: "TW" },
      { id: 2, name: "B", city: "Taipei", state: "TW" },
      { id: 3, name: "C", city: "Tainan", state: "TW" },
      { id: 4, name: "D", city: "Kaohsiung", state: "TW" },
      { id: 5, name: "E", city: "Kaohsiung", state: "TW" },
      { id: 6, name: "F", city: "Taichung", state: "TW" },
    ] as any);

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;

    expect(component.housingLocationList.length).toBe(6);
    expect(component.filteredList.length).toBe(6);
    expect(component.cityList.sort()).toEqual(
      ["Taipei", "Tainan", "Kaohsiung", "Taichung"].sort()
    );

    vi.advanceTimersByTime(600);
    expect(component.visibleLocations.length).toBe(5);
    expect(component.hasMore).toBe(true);

    vi.useRealTimers();
  });

  it("should filter results by text and reset visibleLocations", () => {
    vi.useFakeTimers();

    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.housingLocationList = [
      { id: 1, name: "Alpha", city: "Taipei", state: "TW" },
      { id: 2, name: "Beta", city: "Kaohsiung", state: "TW" },
      { id: 3, name: "Gamma", city: "Taipei", state: "TW" },
    ] as any;
    component.filteredList = component.housingLocationList;

    component.filterResults("tai");
    expect(component.filteredList.length).toBe(2);

    vi.advanceTimersByTime(600);
    expect(component.visibleLocations.length).toBe(2);
    expect(component.hasMore).toBe(false);
    expect(component.dataSource.data.length).toBe(2);

    vi.useRealTimers();
  });

  it("should search by name and update table datasource", () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.housingLocationList = [
      { id: 1, name: "Sunny Home", city: "Taipei", state: "TW" },
      { id: 2, name: "Cloud House", city: "Tainan", state: "TW" },
    ] as any;
    component.dataSource.data = component.housingLocationList;

    component.nameControl.setValue("sun");
    component.searchByName();
    expect(component.dataSource.data.length).toBe(1);

    component.nameControl.setValue("");
    component.searchByName();
    expect(component.dataSource.data.length).toBe(2);
  });

  it("should filter by city selection and reset visibleLocations", () => {
    vi.useFakeTimers();

    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.housingLocationList = [
      { id: 1, name: "A", city: "Taipei", state: "TW" },
      { id: 2, name: "B", city: "Tainan", state: "TW" },
      { id: 3, name: "C", city: "Taipei", state: "TW" },
      { id: 4, name: "D", city: "Kaohsiung", state: "TW" },
      { id: 5, name: "E", city: "Taipei", state: "TW" },
      { id: 6, name: "F", city: "Taichung", state: "TW" },
    ] as any;
    component.filteredList = component.housingLocationList;

    component.onCitySelect("Taipei");

    expect(component.filteredList.length).toBe(3);
    expect(component.dataSource.data.length).toBe(3);

    vi.advanceTimersByTime(600);
    expect(component.visibleLocations.length).toBe(3);
    expect(component.hasMore).toBe(false);

    vi.useRealTimers();
  });

  it("should debounce onSearch and call filterResults after 1000ms", () => {
    vi.useFakeTimers();

    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    const filterSpy = vi.spyOn(component, "filterResults");
    component.ngOnInit();

    component.onSearch({ target: { value: "tai" } } as any);
    vi.advanceTimersByTime(999);
    expect(filterSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(filterSpy).toHaveBeenCalledWith("tai");

    component.ngOnDestroy();
    filterSpy.mockRestore();
    vi.useRealTimers();
  });

  it("should not re-filter for the same search text (distinctUntilChanged)", () => {
    vi.useFakeTimers();

    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    const filterSpy = vi.spyOn(component, "filterResults");
    component.ngOnInit();

    component.onSearch({ target: { value: "tai" } } as any);
    vi.advanceTimersByTime(1000);
    expect(filterSpy).toHaveBeenCalledTimes(1);

    component.onSearch({ target: { value: "tai" } } as any);
    vi.advanceTimersByTime(1000);
    expect(filterSpy).toHaveBeenCalledTimes(1);

    component.onSearch({ target: { value: "tpe" } } as any);
    vi.advanceTimersByTime(1000);
    expect(filterSpy).toHaveBeenCalledTimes(2);

    component.ngOnDestroy();
    filterSpy.mockRestore();
    vi.useRealTimers();
  });

  it("should switch language via TranslateService", () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.switchLanguage("en");
    expect(translateServiceStub.use).toHaveBeenCalledWith("en");
  });

  it("should load more items when scrolled to bottom", () => {
    vi.useFakeTimers();

    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    (component as any).batchSize = 2;
    component.filteredList = [
      { id: 1, name: "A", city: "X", state: "TW" },
      { id: 2, name: "B", city: "X", state: "TW" },
      { id: 3, name: "C", city: "X", state: "TW" },
    ] as any;
    component.visibleLocations = [];
    (component as any).currentIndex = 0;
    component.isLoading = false;
    component.hasMore = true;

    Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 1000, configurable: true });
    Object.defineProperty(document.body, "offsetHeight", { value: 1998, configurable: true });

    component.onScroll();
    vi.advanceTimersByTime(600);

    expect(component.visibleLocations.length).toBe(2);
    expect(component.hasMore).toBe(true);

    vi.useRealTimers();
  });

  it("should reorder and re-sort data on drop when sort is active", () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    component.dataSource.data = [
      { id: 1, availableUnits: 1, name: "A" },
      { id: 2, availableUnits: 1, name: "B" },
      { id: 3, availableUnits: 1, name: "C" },
    ] as any;

    component.sort = { active: "id", direction: "asc" } as any;
    component.dataSource.sortingDataAccessor = (item: any, property: string) => {
      if (property === "id") return Number(item.id);
      return item[property];
    };

    component.drop({ previousIndex: 0, currentIndex: 2 } as any);
    expect(component.dataSource.data.map((x: any) => x.id)).toEqual([1, 2, 3]);
  });
});
