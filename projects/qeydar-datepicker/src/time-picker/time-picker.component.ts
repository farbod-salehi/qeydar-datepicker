/**
 * Time Picker Component
 * A customizable time picker that supports 12/24 hour formats, seconds, and multiple locales.
 * 
 * Features:
 * - 12/24 hour format
 * - Optional seconds
 * - Localization support
 * - String or Date value types
 * - Min/Max time validation
 * - Custom styling
 */
import { Component, ElementRef, forwardRef, Input, OnInit, Output, EventEmitter, ViewChild, OnDestroy, HostListener, AfterViewInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup } from '@angular/forms';
import { CdkOverlayOrigin, ConnectedOverlayPositionChange, ConnectionPositionPair } from '@angular/cdk/overlay';
import { slideMotion } from '../utils/animation/slide';
import { Lang_Locale } from '../utils/models';
import { QeydarDatePickerService } from '../date-picker.service';
import { DateAdapter, DEFAULT_DATE_PICKER_POSITIONS, GregorianDateAdapter, JalaliDateAdapter } from '../public-api';
import { TimeConfig, TimeFormat, TimeValueType } from '../utils/types';

@Component({
  selector: 'qeydar-time-picker',
  template: `
    <div class="time-picker-wrapper" [formGroup]="form">
      <!-- Regular input mode -->
      <ng-container *ngIf="!inline">
        <div class="input-wrapper" [class.focus]="isOpen">
          <input
            #timePickerInput
            type="text"
            class="time-picker-input"
            [class.focus]="isOpen"
            formControlName="timeInput"
            (focus)="onFocusInput()"
            [placeholder]="placeholder || 'Select time'"
          >
          <button *ngIf="showIcon" class="time-button" (click)="toggleTimePicker($event)" tabindex="-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </button>
        </div>

        <ng-template
          cdkConnectedOverlay
          nzConnectedOverlay
          [cdkConnectedOverlayOrigin]="origin"
          [cdkConnectedOverlayOpen]="isOpen"
          [cdkConnectedOverlayPositions]="overlayPositions"
          [cdkConnectedOverlayTransformOriginOn]="'.time-picker-popup'"
          [cdkConnectedOverlayHasBackdrop]="false"
          (positionChange)="onPositionChange($event)"
          (detach)="close()"
        >
          <ng-container *ngTemplateOutlet="timePickerContent"></ng-container>
        </ng-template>
      </ng-container>

      <!-- Inline mode -->
      <ng-container *ngIf="inline">
        <ng-container *ngTemplateOutlet="timePickerContent"></ng-container>
      </ng-container>

      <!-- Time Picker Content Template -->
      <ng-template #timePickerContent>
        <div 
          #popupWrapper 
          [class]="'time-picker-popup ' + cssClass"
          [@slideMotion]="'enter'" 
          [class.inline]="inline"
          style="position: relative"
          (click)="$event.stopPropagation()"
        >
          <div class="time-picker-content">
            <div class="time-columns">
              <!-- Hours -->
              <div class="time-column">
                <div class="time-scroller">
                  <button
                    *ngFor="let hour of hours"
                    [id]="'selector_h'+hour"
                    [class.selected]="selectedTime.hour === hour"
                    [class.disabled]="isHourDisabled(hour)"
                    (click)="selectHour(hour)"
                    type="button"
                  >
                    {{ hour.toString().padStart(2, '0') }}
                  </button>
                </div>
              </div>
              
              <div class="time-separator">:</div>
              
              <!-- Minutes -->
              <div class="time-column">
                <div class="time-scroller">
                  <button
                    *ngFor="let minute of minutes"
                    [id]="'selector_m'+minute"
                    [class.selected]="selectedTime.minute === minute"
                    [class.disabled]="isMinuteDisabled(minute)"
                    (click)="selectMinute(minute)"
                    type="button"
                  >
                    {{ minute.toString().padStart(2, '0') }}
                  </button>
                </div>
              </div>

              <!-- Seconds (if format includes seconds) -->
              <ng-container *ngIf="showSeconds">
                <div class="time-separator">:</div>
                <div class="time-column">
                  <div class="time-scroller">
                    <button
                      *ngFor="let second of seconds"
                      [id]="'selector_s'+second"
                      [class.selected]="selectedTime.second === second"
                      [class.disabled]="isSecondDisabled(second)"
                      (click)="selectSecond(second)"
                      type="button"
                    >
                      {{ second.toString().padStart(2, '0') }}
                    </button>
                  </div>
                </div>
              </ng-container>
              
              <!-- AM/PM (only in 12-hour format) -->
              <ng-container *ngIf="timeFormat === '12'">
                <div class="time-column period">
                  <button
                    *ngFor="let period of periods"
                    [class.selected]="selectedTime.period === period"
                    (click)="selectPeriod(period)"
                    type="button"
                  >
                    {{ period }}
                  </button>
                </div>
              </ng-container>
            </div>
          </div>
          
          <div class="time-picker-footer" *ngIf="!inline">
            <div class="footer-buttons">
              <button class="now-btn" (click)="selectNow()" type="button">{{ lang.now }}</button>
            </div>
            <div class="footer-actions">
              <button class="save-btn" (click)="save()" type="button">{{ lang.ok }}</button>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./time-picker.component.scss'],
  providers: [
    QeydarDatePickerService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true
    }
  ],
  host: {
    '(click)': 'open()'
  },
  animations: [slideMotion]
})
export class TimePickerComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges {
  @Input() placeholder?: string = 'Select time';
  @Input() rtl = false;
  @Input() placement: 'left' | 'right' = 'right';
  @Input() minTime?: string;
  @Input() maxTime?: string;
  @Input() lang!: Lang_Locale;
  @Input() valueType: TimeValueType = 'string';
  @Input() cssClass = '';
  @Input() showIcon = true;
  @Input() dateAdapter: DateAdapter<Date>;
  @Input() inline = false;
  @Input() set timeFormat(value: TimeFormat) {
    this._timeFormat = value;
    this.updateHourRange();
  }
  get timeFormat(): TimeFormat {
    return this._timeFormat;
  }
  @Input() set displayFormat(value: string) {
    this._displayFormat = value;
    this.showSeconds = value.toLowerCase().includes('s');
    this.updateTimeDisplay();
  }
  get displayFormat(): string {
    return this._displayFormat;
  }

  @Output() timeChange = new EventEmitter<Date | string>();
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('timePickerInput') timePickerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('popupWrapper') popupWrapper!: ElementRef<HTMLDivElement>;

  private _timeFormat: TimeFormat = '12';
  private _displayFormat = 'hh:mm a';
  private _value: string | Date | null = null;
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  private timeoutId: number | null = null;

  showSeconds = false;
  hours: number[] = [];
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i);
  seconds: number[] = Array.from({ length: 60 }, (_, i) => i);
  periods: string[] = [];
  selectedTime: TimeConfig = {
    hour: 12,
    minute: 0,
    second: 0,
    period: ''
  };
  isOpen = false;
  form: FormGroup;
  origin: CdkOverlayOrigin;
  overlayPositions = [...DEFAULT_DATE_PICKER_POSITIONS];

  constructor(
    private fb: FormBuilder,
    private elementRef: ElementRef,
    private cdref: ChangeDetectorRef,
    private datePickerService: QeydarDatePickerService,
    private jalaliAdapter: JalaliDateAdapter,
    private gregorianAdapter: GregorianDateAdapter,
  ) {
    this.dateAdapter = this.gregorianAdapter;
    this.initializeForm();
    this.initializeLocale();
  }

  // Lifecycle hooks
  ngOnInit(): void {
    this.updateHourRange();
    this.origin = new CdkOverlayOrigin(this.elementRef);
    this.setupInputSubscription();
    this.value = new Date();

    // Only add document click listener for non-inline mode
    if (!this.inline) {
      document.addEventListener('click', this.handleDocumentClick);
    }

    // Auto-open for inline mode
    if (this.inline) {
      this.isOpen = true;
    }
  }

  ngOnDestroy(): void {
    this.cleanupTimeouts();
    document.removeEventListener('click', this.handleDocumentClick);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rtl'] || changes['lang']) {
      this.updateLocale();
    }
    if (changes['rtl'] && !changes['dateAdapter']) {
      this.dateAdapter = this.rtl? this.jalaliAdapter: this.gregorianAdapter;
    }
  }

  // Initialization methods
  private initializeForm(): void {
    this.form = this.fb.group({
      timeInput: ['']
    });
  }

  private initializeLocale(): void {
    this.lang = this.datePickerService.locale_en;
    this.selectedTime.period = this.lang.am;
    this.periods = [this.lang.am, this.lang.pm];
  }

  private updateLocale(): void {
    this.lang = this.rtl ? this.datePickerService.locale_fa : this.datePickerService.locale_en;
    this.selectedTime.period = this.lang.am;
    this.periods = [this.lang.am, this.lang.pm];
  }

  private setupInputSubscription(): void {
    this.form.get('timeInput')?.valueChanges.subscribe(value => {
      if (!value) return;

      if (!this.isOpen) {
        this.validateAndUpdateTime(value);
      } else {
        this.parseTimeString(value);
        this.scrollToTime();
      }
    });
  }

  // Time management
  private updateHourRange(): void {
    this.hours = this.timeFormat === '12'
    ? Array.from({ length: 12 }, (_, i) => i + 1)
    : Array.from({ length: 24 }, (_, i) => i);
  }

  private formatTime(date?: Date): string {
    if (!date && !this.dateAdapter) return '';
    
    const currentDate = date || this.updateDateFromSelection();
    return this.dateAdapter.format(currentDate, this._displayFormat);
  }

  private parseTimeString(value: string | Date): void {
    if (!this.dateAdapter) return;

    const date = value instanceof Date ? value : this.dateAdapter.parse(value, this._displayFormat);
    if (!date) return;

    const hours = this.dateAdapter.getHours(date);
    const minutes = this.dateAdapter.getMinutes(date);
    const seconds = this.dateAdapter.getSeconds(date);

    if (hours === null || minutes === null || seconds === null) return;

    this.selectedTime = {
      hour: hours,
      minute: minutes,
      second: seconds,
      period: hours >= 12 ? this.lang.pm : this.lang.am
    };
  }

  // State management
  private normalizeTime(date: Date): Date {
    if (!this.dateAdapter) return date;

    let normalizedDate = this.dateAdapter.clone(date);

    if (this.minTime) {
      const minDate = this.dateAdapter.parse(this.minTime, this._displayFormat);
      if (minDate && this.dateAdapter.isBefore(normalizedDate, minDate)) {
        normalizedDate = minDate;
      }
    }

    if (this.maxTime) {
      const maxDate = this.dateAdapter.parse(this.maxTime, this._displayFormat);
      if (maxDate && this.dateAdapter.isAfter(normalizedDate, maxDate)) {
        normalizedDate = maxDate;
      }
    }

    return normalizedDate;
  }

  // Value accessors and form control
  get value(): Date | string | null {
    return this._value;
  }
  
  set value(val: Date | string | null) {
    this._value = val;
    this.updateFromValue(val);
  }

  private updateFromValue(value: Date | string | null): void {
    if (!value) {
      this.resetSelection();
      return;
    }

    if (value instanceof Date) {
      this.updateFromDate(value);
    } else {
      this.parseTimeString(value);
    }
  }

  private updateFromDate(date: Date | null): void {
    if (date && !isNaN(date.getTime()) && this.dateAdapter) {
      const hours = this.dateAdapter.getHours(date);
      if (hours === null) return;

      this.selectedTime = {
        hour: hours,
        minute: this.dateAdapter.getMinutes(date) ?? 0,
        second: this.dateAdapter.getSeconds(date) ?? 0,
        period: hours >= 12 ? this.lang.pm : this.lang.am
      };
    } else {
      this.resetSelection();
    }
  }

  private resetSelection(): void {
    this.selectedTime = {
      hour: 0,
      minute: 0,
      second: 0,
      period: this.lang.am
    };
  }

  writeValue(value: Date | string | null): void {
    if (!value) {
      this.value = null;
      return;
    }

    if (value instanceof Date) {
      this.value = value;
    } else if (value.trim()) {
      const date = new Date(value);
      this.value = !isNaN(date.getTime()) && this.valueType === 'date' ? date : value;
      this.parseTimeString(value);
    }
    
    this.updateTimeDisplay();
    this.save(false);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // UI Event handlers
  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab' || event.key === 'Enter') {
      this.handleTimeInput();
      if (event.key === 'Tab') this.close();
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  private handleTimeInput(): void {
    const currentValue = this.form.get('timeInput')?.value;
    if (currentValue) {
      this.validateAndUpdateTime(currentValue);
    }
  }

  private handleDocumentClick = (event: MouseEvent): void => {
    if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen) {
      this.close();
      this.handleTimeInput();
    }
  }

  onFocusInput(): void {
    if (!this.isOpen) {
      this.open();
    }
  }

  toggleTimePicker(event: Event): void {
    event.stopPropagation();
    this.isOpen ? this.close() : this.open();
  }

  // Picker operations
  open(): void {
    if (this.inline) return;

    this.isOpen = true;
    this.openChange.emit(true);
    this.scrollToTime();
  }

  close(): void {
    if (this.inline) return;

    this.cleanupTimeouts();
    if (this.isOpen) {
      this.isOpen = false;
      this.openChange.emit(false);
      this.cdref.detectChanges();
    }
  }

  // Selection methods
  selectHour(hour: number): void {
    if (!this.isHourDisabled(hour)) {
      this.selectedTime.hour = hour;
      this.updateTimeDisplay();
      this.scrollToSelectedItem(`h${hour}`);
      if (this.inline) this.save();
    }
  }

  selectMinute(minute: number): void {
    if (!this.isMinuteDisabled(minute)) {
      this.selectedTime.minute = minute;
      this.updateTimeDisplay();
      this.scrollToSelectedItem(`m${minute}`);
      if (this.inline) this.save();
    }
  }

  selectSecond(second: number): void {
    if (!this.isSecondDisabled(second)) {
      this.selectedTime.second = second;
      this.updateTimeDisplay();
      this.scrollToSelectedItem(`s${second}`);
      if (this.inline) this.save();
    }
  }

  selectPeriod(period: string): void {
    this.selectedTime.period = period;
    this.updateTimeDisplay();
  }

  selectNow(): void {
    const now = new Date();
    this.selectedTime = {
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      period: now.getHours() >= 12 ? this.lang.pm : this.lang.am
    };
    
    this.updateTimeDisplay();
    this.scrollToTime();
    this.save();
  }

  save(close = true): void {
    const outputValue = this.valueType === 'date' 
      ? this.updateDateFromSelection() 
      : this.formatTime();

    if (!this.isTimeValid()) return;

    this._value = outputValue;
    this.form.get('timeInput')?.setValue(this.formatTime(), { emitEvent: false });
    
    this.onChange(outputValue);
    this.timeChange.emit(outputValue);
    
    if (close && !this.inline) {
      this.close();
    }
  }

  // Validation methods
  private validateAndUpdateTime(value: string): void {
    if (!value || !this.dateAdapter) {
      this.updateTimeDisplay();
      return;
    }

    try {
      const parsedDate = this.dateAdapter.parse(value, this._displayFormat);
      if (!parsedDate) {
        this.updateTimeDisplay();
        return;
      }

      const normalizedDate = this.normalizeTime(parsedDate);
      const formattedTime = this.dateAdapter.format(normalizedDate, this._displayFormat);
      
      this.form.get('timeInput')?.setValue(formattedTime, { emitEvent: false });
      this.parseTimeString(normalizedDate);

      const outputValue = this.valueType === 'date' ? normalizedDate : formattedTime;
      this._value = outputValue;
      this.onChange(outputValue);
      this.timeChange.emit(outputValue);

    } catch (error) {
      console.error('Error normalizing time:', error);
      this.updateTimeDisplay();
    }
  }

  isHourDisabled(hour: number): boolean {
    if (!this.dateAdapter || (!this.minTime && !this.maxTime)) return false;
    return this.isTimeDisabled(this.createDateWithTime({ ...this.selectedTime, hour }));
  }

  isMinuteDisabled(minute: number): boolean {
    if (!this.dateAdapter || (!this.minTime && !this.maxTime)) return false;
    return this.isTimeDisabled(this.createDateWithTime({ ...this.selectedTime, minute }));
  }

  isSecondDisabled(second: number): boolean {
    if (!this.dateAdapter || (!this.minTime && !this.maxTime)) return false;
    return this.isTimeDisabled(this.createDateWithTime({ ...this.selectedTime, second }));
  }

  private isTimeDisabled(testDate: Date): boolean {
    if (!this.dateAdapter) return false;

    if (this.minTime) {
      const minDate = this.dateAdapter.parse(this.minTime, this._displayFormat);
      if (minDate && this.dateAdapter.isBefore(testDate, minDate)) {
        return true;
      }
    }

    if (this.maxTime) {
      const maxDate = this.dateAdapter.parse(this.maxTime, this._displayFormat);
      if (maxDate && this.dateAdapter.isAfter(testDate, maxDate)) {
        return true;
      }
    }

    return false;
  }

  private isTimeValid(): boolean {
    if (!this.dateAdapter || (!this.minTime && !this.maxTime)) return true;

    const currentDate = this.updateDateFromSelection();
    if (this.minTime) {
      const minDate = this.dateAdapter.parse(this.minTime, this._displayFormat);
      if (minDate && this.dateAdapter.isBefore(currentDate, minDate)) {
        return false;
      }
    }

    if (this.maxTime) {
      const maxDate = this.dateAdapter.parse(this.maxTime, this._displayFormat);
      if (maxDate && this.dateAdapter.isAfter(currentDate, maxDate)) {
        return false;
      }
    }

    return true;
  }

  // Helper methods
  private createDateWithTime(config: TimeConfig): Date {
    if (!this.dateAdapter) return new Date();

    let testHour = config.hour;
    if (this.timeFormat === '12') {
      if (config.period === this.lang.pm && testHour < 12) testHour += 12;
      if (config.period === this.lang.am && testHour === 12) testHour = 0;
    }

    let date = new Date();
    date = this.dateAdapter.setHours(date, testHour);
    date = this.dateAdapter.setMinutes(date, config.minute);
    date = this.dateAdapter.setSeconds(date, config.second);
    return date;
  }

  private updateDateFromSelection(): Date {
    if (!this.dateAdapter) return new Date();

    let hours = this.selectedTime.hour;
    if (this.timeFormat === '12') {
      if (this.selectedTime.period === this.lang.pm && hours < 12) hours += 12;
      if (this.selectedTime.period === this.lang.am && hours === 12) hours = 0;
    }

    let date = this._value instanceof Date ? 
      this.dateAdapter.clone(this._value) : 
      new Date();

    date = this.dateAdapter.setHours(date, hours);
    date = this.dateAdapter.setMinutes(date, this.selectedTime.minute);
    date = this.dateAdapter.setSeconds(date, this.selectedTime.second);
    
    return date;
  }

  private updateTimeDisplay(): void {
    if (this.form) {
      this.form.get('timeInput')?.setValue(this.formatTime(), { emitEvent: false });
    }
  }

  // UI Update methods
  private async scrollToTime(){
    await this.scrollToSelectedItem(`h${this.selectedTime.hour}`, 'auto'),
    await this.scrollToSelectedItem(`m${this.selectedTime.minute}`, 'auto'),
    this.showSeconds ? await this.scrollToSelectedItem(`s${this.selectedTime.second}`, 'auto') : '';
  }

  private scrollToSelectedItem(id: string, behavior: ScrollBehavior = 'smooth'): Promise<boolean> {
    this.cleanupTimeouts();
    return new Promise((resolve) => {
      if (!id) {
        resolve(false);
        return;
      }

      this.timeoutId = window.setTimeout(() => {
        const selectedElement = this.popupWrapper?.nativeElement.querySelector(`#selector_${id}`);
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior, block: 'center' });
        }
        resolve(true);
      }, 0);
    });
  }

  private cleanupTimeouts(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  onPositionChange(position: ConnectedOverlayPositionChange): void {
    this.cdref.detectChanges();
  }
}