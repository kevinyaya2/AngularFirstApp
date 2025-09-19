import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HousingService } from '../housing.service';
import { HousingLocation } from '../housinglocation';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-details-template',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './details-template.component.html',
  styleUrls: ['./details-template.component.css'],
})
export class DetailsTemplateComponent {
  // 注入
  route = inject(ActivatedRoute);
  housingService = inject(HousingService);

  // 資料
  housingLocation: HousingLocation | undefined;

  // 表單欄位（ngModel 綁定）
  firstName = '';
  lastName = '';
  email = '';

  constructor() {
    // 透過網址 /details-template/:id 抓取 ID
    const housingLocationId = parseInt(this.route.snapshot.params['id'], 10);
    this.housingService.getHousingLocationById(housingLocationId).then((housingLocation) => {
      this.housingLocation = housingLocation;
    });
  }

  // 表單送出
  submitApplication(form: any) {
    if (form.valid) {
      this.housingService.submitApplication(this.firstName, this.lastName, this.email);
      alert('Template-Driven 資料已送出!');
      form.reset();
    }
  }
}
