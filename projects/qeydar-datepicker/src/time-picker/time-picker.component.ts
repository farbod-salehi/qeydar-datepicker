// time-picker.component.ts
import { Component, ElementRef, forwardRef, Input, OnInit, Output, EventEmitter, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup } from '@angular/forms';
import { CdkOverlayOrigin, ConnectionPositionPair } from '@angular/cdk/overlay';
import { slideMotion } from '../animation/slide';
import { lang_En, lang_Fa, Lang_Locale } from '../date-picker-popup/models';

@Component({
  selector: 'qeydar-time-picker',
  template: `
    <div class="time-picker-wrapper" [formGroup]="form">
      <div class="input-wrapper">
        <input
          #timePickerInput
          type="text"
          class="time-picker-input"
          [class.focus]="isOpen"
          formControlName="timeInput"
          (focus)="onFocusInput()"
          [placeholder]="placeholder || 'Select time'"
        >
        <button class="time-button" (click)="toggleTimePicker($event)" tabindex="-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </button>
      </div>

      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="origin"
        [cdkConnectedOverlayOpen]="isOpen"
        [cdkConnectedOverlayPositions]="overlayPositions"
        [cdkConnectedOverlayTransformOriginOn]="'.time-picker-popup'"
        [cdkConnectedOverlayHasBackdrop]="false"
        (detach)="close()"
      >
        <div 
          #popupWrapper 
          class="time-picker-popup" 
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
            <button class="cancel-btn" (click)="cancel()" type="button">{{ lang.cancel }}</button>
            <button class="save-btn" (click)="save()" type="button">{{ lang.ok }}</button>
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
    }

    input.time-picker-input {
      font-family: inherit;
      width: 100%;
      padding: 6px 30px 6px 10px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 14px;
      word-spacing: 7px;
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

    .time-button {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      padding: 4px;
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
      justify-content: flex-end;
      padding: 8px;
      border-top: 1px solid #f0f0f0;
      gap: 8px;
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
  `],
  providers: [
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
export class TimePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() placeholder?: string;
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

  @Input() placement: 'left' | 'right' = 'right';
  @Input() minTime?: string;
  @Input() maxTime?: string;
  @Input() lang: Lang_Locale = new lang_Fa();

  @Output() timeChange = new EventEmitter<string>();
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('timePickerInput') timePickerInput: ElementRef;
  @ViewChild('popupWrapper') popupWrapper: ElementRef;

  private _timeFormat: '12' | '24' = '12';
  private _displayFormat = 'hh:mm a';
  
  showSeconds = false;
  hours: number[] = [];
  minutes: number[] = Array.from({length: 60}, (_, i) => i);
  seconds: number[] = Array.from({length: 60}, (_, i) => i);
  periods: string[] = [this.lang.am, this.lang.pm];

  selectedHour: number = 12;
  selectedMinute: number = 0;
  selectedSecond: number = 0;
  selectedPeriod: string = this.lang.am;

  isOpen = false;
  form: FormGroup;
  origin: CdkOverlayOrigin;
  overlayPositions: ConnectionPositionPair[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 4
    }
  ];

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  private documentClickListener: (event: MouseEvent) => void;
  private timeoutId: any = null;

  constructor(
    private fb: FormBuilder,
    private elementRef: ElementRef
  ) {
    this.form = this.fb.group({
      timeInput: ['']
    });

    // Bind the click handler to preserve the context
    this.documentClickListener = this.handleDocumentClick.bind(this);
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      // When tabbing out, close the picker
      this.close();
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  ngOnInit() {
    this.updateHourRange();
    this.origin = new CdkOverlayOrigin(this.elementRef);
    this.form.get('timeInput').valueChanges.subscribe(value => {
      if (value) {
        this.parseTimeString(value);
      }
    });

    // Handle clicks outside the component
    document.addEventListener('click', this.documentClickListener);
  }

  ngOnDestroy() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }
    // Clean up the click listener
    document.removeEventListener('click', this.handleDocumentClick);
  }

  writeValue(value: string): void {
    if (value) {
      this.form.get('timeInput').setValue(value, { emitEvent: false });
      this.parseTimeString(value);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  parseTimeString(timeString: string) {
    if (!timeString) return;

    const hasSeconds = timeString.split(':').length > 2;
    let [time, period] = timeString.split(' ');
    let [hours, minutes, seconds] = time.split(':').map(Number);

    if (this.timeFormat === '12') {
      // Convert 24h to 12h if needed
      if (!period) {
        period = hours >= 12 ? this.lang.pm : this.lang.am;
        hours = hours % 12 || 12;
      }
    } else {
      // Convert 12h to 24h if needed
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

  formatTime(): string {
    let hours = this.selectedHour;
    
    if (this.timeFormat === '12') {
      // Convert to 12-hour format
      if (this.selectedPeriod === this.lang.pm && hours < 12) hours += 12;
      if (this.selectedPeriod === this.lang.am && hours === 12) hours = 0;
      hours = hours % 12 || 12;
    }

    let timeString = `${hours.toString().padStart(2, '0')}:${this.selectedMinute.toString().padStart(2, '0')}`;
    
    if (this.showSeconds) {
      timeString += `:${this.selectedSecond.toString().padStart(2, '0')}`;
    }

    if (this.timeFormat === '12') {
      timeString += ` ${this.selectedPeriod}`;
    }

    return timeString;
  }

  onFocusInput() {
    if (!this.isOpen) {
      this.open();
    }
  }

  onFocusout(event: FocusEvent) {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    if (!this.elementRef.nativeElement.contains(event.relatedTarget) 
    ) {
      this.close();
    } else {
      this.timePickerInput.nativeElement.focus();
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
    this.isOpen = false;
    this.openChange.emit(false);
  }

  selectHour(hour: number) {
    if (!this.isHourDisabled(hour)) {
      this.selectedHour = hour;
      this.updateTimeDisplay();
      this.scrollToSelectedItem('h'+hour);
    }
  }

  selectMinute(minute: number) {
    if (!this.isMinuteDisabled(minute)) {
      this.selectedMinute = minute;
      this.updateTimeDisplay();
      this.scrollToSelectedItem('m'+minute);
    }
  }

  selectSecond(second: number) {
    this.selectedSecond = second;
    this.updateTimeDisplay();
    this.scrollToSelectedItem('s'+second);
  }

  selectPeriod(period: string) {
    this.selectedPeriod = period;
    this.updateTimeDisplay();
  }

  isHourDisabled(hour: number): boolean {
    if (!this.minTime && !this.maxTime) return false;

    const currentTime = this.formatTime();
    if (this.minTime && currentTime < this.minTime) return true;
    if (this.maxTime && currentTime > this.maxTime) return true;

    return false;
  }

  isMinuteDisabled(minute: number): boolean {
    if (!this.minTime && !this.maxTime) return false;

    const currentTime = this.formatTime();
    if (this.minTime && currentTime < this.minTime) return true;
    if (this.maxTime && currentTime > this.maxTime) return true;

    return false;
  }

  save() {
    const formattedTime = this.formatTime();
    this.form.get('timeInput').setValue(formattedTime);
    this.onChange(formattedTime);
    this.timeChange.emit(formattedTime);
    this.close();
  }

  cancel() {
    this.close();
  }

  private handleDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen) {
      this.close();
    }
  }

  private updateHourRange() {
    this.hours = this.timeFormat === '12' 
      ? Array.from({length: 12}, (_, i) => i + 1)
      : Array.from({length: 24}, (_, i) => i);
  }

  private updateTimeDisplay() {
    if (this.form) {
      const formattedTime = this.formatTime();
      this.form.get('timeInput').setValue(formattedTime, { emitEvent: false });
    }
  }

  scrollToSelectedItem(id: string,behavior: 'smooth'|'auto' = 'smooth',timeout = 0) {
    clearTimeout(this.timeoutId);
    return new Promise((resolve,reject) => {
      if (id) {
        this.timeoutId = setTimeout(() => {
          const selectedElement = this.popupWrapper.nativeElement.querySelector(`#selector_${id}`);
          if (selectedElement) {
            selectedElement.scrollIntoView({ behavior: behavior, block: 'center' });
          }
          resolve(true);
        }, timeout);
      }
    });
  }
    
  async scrollToTime() {
    if (this.selectedHour)
      await this.scrollToSelectedItem('h'+this.selectedHour,'auto');

    if (this.selectedMinute)
      await this.scrollToSelectedItem('m'+this.selectedMinute,'auto');

    if (this.selectedSecond)
      await this.scrollToSelectedItem('s'+this.selectedSecond);
  }
}