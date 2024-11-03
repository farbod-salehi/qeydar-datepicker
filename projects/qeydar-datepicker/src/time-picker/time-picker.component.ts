// time-picker.component.ts
import { Component, ElementRef, forwardRef, Input, OnInit, Output, EventEmitter, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup } from '@angular/forms';
import { CdkOverlayOrigin, ConnectionPositionPair } from '@angular/cdk/overlay';
import { slideMotion } from '../animation/slide';

@Component({
  selector: 'qeydar-time-picker',
  template: `
    <div class="time-picker-wrapper" [formGroup]="form" (click)="$event.stopPropagation()">
      <div class="input-wrapper">
        <input
          #timePickerInput
          type="text"
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
          <div class="time-picker-header">
            <span>Select time</span>
          </div>
          
          <div class="time-picker-content">
            <div class="time-columns">
              <!-- Hours -->
              <div class="time-column">
                <div class="time-scroller">
                  <button
                    *ngFor="let hour of hours"
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
                    [class.selected]="selectedMinute === minute"
                    [class.disabled]="isMinuteDisabled(minute)"
                    (click)="selectMinute(minute)"
                    type="button"
                  >
                    {{ minute.toString().padStart(2, '0') }}
                  </button>
                </div>
              </div>
              
              <!-- AM/PM -->
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
            </div>
          </div>
          
          <div class="time-picker-footer">
            <button class="cancel-btn" (click)="cancel()" type="button">Cancel</button>
            <button class="save-btn" (click)="save()" type="button">Save</button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .time-picker-wrapper {
      display: inline-block;
    }

    .input-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    input {
      font-family: inherit;
      width: 100%;
      padding: 6px 30px 6px 10px;
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
      width: 280px;
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
  @Input() format: '12' | '24' = '12';
  @Input() placement: 'left' | 'right' = 'right';
  @Input() minTime?: string;
  @Input() maxTime?: string;

  @Output() timeChange = new EventEmitter<string>();
  @Output() openChange = new EventEmitter<boolean>();

  @ViewChild('timePickerInput') timePickerInput: ElementRef;
  @ViewChild('popupWrapper') popupWrapper: ElementRef;

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

  hours: number[] = this.format === '12' ? Array.from({length: 12}, (_, i) => i + 1) : Array.from({length: 24}, (_, i) => i);
  minutes: number[] = Array.from({length: 60}, (_, i) => i);
  periods: string[] = ['AM', 'PM'];

  selectedHour: number = 12;
  selectedMinute: number = 0;
  selectedPeriod: string = 'AM';

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
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    this.selectedHour = hours;
    this.selectedMinute = minutes || 0;
    this.selectedPeriod = period || 'AM';
  }

  formatTime(): string {
    let hours = this.selectedHour;
    if (this.format === '12') {
      if (this.selectedPeriod === 'PM' && hours < 12) hours += 12;
      if (this.selectedPeriod === 'AM' && hours === 12) hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${this.selectedMinute.toString().padStart(2, '0')}${this.format === '12' ? ' ' + this.selectedPeriod : ''}`;
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
    }
  }

  selectMinute(minute: number) {
    if (!this.isMinuteDisabled(minute)) {
      this.selectedMinute = minute;
    }
  }

  selectPeriod(period: string) {
    this.selectedPeriod = period;
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
}