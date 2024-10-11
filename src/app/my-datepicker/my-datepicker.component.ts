import { Component, ElementRef, HostListener, forwardRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
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
        (blur)="onInputBlur()"
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
        [minDate]="minDate"
        [maxDate]="maxDate"
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
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;

  isOpen = false;
  selectedDate: Date | null = null;
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  form: FormGroup;
  dateAdapter: DateAdapter<Date>;
  private isInternalChange = false;

  constructor(private elementRef: ElementRef, private fb: FormBuilder) {
    this.form = this.fb.group({
      dateInput: ['', [this.dateFormatValidator.bind(this), this.dateRangeValidator.bind(this)]]
    });
  }

  ngOnInit() {
    this.setDateAdapter();
    this.form.get('dateInput')?.valueChanges.subscribe(value => {
      if (!this.isInternalChange && typeof value === 'string') {
        this.updateSelectedDates(value);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['calendarType']) {
      this.setDateAdapter();
      this.updateInputValue();
    }
    if (changes['minDate'] || changes['maxDate']) {
      this.form.get('dateInput')?.updateValueAndValidity();
    }
  }

  setDateAdapter() {
    this.dateAdapter = this.calendarType === 'jalali' ? new JalaliDateAdapter() : new GregorianDateAdapter();
  }

  updateSelectedDates(value: string) {
    const format = this.getFormatForMode();
    if (this.mode === 'range') {
      const [start, end] = value.split(' - ').map(d => this.dateAdapter.parse(d.trim(), format));
      if (start && end) {
        this.selectedStartDate = this.clampDate(start);
        this.selectedEndDate = this.clampDate(end);
        this.onChange(value);
      }
    } else {
      const date = this.dateAdapter.parse(value, format);
      if (date) {
        this.selectedDate = this.clampDate(date);
        this.onChange(this.dateAdapter.format(this.selectedDate, format));
      }
    }
  }

  onInputBlur() {
    const inputValue = this.form.get('dateInput')?.value;
    if (typeof inputValue === 'string') {
      const correctedValue = this.validateAndCorrectInput(inputValue);
      if (correctedValue !== inputValue) {
        this.isInternalChange = true;
        this.form.get('dateInput')?.setValue(correctedValue);
        this.updateSelectedDates(correctedValue);
        this.isInternalChange = false;
      }
    }
  }

  validateAndCorrectInput(value: string): string {
    const format = this.getFormatForMode();
    if (this.mode === 'range') {
      const [start, end] = value.split(' - ').map(d => d.trim());
      const correctedStart = this.validateAndCorrectSingleDate(start, format);
      const correctedEnd = this.validateAndCorrectSingleDate(end, format);
      return `${correctedStart} - ${correctedEnd}`;
    } else {
      return this.validateAndCorrectSingleDate(value, format);
    }
  }

  validateAndCorrectSingleDate(dateString: string, format: string): string {
    let date = this.dateAdapter.parse(dateString, format);
    if (!date) {
      // If the date is invalid, return today's date or minDate if today is before minDate
      const today = this.dateAdapter.today();
      date = this.minDate ? this.dateAdapter.max([today, this.minDate]) : today;
    } else {
      // Clamp the date to be within minDate and maxDate
      if (this.minDate && this.dateAdapter.isBefore(date, this.minDate)) {
        date = this.minDate;
      } else if (this.maxDate && this.dateAdapter.isAfter(date, this.maxDate)) {
        date = this.maxDate;
      }
    }
    return this.dateAdapter.format(date, format);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    console.log(event,!this.elementRef.nativeElement.contains(event.target),this.elementRef.nativeElement);
    
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDatePicker() {
    this.isOpen = !this.isOpen;
  }

  onDateSelected(date: Date) {
    const clampedDate = this.clampDate(date);
    this.selectedDate = clampedDate;
    const formattedDate = this.dateAdapter.format(clampedDate, this.getFormatForMode());
    this.isInternalChange = true;
    this.form.get('dateInput')?.setValue(formattedDate);
    this.isInternalChange = false;
    this.onChange(formattedDate);
    this.isOpen = false;
  }

  onDateRangeSelected(dateRange: { start: Date, end: Date }) {
    const format = this.getFormatForMode();
    this.selectedStartDate = this.clampDate(dateRange.start);
    this.selectedEndDate = this.clampDate(dateRange.end);
    const formattedStart = this.dateAdapter.format(this.selectedStartDate, format);
    const formattedEnd = this.dateAdapter.format(this.selectedEndDate, format);
    const formattedRange = `${formattedStart} - ${formattedEnd}`;
    this.isInternalChange = true;
    this.form.get('dateInput')?.setValue(formattedRange);
    this.isInternalChange = false;
    this.onChange(formattedRange);
    this.isOpen = false;
  }

  dateFormatValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const format = this.getFormatForMode();
    if (this.mode === 'range') {
      const [start, end] = value.split(' - ');
      return this.dateAdapter.isValidFormat(start.trim(), format) && 
            this.dateAdapter.isValidFormat(end.trim(), format) ? null : { invalidFormat: true };
    } else {
      return this.dateAdapter.isValidFormat(value, format) ? null : { invalidFormat: true };
    }
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const format = this.getFormatForMode();
    let dates: Date[];

    if (this.mode === 'range') {
      dates = value.split(' - ').map((d:string) => this.dateAdapter.parse(d.trim(), format));
    } else {
      dates = [this.dateAdapter.parse(value, format)];
    }

    for (const date of dates) {
      if (date) {
        if (this.minDate && this.dateAdapter.isBefore(date, this.minDate)) {
          return { minDate: { min: this.dateAdapter.format(this.minDate, format), actual: value } };
        }
        if (this.maxDate && this.dateAdapter.isAfter(date, this.maxDate)) {
          return { maxDate: { max: this.dateAdapter.format(this.maxDate, format), actual: value } };
        }
      }
    }

    return null;
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

  clampDate(date: Date): Date {
    if (this.minDate && this.dateAdapter.isBefore(date, this.minDate)) {
      return this.minDate;
    }
    if (this.maxDate && this.dateAdapter.isAfter(date, this.maxDate)) {
      return this.maxDate;
    }
    return date;
  }

  getFormatForMode(): string {
    switch (this.mode) {
      case 'year':
        return 'yyyy';
      case 'month':
        return 'yyyy/MM';
      case 'day':
      case 'range':
        return this.format;
      default:
        return this.format;
    }
  }
  // ControlValueAccessor methods
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: any): void {
    if (value) {
      this.isInternalChange = true;
      if (this.mode === 'range' && typeof value === 'string') {
        const [start, end] = value.split(' - ');
        const format = this.getFormatForMode();
        this.selectedStartDate = this.dateAdapter.parse(start.trim(), format);
        this.selectedEndDate = this.dateAdapter.parse(end.trim(), format);
        this.form.get('dateInput')?.setValue(value);
      } else if (this.mode !== 'range') {
        const format = this.getFormatForMode();
        const parsedDate = this.dateAdapter.parse(value, format);
        if (parsedDate) {
          this.selectedDate = this.clampDate(parsedDate);
          const formattedDate = this.dateAdapter.format(this.selectedDate, format);
          this.form.get('dateInput')?.setValue(formattedDate);
        }
      }
      this.isInternalChange = false;
    } else {
      this.isInternalChange = true;
      this.selectedDate = null;
      this.selectedStartDate = null;
      this.selectedEndDate = null;
      this.form.get('dateInput')?.setValue('');
      this.isInternalChange = false;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
}