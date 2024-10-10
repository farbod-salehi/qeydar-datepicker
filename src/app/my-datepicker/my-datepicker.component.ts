import { Component, ElementRef, HostListener, forwardRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup } from '@angular/forms';
import { slideMotion } from './animation/slide';
import { DateAdapter, JalaliDateAdapter, GregorianDateAdapter } from './date-adapter';

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
        [calendarType]="calendarType"
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
export class DatePickerComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() rtl = false;
  @Input() mode: 'day' | 'month' | 'year' | 'range' = 'day';
  @Input() format = 'yyyy/MM/dd';
  @Input() customLabels: { label: string, value: Date }[] = [];
  @Input() calendarType: 'jalali' | 'georgian' = 'georgian';

  isOpen = false;
  selectedDate: Date | null = null;
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  form: FormGroup;
  dateAdapter: DateAdapter<Date>;

  constructor(private elementRef: ElementRef, private fb: FormBuilder) {
    this.form = this.fb.group({
      dateInput: ['']
    });
  }

  ngOnInit() {
    this.setDateAdapter();
    this.form.get('dateInput')?.valueChanges.subscribe(value => {
      const date = this.dateAdapter.parse(value, this.format);
      if (date) {
        this.selectedDate = date;
        this.onChange(this.mode === 'range' ? { start: date, end: date } : date);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['calendarType']) {
      this.setDateAdapter();
      this.updateInputValue();
    }
  }

  setDateAdapter() {
    this.dateAdapter = this.calendarType === 'jalali' ? new JalaliDateAdapter() : new GregorianDateAdapter();
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
    if (this.mode === 'range' && this.selectedStartDate && this.selectedEndDate) {
      this.form.get('dateInput')?.setValue(
        `${this.dateAdapter.format(this.selectedStartDate, this.format)} - ${this.dateAdapter.format(this.selectedEndDate, this.format)}`
      );
    } else if (this.selectedDate) {
      this.form.get('dateInput')?.setValue(this.dateAdapter.format(this.selectedDate, this.format));
    }
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
        this.selectedStartDate = this.dateAdapter.parse(value.start, this.format);
        this.selectedEndDate = this.dateAdapter.parse(value.end, this.format);
      } else if (this.mode !== 'range') {
        this.selectedDate = this.dateAdapter.parse(value, this.format);
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