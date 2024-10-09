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
        placeholder="Select date"
      >
      <app-date-picker-popup
        *ngIf="isOpen"
        [rtl]="rtl"
        [@slideMotion]="'enter'"
        [selectedDate]="selectedDate"
        [selectedStartDate]="selectedStartDate"
        [selectedEndDate]="selectedEndDate"
        [isRangeMode]="isRangeMode"
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
  @Input() isRangeMode = true;
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
        this.onChange(this.isRangeMode ? { start: date, end: date } : date);
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
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    if (this.isRangeMode && this.selectedStartDate && this.selectedEndDate) {
      this.form.get('dateInput')?.setValue(`${formatDate(this.selectedStartDate)} - ${formatDate(this.selectedEndDate)}`);
    } else if (this.selectedDate) {
      this.form.get('dateInput')?.setValue(formatDate(this.selectedDate));
    }
  }

  parseDate(dateString: string): Date | null {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const month = parseInt(parts[0]) - 1;
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    return null;
  }

  // ControlValueAccessor methods
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: any): void {
    if (value) {
      if (this.isRangeMode && value.start && value.end) {
        this.selectedStartDate = new Date(value.start);
        this.selectedEndDate = new Date(value.end);
      } else if (!this.isRangeMode) {
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