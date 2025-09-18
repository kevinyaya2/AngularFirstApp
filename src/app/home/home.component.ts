import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HousingLocationComponent } from '../housing-location/housing-location.component';
import { HousingLocation } from '../housinglocation';
import { HousingService } from '../housing.service';

// Angular Material standalone imports
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
        <input type="text" placeholder="Filter by city" #filter />
        <button class="primary" type="button" (click)="filterResults(filter.value)">Search</button>
        <button mat-raised-button color="primary" type="button" (click)="toggleView()">
          {{ isTableView ? '卡片模式' : '表格模式' }}
        </button>
      </form>
    </section>

    <!-- Table View -->
    <section *ngIf="isTableView; else cardView">
      <table mat-table [dataSource]="filteredLocationList" class="mat-elevation-z8">

        <!-- FirstName Column -->
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

    <!-- Card View -->
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
export class HomeComponent {
  housingLocationList: HousingLocation[] = [];
  filteredLocationList: HousingLocation[] = [];
  housingService: HousingService = inject(HousingService);

  isTableView = false;
  displayedColumns: string[] = ['firstName'];

  constructor() {
    this.housingService.getAllHousingLocations().then((housingLocationList: HousingLocation[]) => {
      this.housingLocationList = housingLocationList;
      this.filteredLocationList = housingLocationList;
    });
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
