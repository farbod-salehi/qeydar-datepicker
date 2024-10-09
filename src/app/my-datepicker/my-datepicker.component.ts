import { Component, ElementRef, HostListener, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup } from '@angular/forms';
import { slideMotion } from './animation/slide';

@Component({
  selector: 'app-date-picker',
  template: `
     <div class="date-picker-wrapper" [formGroup]="form">
      <input
        type="text"
        formControlName="dateInput"
        (click)="toggleDatePicker()"
        [class.focus]="isOpen"
        [placeholder]="getPlaceholder()"
      >
      <app-date-picker-popup
        *ngIf="isOpen"
        [rtl]="rtl"
        [@slideMotion]="'enter'"
        [selectedDate]="selectedDate"
        [selectedStartDate]="selectedStartDate"
        [selectedEndDate]="selectedEndDate"
        [mode]="mode"
        [customLabels]="customLabels"
        (dateSelected)="onDateSelected($event)"
        (dateRangeSelected)="onDateRangeSelected($event)"
      ></app-date-picker-popup>
    </div>
  `,
  styles: [`
    :host.my-datepicker ::ng-deep {
      display: block;
      max-width: fit-content;
    }
    .date-picker-wrapper {
      position: relative;
      max-width: fit-content;
    }
    input {
      font-family: 'vazirmatn';
      width: 100%;
      max-width: 300px;
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 14px;
      transition: all 0.3s;
    }
    input:hover {
      border-color: #40a9ff;
    }
    input.focus {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24,144,255,0.2);
      outline: none;
    }
  `],
  host: {
    "[class.my-datepicker]": "true"
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ],
  animations: [slideMotion]
})
export class DatePickerComponent implements ControlValueAccessor, OnInit {
  @Input() rtl = false;
  @Input() mode: 'day' | 'month' | 'year' | 'range' = 'day';
  @Input() format = 'YYYY/MM/DD';
  @Input() customLabels: { label: string, value: Date }[] = [];

  isOpen = false;
  selectedDate: Date | null = null;
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  form: FormGroup;

  constructor(private elementRef: ElementRef, private fb: FormBuilder) {
    this.form = this.fb.group({
      dateInput: ['']
    });
  }

  ngOnInit() {
    this.form.get('dateInput')?.valueChanges.subscribe(value => {
      const date = this.parseDate(value);
      if (date) {
        this.selectedDate = date;
        this.onChange(this.mode === 'range' ? { start: date, end: date } : date);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDatePicker() {
    this.isOpen = !this.isOpen;
  }

  onDateSelected(date: Date) {
    this.selectedDate = date;
    this.updateInputValue();
    this.isOpen = false;
    this.onChange(date);
  }

  onDateRangeSelected(dateRange: { start: Date, end: Date }) {
    this.selectedStartDate = dateRange.start;
    this.selectedEndDate = dateRange.end;
    this.updateInputValue();
    this.isOpen = false;
    this.onChange(dateRange);
  }

  updateInputValue() {
    const formatDate = (date: Date) => {
      let result = this.format;
      result = result.replace('YYYY', date.getFullYear().toString());
      result = result.replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'));
      result = result.replace('DD', date.getDate().toString().padStart(2, '0'));
      return result;
    };

    if (this.mode === 'range' && this.selectedStartDate && this.selectedEndDate) {
      this.form.get('dateInput')?.setValue(`${formatDate(this.selectedStartDate)} - ${formatDate(this.selectedEndDate)}`);
    } else if (this.selectedDate) {
      this.form.get('dateInput')?.setValue(formatDate(this.selectedDate));
    }
  }

  parseDate(dateString: string): Date | null {
    const parts = dateString.split('/');
    if (parts.length >= 2) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parts.length > 2 ? parseInt(parts[2]) : 1;
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return null;
  }

  getPlaceholder(): string {
    switch (this.mode) {
      case 'day':
        return 'Select date';
      case 'month':
        return 'Select month';
      case 'year':
        return 'Select year';
      case 'range':
        return 'Select date range';
      default:
        return 'Select date';
    }
  }

  // ControlValueAccessor methods
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: any): void {
    if (value) {
      if (this.mode === 'range' && value.start && value.end) {
        this.selectedStartDate = new Date(value.start);
        this.selectedEndDate = new Date(value.end);
      } else if (this.mode !== 'range') {
        this.selectedDate = new Date(value);
      }
      this.updateInputValue();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
}