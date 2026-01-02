import { Injectable, signal } from '@angular/core';
import { HousingLocation } from './housinglocation';

@Injectable({
  providedIn: 'root',
})
export class HousingService {
  url = 'http://localhost:3000/locations';
  appUrl = 'http://localhost:3000/applications';

  signalForms = signal<any[]>([]);

  constructor() {
    this.loadSignalForms();
  }

  async getAllHousingLocations(): Promise<HousingLocation[]> {
    const data = await fetch(this.url);
    return (await data.json()) ?? [];
  }

  async getHousingLocationById(id: number): Promise<HousingLocation | undefined> {
    const data = await fetch(`${this.url}/${id}`);
    return (await data.json()) ?? {};
  }

  async submitApplication(firstName: string, lastName: string, email: string) {
    const application = { firstName, lastName, email };
    await fetch(this.appUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(application),
    });
  }

  async checkFirstNameExists(firstName: string): Promise<boolean> {
    const response = await fetch(`${this.appUrl}?firstName=${firstName}`);
    const results = await response.json();
    return results.length > 0;
  }

  async loadSignalForms() {
    try {
      const res = await fetch(`${this.appUrl}`);
      const list = await res.json();
      this.signalForms.set(list);
    } catch (err) {
      console.error('Failed to load signal forms:', err);
    }
  }

  async submitSignalForm(data: { firstName: string; lastName: string; email: string }) {
    try {
      const res = await fetch(this.appUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const saved = await res.json();

      // 更新 signal
      this.signalForms.update((forms) => [...forms, saved]);

      return saved;
    } catch (err) {
      console.error('Failed to submit signal form:', err);
      throw err;
    }
  }
}
