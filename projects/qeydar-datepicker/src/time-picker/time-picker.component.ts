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
import { slideMotion } from '../animation/slide';
import { Lang_Locale } from '../date-picker-popup/models';
import { QeydarDatePickerService } from '../date-picker.service';
import { DEFAULT_DATE_PICKER_POSITIONS } from 'qeydar-datepicker';

export type TimeValueType = 'date' | 'string';

@Component({
  selector: 'qeydar-time-picker',
  template: `
    <div class="time-picker-wrapper" [formGroup]="form">
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
        <div 
          #popupWrapper 
          [class]="'time-picker-popup ' + cssClass"
          [@slideMotion]="'enter'" 
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
                    [class.selected]="selectedHour === hour"
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
                    [class.selected]="selectedMinute === minute"
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
                      [class.selected]="selectedSecond === second"
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
                    [class.selected]="selectedPeriod === period"
                    (click)="selectPeriod(period)"
                    type="button"
                  >
                    {{ period }}
                  </button>
                </div>
              </ng-container>
            </div>
          </div>
          
          <div class="time-picker-footer">
            <div class="footer-buttons">
              <button class="now-btn" (click)="selectNow()" type="button">{{ lang.now }}</button>
            </div>
            <div class="footer-actions">
              <!-- <button class="cancel-btn" (click)="cancel()" type="button">{{ lang.cancel }}</button> -->
              <button class="save-btn" (click)="save()" type="button">{{ lang.ok }}</button>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    :host * {
      font-family: inherit;
      font-weight: 400;
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }
    .time-picker-wrapper {
      display: inline-block;
    }

    .input-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
    }

    input:focus {
      outline: none;
    }

    input.time-picker-input {
      font-family: inherit;
      width: 100%;
      padding: 6px 30px 6px 10px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      word-spacing: 7px;
      transition: all 0.3s;
    }

    input:hover {
      border-color: #40a9ff;
    }

    .input-wrapper.focus {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24,144,255,0.2);
      outline: none;
    }

    .time-button {
      background: none;
      border: none;
      padding: 4px 4px 0;
      cursor: pointer;
    }

    .time-picker-popup {
      background: white;
      border-radius: 8px;
      box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);
      width: fit-content;
      min-width: 200px;
      overflow: hidden;
    }

    .time-picker-header {
      padding: 16px;
      font-size: 16px;
      font-weight: 500;
      border-bottom: 1px solid #f0f0f0;
    }

    .time-picker-content {
      padding: 8px;
    }

    .time-columns {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      gap: 8px;
    }

    .time-column {
      flex: 1;
      height: 220px;
      overflow-y: auto;
      scrollbar-width: none;
    }

    .time-column::-webkit-scrollbar {
      display: none;
    }

    .time-scroller {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .time-column button {
      width: 100%;
      padding: 8px;
      border: none;
      background: none;
      cursor: pointer;
      color: #666;
      font-size: 14px;
      border-radius: 4px;
    }

    .time-column button:hover:not(.disabled) {
      background: #f5f5f5;
    }

    .time-column button.selected {
      background: #e6f4ff;
      color: #1890ff;
    }

    .time-column button.disabled {
      color: #d9d9d9;
      cursor: not-allowed;
    }

    .time-separator {
      padding: 8px 0;
      color: #999;
      font-weight: bold;
    }

    .time-picker-footer {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      border-top: 1px solid #f0f0f0;
    }

    button {
      padding: 4px 15px;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
      background: white;
      cursor: pointer;
      font-size: 14px;
    }

    .save-btn {
      background: #1890ff;
      border-color: #1890ff;
      color: white;
    }

    .save-btn:hover {
      background: #40a9ff;
      border-color: #40a9ff;
    }

    .cancel-btn:hover {
      border-color: #40a9ff;
      color: #40a9ff;
    }

    .footer-buttons {
      display: flex;
      gap: 8px;
    }

    .footer-actions {
      display: flex;
      gap: 8px;
    }

    .now-btn {
      color: #1890ff;
      border-color: transparent;
      background: transparent;
      box-shadow: none;
      padding-left: 0;
    }

    .now-btn:hover {
      color: #40a9ff;
    }
  `],
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
  // #region Inputs & Outputs
  @Input() placeholder?: string;
  @Input() rtl: boolean = false;
  @Input() placement: 'left' | 'right' = 'right';
  @Input() minTime?: string;
  @Input() maxTime?: string;
  @Input() lang: Lang_Locale;
  @Input() valueType: TimeValueType = 'string';
  @Input() cssClass: string = '';
  @Input() showIcon = true;

  @Input() set timeFormat(value: '12' | '24') {
    this._timeFormat = value;
    this.updateHourRange();
  }
  get timeFormat(): '12' | '24' {
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

  @Output() timeChange = new EventEmitter<any>();
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('timePickerInput') timePickerInput: ElementRef;
  @ViewChild('popupWrapper') popupWrapper: ElementRef;
  // #endregion

  // #region Component State
  private _timeFormat: '12' | '24' = '12';
  private _displayFormat = 'hh:mm a';
  private _value: string | Date | null = null;
  
  showSeconds = false;
  hours: number[] = [];
  minutes: number[] = Array.from({length: 60}, (_, i) => i);
  seconds: number[] = Array.from({length: 60}, (_, i) => i);
  periods: string[] = [];

  selectedHour: number = 12;
  selectedMinute: number = 0;
  selectedSecond: number = 0;
  selectedPeriod: string;

  isOpen = false;
  form: FormGroup;
  origin: CdkOverlayOrigin;
  // #endregion

  // #region Private Properties
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  private documentClickListener: (event: MouseEvent) => void;
  private timeoutId: any = null;

  overlayPositions: ConnectionPositionPair[] = [...DEFAULT_DATE_PICKER_POSITIONS];
  // #endregion

  constructor(
    private fb: FormBuilder,
    public elementRef: ElementRef,
    public cdref: ChangeDetectorRef,
    public datePickerService: QeydarDatePickerService
  ) {
    this.form = this.fb.group({
      timeInput: ['']
    });
    this.documentClickListener = this.handleDocumentClick.bind(this);

    this.lang = this.datePickerService.locale_en;
    this.selectedPeriod = this.lang.am;
    this.periods = [this.lang.am, this.lang.pm];
  }

  // #region Lifecycle Hooks
  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rtl'] || changes['lang']) {
      this.lang = changes['lang']? this.lang: (this.rtl? this.datePickerService.locale_fa :this.datePickerService.locale_en);
      this.selectedPeriod = this.lang.am;
      this.periods = [this.lang.am, this.lang.pm];
    }
  }
  // #endregion

  // #region Component Initialization
  private initializeComponent(): void {
    this.updateHourRange();
    this.origin = new CdkOverlayOrigin(this.elementRef);
    this.setupInputSubscription();
    this.value = new Date();
    document.addEventListener('click', this.documentClickListener);
  }

  private setupInputSubscription(): void {
    this.form.get('timeInput').valueChanges.subscribe(value => {
      if (!value) return;

      if (!this.isOpen) {
        this.validateAndUpdateTime(value);
      } else {
        this.parseTimeString(value);
        this.scrollToTime();
      }
    });
  }

  private cleanup(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }
    document.removeEventListener('click', this.documentClickListener);
  }
  // #endregion

  // #region Value Accessors
  get value(): Date | string | null {
    return this._value;
  }
  
  set value(val: Date | string | null) {
    this._value = val;
    this.updateFromValue(val);
  }
  // #endregion

  // #region ControlValueAccessor Implementation
  writeValue(value: Date | string | null): void {
    if (value === null || value === undefined) {
      this.value = null;
      return;
    }

    if (value instanceof Date) {
      this.value = value;
    } else if (typeof value === 'string' && value.trim() !== '') {
      const date = new Date(value);
      this.value = !isNaN(date.getTime()) && this.valueType === 'date' ? 
        date : value;
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
  // #endregion

  // #region Time Management
  private updateHourRange(): void {
    this.hours = this.timeFormat === '12' 
      ? Array.from({length: 12}, (_, i) => i + 1)
      : Array.from({length: 24}, (_, i) => i);
  }

  private formatTime(date?: Date): string {
    if (date) {
      return this.formatDateToTimeString(date);
    }
    return this.formatSelectedTimeToString();
  }

  private formatDateToTimeString(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    if (this.timeFormat === '12') {
      const period = hours >= 12 ? this.lang.pm : this.lang.am;
      hours = hours % 12 || 12;
      return this.buildTimeString(hours, minutes, seconds, period);
    }
    
    return this.buildTimeString(hours, minutes, seconds);
  }

  private formatSelectedTimeToString(): string {
    let hours = this.selectedHour;
    if (this.timeFormat === '12') {
      if (this.selectedPeriod === this.lang.pm && hours < 12) hours += 12;
      if (this.selectedPeriod === this.lang.am && hours === 12) hours = 0;
      hours = hours % 12 || 12;
    }
    
    return this.buildTimeString(
      hours, 
      this.selectedMinute, 
      this.selectedSecond, 
      this.timeFormat === '12' ? this.selectedPeriod : null
    );
  }

  private buildTimeString(hours: number, minutes: number, seconds: number, period?: string): string {
    let timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    if (this.showSeconds) {
      timeString += `:${seconds.toString().padStart(2, '0')}`;
    }
    if (period) {
      timeString += ` ${period}`;
    }
    return timeString;
  }

  parseTimeString(value: string | Date): void {
    if (value instanceof Date) {
      this.updateFromDate(value);
      return;
    }

    if (!value) return;

    const hasSeconds = value.split(':').length > 2;
    let [time, period] = value.split(' ');
    let [hours, minutes, seconds] = time.split(':').map(Number);

    if (this.timeFormat === '12') {
      if (!period) {
        period = hours >= 12 ? this.lang.pm : this.lang.am;
        hours = hours % 12 || 12;
      }
    } else {
      if (period) {
        if (period.toUpperCase() === this.lang.pm && hours < 12) hours += 12;
        if (period.toUpperCase() === this.lang.am && hours === 12) hours = 0;
      }
    }
    
    this.selectedHour = hours;
    this.selectedMinute = minutes || 0;
    this.selectedSecond = seconds || 0;
    this.selectedPeriod = (this.timeFormat === '12') ? (period || this.lang.am) : null;
  }

  /**
   * Validate and update time with normalization
   */
  validateAndUpdateTime(value: string): void {
    if (!value) {
      this.updateTimeDisplay();
      return;
    }

    // Try to normalize the time format first
    try {
      let normalizedInput = value.trim();
      
      // Handle basic format corrections for 12-hour format
      if (this.timeFormat === '12') {
        const [time, period] = normalizedInput.split(' ');
        if (time) {
          let [hours, minutes] = time.split(':').map(Number);
          
          // Normalize hours and minutes to valid ranges
          hours = isNaN(hours) ? 12 : Math.min(12, Math.max(1, hours));
          minutes = isNaN(minutes) ? 0 : Math.min(59, Math.max(0, minutes));

          // Determine period if not provided
          let normalizedPeriod = period;
          if (!period) {
            // If no period provided, try to infer from original value
            if (normalizedInput.toLowerCase().includes(this.lang.pm.toLowerCase()) || 
                normalizedInput.toLowerCase().includes('pm')) {
              normalizedPeriod = this.lang.pm;
            } else {
              normalizedPeriod = this.lang.am;
            }
          } else if (period.toUpperCase() === 'PM' || period.toUpperCase() === 'AM') {
            normalizedPeriod = period.toUpperCase() === 'PM' ? this.lang.pm : this.lang.am;
          }

          normalizedInput = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${normalizedPeriod}`;
        }
      } else {
        // 24-hour format normalization
        const [hours, minutes] = normalizedInput.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          normalizedInput = `${Math.min(23, Math.max(0, hours)).toString().padStart(2, '0')}:${Math.min(59, Math.max(0, minutes)).toString().padStart(2, '0')}`;
        }
      }

      // Now normalize according to min/max constraints
      const finalTime = this.normalizeTime(normalizedInput);
      
      this.form.get('timeInput').setValue(finalTime, { emitEvent: false });
      this.parseTimeString(finalTime);
      
      const outputValue = this.valueType === 'date' 
        ? this.updateDateFromSelection() 
        : finalTime;
      
      this._value = outputValue;
      this.onChange(outputValue);
      this.timeChange.emit(outputValue);
    } catch (error) {
      console.error('Error normalizing time:', error);
      this.updateTimeDisplay();
    }
  }

  // #endregion

  // #region UI Event Handlers
  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab' || event.key === 'Enter') {
      const currentValue = this.form.get('timeInput').value;
      if (currentValue) {
        this.validateAndUpdateTime(currentValue);
      }
      if (event.key === 'Tab') {
        this.close();
      }
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  private handleDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen) {
      this.close();
      const currentValue = this.form.get('timeInput').value;
      if (currentValue) {
        this.validateAndUpdateTime(currentValue);
      }
    }
  }

  onFocusInput(): void {
    if (!this.isOpen) {
      this.open();
    }
  }

  toggleTimePicker(event: Event): void {
    event.stopPropagation();
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  // #endregion

  // #region Picker Operations
  open(): void {
    this.isOpen = true;
    this.openChange.emit(true);
    this.scrollToTime();
  }

  close(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.isOpen) {
      this.isOpen = false;
      this.openChange.emit(false);
    }

    this.cdref.detectChanges();
  }

  selectHour(hour: number): void {
    if (!this.isHourDisabled(hour)) {
      this.selectedHour = hour;
      this.updateTimeDisplay();
      this.scrollToSelectedItem('h'+hour);
    }
  }

  selectMinute(minute: number): void {
    if (!this.isMinuteDisabled(minute)) {
      this.selectedMinute = minute;
      this.updateTimeDisplay();
      this.scrollToSelectedItem('m'+minute);
    }
  }

  selectSecond(second: number): void {
    this.selectedSecond = second;
    this.updateTimeDisplay();
    this.scrollToSelectedItem('s'+second);
  }

  selectPeriod(period: string): void {
    this.selectedPeriod = period;
    this.updateTimeDisplay();
  }

  selectNow(): void {
    const now = new Date();
    this.selectedHour = this.timeFormat === '12' ? now.getHours() % 12 || 12 : now.getHours();
    this.selectedMinute = now.getMinutes();
    this.selectedSecond = now.getSeconds();
    this.selectedPeriod = now.getHours() >= 12 ? this.lang.pm : this.lang.am;
    
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
    this.form.get('timeInput').setValue(this.formatTime(), { emitEvent: false });
    
    this.onChange(outputValue);
    this.timeChange.emit(outputValue);
    
    if (close) {
      this.close();
    }
  }

  cancel(): void {
    this.close();
  }
  // #endregion

  // #region Helper Methods
  private updateFromDate(date: Date | null): void {
    if (date && !isNaN(date.getTime())) {
      let hours = date.getHours();
      if (this.timeFormat === '12') {
        this.selectedPeriod = hours >= 12 ? this.lang.pm : this.lang.am;
        hours = hours % 12 || 12;
      }
      this.selectedHour = hours;
      this.selectedMinute = date.getMinutes();
      this.selectedSecond = date.getSeconds();
    } else {
      this.resetSelection();
    }
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

  private resetSelection(): void {
    this.selectedHour = this.timeFormat === '12' ? 12 : 0;
    this.selectedMinute = 0;
    this.selectedSecond = 0;
    this.selectedPeriod = this.lang.am;
  }

  private updateTimeDisplay(): void {
    if (this.form) {
      this.form.get('timeInput').setValue(this.formatTime(), { emitEvent: false });
    }
  }

  updateDateFromSelection(): Date {
    let baseDate: Date;
    
    if (this._value instanceof Date) {
      baseDate = new Date(this._value);
    } else {
      baseDate = new Date();
      baseDate.setHours(0, 0, 0, 0);
    }
    
    let hours = this.selectedHour;
    if (this.timeFormat === '12') {
      if (this.selectedPeriod === this.lang.pm && hours < 12) hours += 12;
      if (this.selectedPeriod === this.lang.am && hours === 12) hours = 0;
    }
    
    baseDate.setHours(hours);
    baseDate.setMinutes(this.selectedMinute);
    baseDate.setSeconds(this.showSeconds ? this.selectedSecond : 0);
    baseDate.setMilliseconds(0);
    
    return baseDate;
  }

  /**
   * Convert time string to minutes for easier comparison, handling both 12/24 formats
   */
  private timeToMinutes(timeStr: string): number {
    const [time, period] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    // Handle 12-hour format conversion
    if (this.timeFormat === '12') {
      if (!period) {
        // If no period provided, assume AM for 12 and PM for others
        if (hours === 12) hours = 0;
      } else {
        const isPM = period.toUpperCase() === this.lang.pm.toUpperCase() || period.toUpperCase() === 'PM';
        if (isPM && hours < 12) hours += 12;
        else if (!isPM && hours === 12) hours = 0;
      }
    }

    return hours * 60 + minutes;
  }

  /**
   * Convert minutes back to time string
   */
  private minutesToTime(totalMinutes: number): string {
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (this.timeFormat === '12') {
      const period = hours >= 12 ? this.lang.pm : this.lang.am;
      hours = hours % 12 || 12;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Normalize time to nearest valid time based on min/max constraints
   */
  private normalizeTime(value: string): string {
    // First, ensure the time string has proper period for 12-hour format
    if (this.timeFormat === '12' && !value.includes(' ')) {
      const minutes = this.timeToMinutes(value);
      const hours = Math.floor(minutes / 60);
      value += ` ${hours >= 12 ? this.lang.pm : this.lang.am}`;
    }

    const minutes = this.timeToMinutes(value);
    let normalizedMinutes = minutes;

    if (this.minTime) {
      const minMinutes = this.timeToMinutes(this.minTime);
      if (minutes < minMinutes) {
        normalizedMinutes = minMinutes;
      }
    }

    if (this.maxTime) {
      const maxMinutes = this.timeToMinutes(this.maxTime);
      if (minutes > maxMinutes) {
        normalizedMinutes = maxMinutes;
      }
    }

    return this.minutesToTime(normalizedMinutes);
  }

  /**
   * Checks if a specific hour is disabled based on min/max time constraints
   * Only considers the hour bounds, ignoring minutes
   */
  isHourDisabled(hour: number): boolean {
    if (!this.minTime && !this.maxTime) return false;

    // Convert hour to 24-hour format for comparison
    let testHour = hour;
    if (this.timeFormat === '12') {
      if (this.selectedPeriod === this.lang.pm && hour < 12) testHour += 12;
      if (this.selectedPeriod === this.lang.am && hour === 12) testHour = 0;
    }

    if (this.minTime) {
      const [minHour] = this.minTime.split(':').map(Number);
      let minTestHour = minHour;
      if (this.timeFormat === '12') {
        if (this.minTime.toLowerCase().includes(this.lang.pm.toLowerCase()) && minHour < 12) {
          minTestHour += 12;
        } else if (this.minTime.toLowerCase().includes(this.lang.am.toLowerCase()) && minHour === 12) {
          minTestHour = 0;
        }
      }
      if (testHour < minTestHour) return true;
    }

    if (this.maxTime) {
      const [maxHour] = this.maxTime.split(':').map(Number);
      let maxTestHour = maxHour;
      if (this.timeFormat === '12') {
        if (this.maxTime.toLowerCase().includes(this.lang.pm.toLowerCase()) && maxHour < 12) {
          maxTestHour += 12;
        } else if (this.maxTime.toLowerCase().includes(this.lang.am.toLowerCase()) && maxHour === 12) {
          maxTestHour = 0;
        }
      }
      if (testHour > maxTestHour) return true;
    }

    return false;
  }

  /**
   * Checks if a specific minute is disabled based on min/max time constraints
   */
  isMinuteDisabled(minute: number): boolean {
    if (!this.minTime && !this.maxTime) return false;

    // Create a time string for the current hour and this minute
    let testHour = this.selectedHour;
    if (this.timeFormat === '12') {
      if (this.selectedPeriod === this.lang.pm && testHour < 12) testHour += 12;
      if (this.selectedPeriod === this.lang.am && testHour === 12) testHour = 0;
    }

    const testTime = `${testHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const testMinutes = this.timeToMinutes(testTime);

    if (this.minTime) {
      const [minHour, minMinute] = this.minTime.split(':').map(Number);
      let minTestHour = minHour;
      
      if (this.timeFormat === '12') {
        if (this.minTime.toLowerCase().includes(this.lang.pm.toLowerCase()) && minHour < 12) {
          minTestHour += 12;
        } else if (this.minTime.toLowerCase().includes(this.lang.am.toLowerCase()) && minHour === 12) {
          minTestHour = 0;
        }
      }

      // Only check minutes if we're in the minimum hour
      if (testHour === minTestHour && minute < minMinute) {
        return true;
      }
    }

    if (this.maxTime) {
      const [maxHour, maxMinute] = this.maxTime.split(':').map(Number);
      let maxTestHour = maxHour;
      
      if (this.timeFormat === '12') {
        if (this.maxTime.toLowerCase().includes(this.lang.pm.toLowerCase()) && maxHour < 12) {
          maxTestHour += 12;
        } else if (this.maxTime.toLowerCase().includes(this.lang.am.toLowerCase()) && maxHour === 12) {
          maxTestHour = 0;
        }
      }

      // Only check minutes if we're in the maximum hour
      if (testHour === maxTestHour && minute > maxMinute) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if the current time selection is valid
   */
  private isTimeValid(): boolean {
    if (!this.minTime && !this.maxTime) return true;

    const currentTime = this.formatTime();
    const currentMinutes = this.timeToMinutes(currentTime);

    if (this.minTime && currentMinutes < this.timeToMinutes(this.minTime)) {
      return false;
    }

    if (this.maxTime && currentMinutes > this.timeToMinutes(this.maxTime)) {
      return false;
    }

    return true;
  }

  // #region Scroll Management
  async scrollToTime(): Promise<void> {
    if (this.selectedHour) {
      await this.scrollToSelectedItem('h'+this.selectedHour, 'auto');
    }

    if (this.selectedMinute) {
      await this.scrollToSelectedItem('m'+this.selectedMinute, 'auto');
    }

    if (this.selectedSecond && this.showSeconds) {
      await this.scrollToSelectedItem('s'+this.selectedSecond);
    }
  }

  scrollToSelectedItem(id: string, behavior: 'smooth'|'auto' = 'smooth', timeout = 0): Promise<boolean> {
    clearTimeout(this.timeoutId);
    return new Promise((resolve) => {
      if (id) {
        this.timeoutId = setTimeout(() => {
          const selectedElement = this.popupWrapper?.nativeElement.querySelector(`#selector_${id}`);
          if (selectedElement) {
            selectedElement.scrollIntoView({ behavior, block: 'center' });
          }
          resolve(true);
        }, timeout);
      } else {
        resolve(false);
      }
    });
  }
  // #endregion

  onPositionChange(position: ConnectedOverlayPositionChange): void {
    this.cdref.detectChanges();
  }
}