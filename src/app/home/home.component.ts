import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  HostListener,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { HousingLocationComponent } from "../housing-location/housing-location.component";
import { HousingLocation } from "../housinglocation";
import { HousingService } from "../housing.service";

// Angular Material
import { MatTableModule, MatTableDataSource } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTabsModule } from "@angular/material/tabs";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

// CDK Drag & Drop
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from "@angular/cdk/drag-drop";

// Forms / RxJS
import {
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from "@angular/forms";
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  Observable,
  map,
  startWith,
} from "rxjs";

// Google Maps
import { GoogleMapsModule } from "@angular/google-maps";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    CommonModule,
    HousingLocationComponent,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSortModule,
    DragDropModule,
    MatTabsModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <section>
      <form class="search-bar">
        <input
          type="text"
          placeholder="旅館名稱 / 城市 / 區域"
          (input)="onSearch($event)"
        />

        <mat-form-field appearance="outline" class="custom-select-field">
          <mat-label>選擇縣市</mat-label>
          <mat-select (selectionChange)="onCitySelect($event.value)">
            <mat-option value="">全部</mat-option>
            <mat-option *ngFor="let city of cityList" [value]="city">
              {{ city }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </section>

    <!-- Tabs -->
    <mat-tab-group>
      <!-- 卡片模式 (滾動載入) -->
      <mat-tab label="卡片模式">
        <section class="results">
          <app-housing-location
            *ngFor="let housingLocation of visibleLocations"
            [housingLocation]="housingLocation"
          ></app-housing-location>
        </section>

        <!-- 載入中 spinner -->
        <div *ngIf="isLoading" class="spinner-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      </mat-tab>

      <!-- 表格模式 -->
      <mat-tab label="表格模式">
        <div class="search-row">
          <mat-form-field appearance="outline" class="custom-select-field">
            <input
              type="text"
              placeholder="輸入旅館名稱"
              matInput
              [formControl]="nameControl"
              [matAutocomplete]="auto"
            />
            <mat-autocomplete #auto="matAutocomplete">
              <mat-option
                *ngFor="let option of filteredOptions | async"
                [value]="option"
              >
                {{ option }}
              </mat-option>
            </mat-autocomplete>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="searchByName()">
            搜尋
          </button>
        </div>

        <table
          mat-table
          [dataSource]="dataSource"
          matSort
          cdkDropList
          (cdkDropListDropped)="drop($event)"
          class="mat-elevation-z8"
        >
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let element">{{ element.id }}</td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let element">{{ element.name }}</td>
          </ng-container>

          <ng-container matColumnDef="city">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>City</th>
            <td mat-cell *matCellDef="let element">{{ element.city }}</td>
          </ng-container>

          <ng-container matColumnDef="state">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>State</th>
            <td mat-cell *matCellDef="let element">{{ element.state }}</td>
          </ng-container>

          <ng-container matColumnDef="availableUnits">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Units</th>
            <td mat-cell *matCellDef="let element">
              {{ element.availableUnits }}
            </td>
          </ng-container>

          <ng-container matColumnDef="wifi">
            <th mat-header-cell *matHeaderCellDef>Wifi</th>
            <td mat-cell *matCellDef="let element">
              <i
                class="bi"
                [ngClass]="
                  element.wifi
                    ? 'bi-check-circle-fill text-success'
                    : 'bi-x-circle-fill text-danger'
                "
              ></i>
            </td>
          </ng-container>

          <ng-container matColumnDef="laundry">
            <th mat-header-cell *matHeaderCellDef>Laundry</th>
            <td mat-cell *matCellDef="let element">
              <i
                class="bi"
                [ngClass]="
                  element.laundry
                    ? 'bi-check-circle-fill text-success'
                    : 'bi-x-circle-fill text-danger'
                "
              ></i>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            cdkDrag
          ></tr>
        </table>
      </mat-tab>

      <!-- 地圖模式 -->
      <mat-tab label="地圖模式">
        <google-map
          height="500px"
          width="100%"
          [center]="mapCenter"
          [zoom]="7"
        >
          <map-marker
            *ngFor="let h of housingLocationList"
            [position]="{ lat: h.latitude!, lng: h.longitude! }"
            [title]="h.name"
          ></map-marker>
        </google-map>
      </mat-tab>
    </mat-tab-group>
  `,
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  housingLocationList: HousingLocation[] = [];
  filteredList: HousingLocation[] = [];
  visibleLocations: HousingLocation[] = []; // 分批顯示
  dataSource = new MatTableDataSource<HousingLocation>([]);
  housingService: HousingService = inject(HousingService);

  displayedColumns: string[] = [
    "id",
    "name",
    "city",
    "state",
    "availableUnits",
    "wifi",
    "laundry",
  ];
  cityList: string[] = [];

  // 分批載入控制
  private batchSize = 5;
  private currentIndex = 0;
  isLoading = false;
  hasMore = true;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild(MatSort) sort!: MatSort;

  // Autocomplete
  nameControl = new FormControl("");
  filteredOptions!: Observable<string[]>;

  // Google Map
  mapCenter = { lat: 23.6978, lng: 120.9605 }; // 台灣中心

  constructor() {
    this.housingService
      .getAllHousingLocations()
      .then((housingLocationList: HousingLocation[]) => {
        this.housingLocationList = housingLocationList;
        this.filteredList = housingLocationList;
        this.cityList = [...new Set(housingLocationList.map((h) => h.city))];
        this.loadMore(); // 先載入第一批
        this.dataSource.data = housingLocationList; // 表格模式用全量
      });
  }

  ngOnInit() {
    this.searchSubject
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((text) => {
        this.filterResults(text);
      });

    this.filteredOptions = this.nameControl.valueChanges.pipe(
      startWith(""),
      map((value) => this._filter(value || ""))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.housingLocationList
      .map((h) => h.name)
      .filter((option) => option.toLowerCase().includes(filterValue));
  }

  searchByName() {
    const keyword = this.nameControl.value?.toLowerCase() || "";
    if (!keyword) {
      this.dataSource.data = this.housingLocationList;
      return;
    }
    this.dataSource.data = this.housingLocationList.filter((h) =>
      h.name.toLowerCase().includes(keyword)
    );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case "id":
          return Number(item.id);
        case "availableUnits":
          return Number(item.availableUnits);
        default:
          return (item as any)[property];
      }
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onCitySelect(city: string) {
  if (!city) {
    this.filteredList = this.housingLocationList;
  } else {
    this.filteredList = this.housingLocationList.filter((h) => h.city === city);
  }
  this.resetAndLoad(); // 重置卡片模式
  this.dataSource.data = this.filteredList; // 表格模式
}


  filterResults(text: string) {
  if (!text) {
    this.filteredList = this.housingLocationList;
  } else {
    const lowerText = text.toLowerCase();
    this.filteredList = this.housingLocationList.filter(
      (h) =>
        h.name.toLowerCase().includes(lowerText) ||
        h.city.toLowerCase().includes(lowerText) ||
        h.state.toLowerCase().includes(lowerText)
    );
  }
  this.resetAndLoad(); // 重置卡片模式
  this.dataSource.data = this.filteredList; // 表格模式
}

  

  // 分批載入
  @HostListener("window:scroll", [])
  onScroll(): void {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 2
    ) {
      this.loadMore();
    }
  }

  private loadMore() {
  if (this.isLoading || !this.hasMore) return;

  this.isLoading = true;

  setTimeout(() => {
    const next = this.filteredList.slice(
      this.currentIndex,
      this.currentIndex + this.batchSize
    );

    this.visibleLocations.push(...next);
    this.currentIndex += this.batchSize;

    if (this.currentIndex >= this.filteredList.length) {
      this.hasMore = false;
    }

    this.isLoading = false;
  }, 600);
}

  // 當搜尋或篩選時，要重置
private resetAndLoad() {
  this.visibleLocations = [];
  this.currentIndex = 0;
  this.hasMore = true;
  this.loadMore();
}

  // 拖曳
  drop(event: CdkDragDrop<HousingLocation[]>) {
    const data = this.dataSource.data.slice();
    moveItemInArray(data, event.previousIndex, event.currentIndex);
    this.dataSource.data = data;
    if (this.sort.active && this.sort.direction) {
      this.dataSource.data = this.dataSource.sortData(
        this.dataSource.data.slice(),
        this.sort
      );
    }
  }
}
