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
      direction: ltr;
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
      if (typeof value === 'string') {
        const date = this.dateAdapter.parse(value, this.format);
        if (date) {
          if (this.mode === 'range') {
            // Assume the input is in the format "start - end"
            const [start, end] = value.split(' - ').map(d => this.dateAdapter.parse(d.trim(), this.format));
            if (start && end) {
              this.selectedStartDate = start;
              this.selectedEndDate = end;
              this.onChange({ start, end });
            }
          } else {
            this.selectedDate = date;
            this.onChange(date);
          }
        }
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
    const formattedDate = this.dateAdapter.format(date, this.format);
    this.form.get('dateInput')?.setValue(formattedDate);
    this.onChange(formattedDate);
    this.isOpen = false;
  }

  onDateRangeSelected(dateRange: { start: Date, end: Date }) {
    const format = this.format;
    const formattedStart = this.dateAdapter.format(dateRange.start, format);
    const formattedEnd = this.dateAdapter.format(dateRange.end, format);
    const formattedRange = `${formattedStart} - ${formattedEnd}`;
    this.form.get('dateInput')?.setValue(formattedRange);
    this.onChange(formattedRange);
    this.isOpen = false;
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
    // if (value) {
    //   if (this.mode === 'range' && typeof value === 'object' && value.start && value.end) {
    //     const start = this.dateAdapter.parse(value.start, this.format);
    //     const end = this.dateAdapter.parse(value.end, this.format);
    //     if (start && end) {
    //       this.selectedStartDate = start;
    //       this.selectedEndDate = end;
    //       this.updateInputValue();
    //     }
    //   } else if (this.mode !== 'range') {
    //     const date = this.dateAdapter.parse(value, this.format);
    //     if (date) {
    //       this.selectedDate = date;
    //       this.updateInputValue();
    //     }
    //   }
    // } else {
    //   this.selectedDate = null;
    //   this.selectedStartDate = null;
    //   this.selectedEndDate = null;
    //   this.form.get('dateInput')?.setValue('');
    // }
    if (value) {
      if (this.mode === 'range' && typeof value === 'object' && value.start && value.end) {
        const format = this.format;
        const formattedStart = this.dateAdapter.format(this.dateAdapter.parse(value.start, format), format);
        const formattedEnd = this.dateAdapter.format(this.dateAdapter.parse(value.end, format), format);
        const formattedRange = `${formattedStart} - ${formattedEnd}`;
        this.form.get('dateInput')?.setValue(formattedRange);
      } else if (this.mode !== 'range') {
        const format = this.format;
        const formattedDate = this.dateAdapter.format(this.dateAdapter.parse(value, format), format);
        this.form.get('dateInput')?.setValue(formattedDate);
      }
    } else {
      this.form.get('dateInput')?.setValue('');
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
}