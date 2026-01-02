import { Component, inject, signal, computed, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HousingService } from '../housing.service';
import { HousingLocation } from '../housinglocation';

@Component({
  selector: 'app-signal-form',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './signal-form.component.html',
  styleUrls: ['./signal-form.component.css'],
})
export class SignalFormComponent {
  private route = inject(ActivatedRoute);
  private housingService = inject(HousingService);

  // 房屋資料（Signal）
  housingLocation = signal<HousingLocation | undefined>(undefined);

  // Signal Form State
  form = signal({
    firstName: '',
    lastName: '',
    email: '',
  });

  constructor() {
    const id = parseInt(this.route.snapshot.params['id'], 10);

    this.housingService
      .getHousingLocationById(id)
      .then((location) => this.housingLocation.set(location));
  }

  // 更新欄位
  updateField(field: string, value: string) {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  // 驗證
  isValid = computed(() => {
    const f = this.form();
    return (
      f.firstName.trim() !== '' &&
      f.lastName.trim() !== '' &&
      f.email.includes('@')
    );
  });

  // 送出表單（整合 json-server）
  async submit() {
    if (!this.isValid()) {
      alert('請確認表單內容正確');
      return;
    }

    const data = this.form();
    await this.housingService.submitApplication(
      data.firstName,
      data.lastName,
      data.email
    );

    alert('Signal Form 資料已成功送出！');

    // 清空 signal form
    this.form.set({
      firstName: '',
      lastName: '',
      email: '',
    });
  }
}
