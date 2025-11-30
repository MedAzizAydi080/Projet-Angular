import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tndCurrency',
  standalone: true,
})
export class TndCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    // Format to 2 decimal places and append " D"
    return `${value.toFixed(2)} D`;
  }
}
