import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
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

// CDK Drag & Drop
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from "@angular/cdk/drag-drop";

// Pipe
import { FirstNamePipe } from "../first-name.pipe";

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
  ],
  template: `
    <section>
      <form class="search-bar">
        <!-- 共用輸入框搜尋 -->
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

    <!-- ✅ Tabs -->
    <mat-tab-group>
      <!-- Tab 1: 卡片模式 -->
      <mat-tab label="卡片模式">
        <section class="results">
          <app-housing-location
            *ngFor="let housingLocation of dataSource.data"
            [housingLocation]="housingLocation"
          ></app-housing-location>
        </section>
      </mat-tab>

      <!-- Tab 2: 表格模式 -->
      <mat-tab label="表格模式">
        <!--  Autocomplete + 搜尋按鈕 -->
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

        <!-- Table -->
        <table
          mat-table
          [dataSource]="dataSource"
          matSort
          cdkDropList
          (cdkDropListDropped)="drop($event)"
          class="mat-elevation-z8"
        >
          <!-- ID -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let element">{{ element.id }}</td>
          </ng-container>

          <!-- Name -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let element">{{ element.name }}</td>
          </ng-container>

          <!-- City -->
          <ng-container matColumnDef="city">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>City</th>
            <td mat-cell *matCellDef="let element">{{ element.city }}</td>
          </ng-container>

          <!-- State -->
          <ng-container matColumnDef="state">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>State</th>
            <td mat-cell *matCellDef="let element">{{ element.state }}</td>
          </ng-container>

          <!-- Units -->
          <ng-container matColumnDef="availableUnits">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Units</th>
            <td mat-cell *matCellDef="let element">
              {{ element.availableUnits }}
            </td>
          </ng-container>

          <!-- Wifi -->
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

          <!-- Laundry -->
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

          <!-- Header & Row -->
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            cdkDrag
          ></tr>
        </table>
      </mat-tab>
    </mat-tab-group>
  `,
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  housingLocationList: HousingLocation[] = [];
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

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild(MatSort) sort!: MatSort;

  // 🔑 Autocomplete 控制
  nameControl = new FormControl("");
  filteredOptions!: Observable<string[]>;

  constructor() {
    this.housingService
      .getAllHousingLocations()
      .then((housingLocationList: HousingLocation[]) => {
        this.housingLocationList = housingLocationList;
        this.dataSource.data = housingLocationList;
        this.cityList = [...new Set(housingLocationList.map((h) => h.city))];
      });
  }

  ngOnInit() {
    // 原本輸入框搜尋
    this.searchSubject
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((text) => {
        this.filterResults(text);
      });

    // Autocomplete 過濾邏輯
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

    // 確保數字用數字排序
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
      this.dataSource.data = this.housingLocationList;
    } else {
      this.dataSource.data = this.housingLocationList.filter(
        (h) => h.city === city
      );
    }
  }

  filterResults(text: string) {
    if (!text) {
      this.dataSource.data = this.housingLocationList;
      return;
    }
    const lowerText = text.toLowerCase();

    this.dataSource.data = this.housingLocationList.filter(
      (h) =>
        h.name.toLowerCase().includes(lowerText) || // 名稱
        h.city.toLowerCase().includes(lowerText) || // 城市
        h.state.toLowerCase().includes(lowerText) // 區域
    );
  }

  // 拖曳
  drop(event: CdkDragDrop<HousingLocation[]>) {
    const data = this.dataSource.data.slice();
    moveItemInArray(data, event.previousIndex, event.currentIndex);
    this.dataSource.data = data;

    // 拖曳後如果有排序狀態，立刻重新套用排序
    if (this.sort.active && this.sort.direction) {
      this.dataSource.data = this.dataSource.sortData(
        this.dataSource.data.slice(),
        this.sort
      );
    }
  }
}
