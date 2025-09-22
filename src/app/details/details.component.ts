import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HousingService } from '../housing.service';
import { HousingLocation } from '../housinglocation';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-details',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <article>
      <img
        class="listing-photo"
        [src]="housingLocation?.photo"
        alt="Exterior photo of {{ housingLocation?.name }}"
        crossorigin
      />
      <section class="listing-description">
        <h2 class="listing-heading">{{ housingLocation?.name }}</h2>
        <p class="listing-location">{{ housingLocation?.city }}, {{ housingLocation?.state }}</p>
      </section>

      <section class="listing-features">
        <h2 class="section-heading">About this housing location</h2>
        <ul>
          <li>Units available: {{ housingLocation?.availableUnits }}</li>
          <li>Does this location have wifi: {{ housingLocation?.wifi }}</li>
          <li>Does this location have laundry: {{ housingLocation?.laundry }}</li>
        </ul>
      </section>

      <!--  Google Map -->
      <section class="listing-map" *ngIf="mapUrl">
        <h2 class="section-heading">位置地圖</h2>
        <iframe
          width="100%"
          height="400"
          style="border:0"
          [src]="mapUrl"
          loading="lazy"
          allowfullscreen>
        </iframe>
      </section>

      <section class="listing-apply">
        <h2 class="section-heading">Apply now to live here</h2>
        <form [formGroup]="applyForm" (ngSubmit)="submitApplication()">
          <label for="first-name">First Name</label>
          <input id="first-name" type="text" formControlName="firstName" />
          <div *ngIf="applyForm.get('firstName')?.hasError('required') && applyForm.get('firstName')?.touched" class="error">
            First name is required
          </div>
          <div *ngIf="applyForm.get('firstName')?.hasError('duplicate')" class="error">
            This first name already exists
          </div>

          <label for="last-name">Last Name</label>
          <input id="last-name" type="text" formControlName="lastName" />
          <div *ngIf="applyForm.get('lastName')?.hasError('required') && applyForm.get('lastName')?.touched" class="error">
            Last name is required
          </div>

          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" />
          <div *ngIf="applyForm.get('email')?.hasError('required') && applyForm.get('email')?.touched" class="error">
            Email is required
          </div>
          <div *ngIf="applyForm.get('email')?.hasError('email') && applyForm.get('email')?.touched" class="error">
            Invalid email format
          </div>

          <button type="submit" class="primary" [disabled]="applyForm.invalid">Apply now</button>
        </form>
      </section>
    </article>
  `,
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  housingService = inject(HousingService);
  sanitizer: DomSanitizer = inject(DomSanitizer);

  housingLocation: HousingLocation | undefined;
  mapUrl?: SafeResourceUrl;

  applyForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor() {
    const housingLocationId = parseInt(this.route.snapshot.params['id'], 10);
    this.housingService.getHousingLocationById(housingLocationId).then((housingLocation) => {
      this.housingLocation = housingLocation;

      //  建立安全的 Google Map URL
      if (housingLocation?.latitude && housingLocation?.longitude) {
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://maps.google.com/maps?q=${housingLocation.latitude},${housingLocation.longitude}&hl=zh-TW&z=15&output=embed`
        );
      }
    });

    // firstName 即時檢查
    this.applyForm.get('firstName')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((value) => this.housingService.checkFirstNameExists(value ?? ''))
      )
      .subscribe((exists) => {
        if (exists) {
          this.applyForm.get('firstName')?.setErrors({ duplicate: true });
        } else {
          if (this.applyForm.get('firstName')?.hasError('duplicate')) {
            this.applyForm.get('firstName')?.setErrors(null);
          }
        }
      });
  }

  submitApplication() {
    if (this.applyForm.valid) {
      this.housingService.submitApplication(
        this.applyForm.value.firstName ?? '',
        this.applyForm.value.lastName ?? '',
        this.applyForm.value.email ?? ''
      );
      alert('資料已送出!');
      this.applyForm.reset();
    }
  }
}
