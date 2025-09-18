import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstName',
  standalone: true
})
export class FirstNamePipe implements PipeTransform {
  transform(fullName: string): string {
    if (!fullName) return '';
    const first = fullName.split(' ')[0];
    return first.toUpperCase(); 
  }
}
