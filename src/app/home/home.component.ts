import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { HousingLocation } from '../housinglocation';
import { HousingService } from '../housing.service';

// Angular Material
import {
  MatTableModule,
  MatTableDataSource
} from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';

// CDK Drag & Drop
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// Pipe
import { FirstNamePipe } from '../first-name.pipe';

// RxJS
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-home',
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
    FirstNamePipe
  ],
  template: `
    <section>
      <form class="search-bar">
        <!-- 輸入框搜尋 -->
        <input 
          type="text" 
          placeholder="旅館名稱 / 城市 / 區域" 
          (input)="onSearch($event)" />

          <mat-form-field class="custom-select">
          <mat-select (selectionChange)="onCitySelect($event.value)" placeholder="選擇縣市">
          <mat-option value="">全部</mat-option>
          <mat-option *ngFor="let city of cityList" [value]="city">{{ city }}</mat-option>
          </mat-select>
          </mat-form-field>




        <button mat-raised-button color="primary" type="button" (click)="toggleView()">
          {{ isTableView ? '卡片模式' : '表格模式' }}
        </button>
      </form>
    </section>

    <!-- 表格模式 -->
    <section *ngIf="isTableView; else cardView">
      <table mat-table 
             [dataSource]="dataSource" 
             matSort 
             cdkDropList 
             (cdkDropListDropped)="drop($event)" 
             class="mat-elevation-z8">

        <!-- ID -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
          <td mat-cell *matCellDef="let element">{{ element.id }}</td>
        </ng-container>

        <!-- Name -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Name </th>
          <td mat-cell *matCellDef="let element">{{ element.name }}</td>
        </ng-container>

        <!-- FirstName (Pipe) -->
        <ng-container matColumnDef="firstName">
          <th mat-header-cell *matHeaderCellDef> First Name </th>
          <td mat-cell *matCellDef="let element">{{ element.name | firstName }}</td>
        </ng-container>

        <!-- City -->
        <ng-container matColumnDef="city">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> City </th>
          <td mat-cell *matCellDef="let element">{{ element.city }}</td>
        </ng-container>

        <!-- State -->
        <ng-container matColumnDef="state">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> State </th>
          <td mat-cell *matCellDef="let element">{{ element.state }}</td>
        </ng-container>

        <!-- Units -->
        <ng-container matColumnDef="availableUnits">
          <th mat-header-cell *matHeaderCellDef mat-sort-header> Units </th>
          <td mat-cell *matCellDef="let element">{{ element.availableUnits }}</td>
        </ng-container>

        <!-- Wifi -->
        <ng-container matColumnDef="wifi">
          <th mat-header-cell *matHeaderCellDef> Wifi </th>
          <td mat-cell *matCellDef="let element">
            <i class="bi" [ngClass]="element.wifi ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'"></i>
          </td>
        </ng-container>

        <!-- Laundry -->
        <ng-container matColumnDef="laundry">
          <th mat-header-cell *matHeaderCellDef> Laundry </th>
          <td mat-cell *matCellDef="let element">
            <i class="bi" [ngClass]="element.laundry ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'"></i>
          </td>
        </ng-container>

        <!-- Header & Row -->
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row 
            *matRowDef="let row; columns: displayedColumns;" 
            cdkDrag>
        </tr>
      </table>
    </section>

    <!-- 卡片模式 -->
    <ng-template #cardView>
      <section class="results">
        <app-housing-location
          *ngFor="let housingLocation of dataSource.data"
          [housingLocation]="housingLocation"
        ></app-housing-location>
      </section>
    </ng-template>
  `,
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  housingLocationList: HousingLocation[] = [];
  dataSource = new MatTableDataSource<HousingLocation>([]);
  housingService: HousingService = inject(HousingService);

  isTableView = false;
  displayedColumns: string[] = [
    'id', 'name', 'firstName', 'city', 'state', 
    'availableUnits', 'wifi', 'laundry'
  ];

  cityList: string[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.housingService.getAllHousingLocations().then((housingLocationList: HousingLocation[]) => {
      this.housingLocationList = housingLocationList;
      this.dataSource.data = housingLocationList;
      this.cityList = [...new Set(housingLocationList.map(h => h.city))];
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
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;

    // 🔑 確保數字用數字排序
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'id': return Number(item.id);
        case 'availableUnits': return Number(item.availableUnits);
        default: return (item as any)[property];
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
      this.dataSource.data = this.housingLocationList.filter(h => h.city === city);
    }
  }

  filterResults(text: string) {
  if (!text) {
    this.dataSource.data = this.housingLocationList;
    return;
  }
  const lowerText = text.toLowerCase();

  this.dataSource.data = this.housingLocationList.filter((h) =>
    h.name.toLowerCase().includes(lowerText) ||   //  支援名稱
    h.city.toLowerCase().includes(lowerText) ||   //  支援城市
    h.state.toLowerCase().includes(lowerText)     //  支援區域
  );
}


  toggleView() {
    this.isTableView = !this.isTableView;
  }

  // 拖曳
  drop(event: CdkDragDrop<HousingLocation[]>) {
    const data = this.dataSource.data.slice();
    moveItemInArray(data, event.previousIndex, event.currentIndex);
    this.dataSource.data = data;

    //  拖曳後如果有排序狀態，立刻重新套用排序
    if (this.sort.active && this.sort.direction) {
      this.dataSource.data = this.dataSource.sortData(
        this.dataSource.data.slice(),
        this.sort
      );
    }
  }
}
