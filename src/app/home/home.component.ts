import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { HousingLocation } from '../housinglocation';
import { HousingService } from '../housing.service';

// Angular Material
import {
  MatTable,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatCell,
  MatCellDef,
  MatRow,
  MatRowDef,
  MatColumnDef
} from '@angular/material/table';
import { MatButton } from '@angular/material/button';

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
    MatTable,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatCell,
    MatCellDef,
    MatRow,
    MatRowDef,
    MatColumnDef,
    MatButton,
    FirstNamePipe
  ],
  template: `
    <section>
      <form class="search-bar">
        <!-- 傳整個 $event 進來，TS 再轉換 -->
        <input 
          type="text" 
          placeholder="Filter by city" 
          (input)="onSearch($event)" />
        
        <button mat-raised-button color="primary" type="button" (click)="toggleView()">
          {{ isTableView ? '卡片模式' : '表格模式' }}
        </button>
      </form>
    </section>

    <!-- 表格模式 -->
    <section *ngIf="isTableView; else cardView">
      <table mat-table [dataSource]="filteredLocationList" class="mat-elevation-z8">
        <ng-container matColumnDef="firstName">
          <th mat-header-cell *matHeaderCellDef> First Name </th>
          <td mat-cell *matCellDef="let element">
            {{ element.name | firstName }}
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </section>

    <!-- 卡片模式 -->
    <ng-template #cardView>
      <section class="results">
        <app-housing-location
          *ngFor="let housingLocation of filteredLocationList"
          [housingLocation]="housingLocation"
        ></app-housing-location>
      </section>
    </ng-template>
  `,
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  housingLocationList: HousingLocation[] = [];
  filteredLocationList: HousingLocation[] = [];
  housingService: HousingService = inject(HousingService);

  isTableView = false;
  displayedColumns: string[] = ['firstName'];

  // RxJS
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    this.housingService.getAllHousingLocations().then((housingLocationList: HousingLocation[]) => {
      this.housingLocationList = housingLocationList;
      this.filteredLocationList = housingLocationList;
    });
  }

  ngOnInit() {
    this.searchSubject
      .pipe(
        debounceTime(1000), // 等待輸入停止 1 秒
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((text) => {
        this.filterResults(text);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 從 template 接到 $event
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  filterResults(text: string) {
    if (!text) {
      this.filteredLocationList = this.housingLocationList;
      return;
    }
    this.filteredLocationList = this.housingLocationList.filter((housingLocation) =>
      housingLocation?.city.toLowerCase().includes(text.toLowerCase())
    );
  }

  toggleView() {
    this.isTableView = !this.isTableView;
  }
}
