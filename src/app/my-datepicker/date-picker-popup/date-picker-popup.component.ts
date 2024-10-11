import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { DateAdapter, GregorianDateAdapter, JalaliDateAdapter } from '../date-adapter';

@Component({
  selector: 'app-date-picker-popup',
  template: `
    <div class="date-picker-popup" [class.rtl]="rtl">
      <div *ngIf="mode === 'range'" class="period-selector">
        <button *ngFor="let period of periods" 
                [class.active]="selectedPeriod === period.value"
                (click)="selectPeriod(period.value)">
          {{ period.label }}
          <span *ngIf="period.arrow" class="arrow">→</span>
        </button>
      </div>
      <div *ngIf="mode !== 'range'" class="month-selector" #itemSelector>
        <ng-container *ngIf="viewMode != 'years';else yearSelector">
          <button 
            *ngFor="let month of monthListNum" 
            [id]="'selector_'+month"
            [class.active]="isActiveMonth(month)"
            [disabled]="isMonthDisabled(month)"
            (click)="selectMonth(month, false)">
            {{ getMonthName(month) }}
          </button>
        </ng-container>
        <ng-template #yearSelector>
          <button
            *ngFor="let yearRange of yearRanges" 
            [id]="'selector_'+yearRange.start"
            [class.active]="isActiveYearRange(yearRange.start)"
            [disabled]="isYearRangeDisabled(yearRange)"
            (click)="selectYearRange(yearRange.start)"
          >
            {{ yearRange.start }} - {{ yearRange.end }}
          </button>
        </ng-template>
      </div>
      <div class="calendar">
        <div class="header">
          <button (click)="prevMonth()" [disabled]="isPrevMonthDisabled()">&lt;</button>
          <span class="month-year">
            <span class="month-name" (click)="showMonthSelector()">{{ getCurrentMonthName() }}</span>
            <span class="year" (click)="showYearSelector()">{{ getCurrentYear() }}</span>
          </span>
          <button (click)="nextMonth()" [disabled]="isNextMonthDisabled()">&gt;</button>
        </div>
        <div *ngIf="viewMode == 'days'">
          <div *ngIf="viewMode === 'days'" class="weekdays">
            <span *ngFor="let day of getWeekDays()">{{ day }}</span>
          </div>
          <div *ngIf="viewMode === 'days'" class="days">
            <button *ngFor="let day of days" 
                  [class.different-month]="!isSameMonth(day, currentDate)"
                  [class.selected]="isSelected(day)"
                  [class.in-range]="isInRange(day)"
                  [class.range-start]="isRangeStart(day)"
                  [class.range-end]="isRangeEnd(day)"
                  [class.today]="isToday(day)"
                  [disabled]="isDateDisabled(day)"
                  (click)="selectDate(day)"
                  (mouseenter)="onMouseEnter(day,$event)">
              {{ dateAdapter.getDate(day) }}
            </button>
          </div>
        </div>
        <div *ngIf="viewMode === 'months' || mode == 'month'" class="months">
          <button *ngFor="let month of monthListNum" 
                  [class.selected]="month === dateAdapter.getMonth(currentDate) + 1"
                  [disabled]="isMonthDisabled(month)"
                  (click)="selectMonth(month,false)">
            {{ getMonthName(month) }}
          </button>
        </div>
        <div *ngIf="viewMode === 'years' || mode == 'year'" class="years">
          <button *ngFor="let year of yearList" 
                  [class.selected]="year === dateAdapter.getYear(currentDate)"
                  [disabled]="isYearDisabled(year)"
                  (click)="selectYear(year)">
            {{ year }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./date-picker-popup.component.scss']
})
export class DatePickerPopupComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() rtl = false;
  @Input() selectedDate: Date | null = null;
  @Input() selectedStartDate: Date | null = null;
  @Input() selectedEndDate: Date | null = null;
  @Input() mode: 'day' | 'month' | 'year' | 'range' = 'day';
  @Input() customLabels: { label: string, value: Date }[] = [];
  @Input() calendarType: 'jalali' | 'georgian' = 'georgian';
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() dateRangeSelected = new EventEmitter<{ start: Date, end: Date }>();
  @Output() closePicker = new EventEmitter<void>();

  @ViewChild('itemSelector') itemSelector: ElementRef;

  dateAdapter: DateAdapter<Date>;
  weekDays: string[] = [];
  periods = [
    { label: 'Last hour', value: 'hour' },
    { label: 'Last day', value: 'day' },
    { label: 'Last week', value: 'week', arrow: true },
    { label: 'Last month', value: 'month' },
    { label: 'Custom', value: 'custom' }
  ];
  days: Date[] = [];
  currentDate: Date;
  selectedPeriod: string = '';
  tempEndDate: Date | null = null;
  monthListNum = Array.from({ length: 12 }, (_, i) => i + 1);
  yearList: number[] = [];
  yearRanges: { start: number, end: number }[] = [];
  viewMode: 'days' | 'months' | 'years' = 'days';

  constructor(public el: ElementRef) {}

  ngOnInit() {
    this.setDateAdapter();
    this.setInitialDate();
    this.generateCalendar();
    this.weekDays = this.dateAdapter.getDayOfWeekNames('short');
    if (this.mode == 'year') {
      this.showYearSelector();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['calendarType']) {
      this.setDateAdapter();
    }
    if (changes['selectedDate'] || changes['selectedStartDate'] || changes['selectedEndDate'] || changes['mode'] || changes['calendarType']) {
      this.setInitialDate();
      this.generateCalendar();
    }
    if (changes['minDate'] || changes['maxDate']) {
      this.adjustCurrentDateToValidRange();
    }
    if (changes['selectedStartDate'] || changes['selectedEndDate']) {
      this.setInitialDate();
      this.generateCalendar();
    }
  }

  ngAfterViewInit() {
    this.scrollToSelectedItem();
  }

  setInitialDate() {
    if (this.mode === 'range' && this.selectedStartDate) {
      this.currentDate = this.selectedStartDate;
    } else if (this.selectedDate) {
      this.currentDate = this.selectedDate;
    } else {
      this.currentDate = this.dateAdapter.today();
    }

    switch (this.mode) {
      case 'day':
        this.viewMode = 'days'
        break;
      case 'month':
        this.viewMode = 'months'
        break;
      case 'year':
        this.viewMode = 'years'
        break;
      default:
        break;
    }

    this.adjustCurrentDateToValidRange();
  }

  setDateAdapter() {
    this.dateAdapter = this.calendarType === 'jalali' ? new JalaliDateAdapter() : new GregorianDateAdapter();
  }

  generateCalendar() {
    const firstDayOfMonth = this.dateAdapter.startOfMonth(this.currentDate);
    const startDate = this.dateAdapter.startOfWeek(firstDayOfMonth);
    this.days = Array.from({length: 42}, (_, i) => this.dateAdapter.addDays(startDate, i));
  }

  scrollToSelectedItem(id: number|null = null) {
    let itemId;
    if (this.viewMode != 'years') {
      itemId = id || this.selectedDate?.getMonth()! + 1;
    } else {
      let currentYear = this.dateAdapter.getYear(this.selectedDate);
      let currentRange = this.yearRanges.find((range:any) => range.start <= currentYear && range.end >= currentYear);
      itemId = id || currentRange.start;
    }
    if (this.itemSelector && this.selectedDate) {
      const selectedMonthElement = this.itemSelector.nativeElement.querySelector(`#selector_${itemId}`);
      if (selectedMonthElement) {
        selectedMonthElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  showMonthSelector() {
    this.viewMode = 'months';
  }

  selectMonth(month: number, closeAfterSelection: boolean = false) {
    if (this.isMonthDisabled(month)) {
      return;
    }
    this.currentDate = this.dateAdapter.createDate(this.dateAdapter.getYear(this.currentDate), month - 1, 1);
    if (this.mode === 'month' || closeAfterSelection) {
      this.selectedDate = this.currentDate;
      this.dateSelected.emit(this.currentDate);
      // Close the date picker
      this.closeDatePicker();
    } else {
      this.viewMode = 'days';
      this.generateCalendar();
    }
    this.scrollToSelectedItem(month);
  }

  selectDate(date: Date) {
    if (this.isDateDisabled(date)) {
      return;
    }
    if (this.mode === 'range') {
      if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate) || this.dateAdapter.isBefore(date, this.selectedStartDate)) {
        this.selectedStartDate = date;
        this.selectedEndDate = null;
      } else {
        this.selectedEndDate = date;
        this.dateRangeSelected.emit({ start: this.selectedStartDate, end: this.selectedEndDate });
      }
    } else {
      this.selectedDate = date;
      this.dateSelected.emit(date);
    }
    this.currentDate = date;
  }

  selectPeriod(period: string) {
    this.selectedPeriod = period;
    const today = this.dateAdapter.today();
    let start: Date, end: Date;

    switch (period) {
      case 'hour':
        start = this.dateAdapter.addHours(today, -1);
        end = today;
        break;
      case 'day':
        start = this.dateAdapter.addDays(today, -1);
        end = today;
        break;
      case 'week':
        start = this.dateAdapter.addDays(today, -7);
        end = today;
        break;
      case 'month':
        start = this.dateAdapter.addMonths(today, -1);
        end = today;
        break;
      case 'custom':
        return; // Don't emit for custom, wait for user selection
    }

    this.dateRangeSelected.emit({ start, end });
  }

  prevMonth() {
    if (this.isPrevMonthDisabled()) {
      return;
    }
    this.currentDate = this.dateAdapter.addMonths(this.currentDate, -1);
    this.generateCalendar();
  }

  nextMonth() {
    if (this.isNextMonthDisabled()) {
      return;
    }
    this.currentDate = this.dateAdapter.addMonths(this.currentDate, 1);
    this.generateCalendar();
  }

  isSelected(date: Date): boolean {
    if (this.mode === 'range') {
      return this.isRangeStart(date) || this.isRangeEnd(date);
    } else {
      return this.selectedDate && this.dateAdapter.isSameDay(date, this.selectedDate);
    }
  }

  isRangeStart(date: Date): boolean {
    return this.mode === 'range' && this.selectedStartDate && this.dateAdapter.isSameDay(date, this.selectedStartDate);
  }

  isRangeEnd(date: Date): boolean {
    return this.mode === 'range' && this.selectedEndDate && this.dateAdapter.isSameDay(date, this.selectedEndDate);
  }

  isInRange(date: Date): boolean {
    return this.mode === 'range' && this.selectedStartDate && (this.selectedEndDate || this.tempEndDate) &&
           this.dateAdapter.isAfter(date, this.selectedStartDate) &&
           this.dateAdapter.isBefore(date, this.selectedEndDate || this.tempEndDate);
  }

  isToday(date: Date): boolean {
    return this.dateAdapter.isSameDay(date, this.dateAdapter.today());
  }

  onMouseEnter(date: Date, event: Event) {
    if (this.mode === 'range' && this.selectedStartDate && !this.selectedEndDate) {
      this.tempEndDate = date;
    }
  }

  getMonthName(month: number): string {
    return this.dateAdapter.getMonthNames('long')[month - 1];
  }

  getCurrentMonthName(): string {
    return this.dateAdapter.getMonthNames('long')[this.dateAdapter.getMonth(this.currentDate)];
  }

  getCurrentYear(): number {
    return this.dateAdapter.getYear(this.currentDate);
  }

  getWeekDays(): string[] {
    return this.weekDays;
  }

  isActiveMonth(month: number): boolean {
    return this.dateAdapter.getMonth(this.currentDate) === month - 1;
  }

  isSameMonth(date1: Date, date2: Date): boolean {
    return this.dateAdapter.isSameMonth(date1, date2);
  }

  // year section
  showYearSelector() {
    this.viewMode = 'years';
    this.generateYearRanges();
    this.generateYearList();
    this.scrollToSelectedItem();
  }

  generateYearRanges() {
    const currentYear = this.dateAdapter.getYear(this.dateAdapter.today());
    const startYear = Math.floor(currentYear / 15) * 15 - 90; // Start 6 ranges before the current year
    this.yearRanges = [];
    for (let i = 0; i < 15; i++) {
      const start = startYear + i * 15;
      this.yearRanges.push({ start, end: start + 14 });
    }
  }

  generateYearList() {
    const currentYear = this.dateAdapter.getYear(this.selectedDate);
    const currentRange = this.yearRanges.find((range:any) => range.start <= currentYear && range.end >= currentYear);
    this.yearList = Array.from({length: 15}, (_, i) => currentRange.start + i);
  }

  selectYearRange(startYear: number) {
    this.yearList = Array.from({length: 15}, (_, i) => startYear + i);
    this.viewMode = 'years';
    this.scrollToSelectedItem(startYear);
  }

  selectYear(year: number) {
    if (this.isYearDisabled(year)) {
      return;
    }

    this.currentDate = this.dateAdapter.createDate(year, this.dateAdapter.getMonth(this.currentDate), 1);
    if (this.mode === 'year') {
      this.selectedDate = this.currentDate;
      this.dateSelected.emit(this.currentDate);
      // Close the date picker
      this.closeDatePicker();
    } else {
      this.viewMode = 'months';
      this.generateCalendar();
    }
  }

  isActiveYearRange(startYear: number) {
    return startYear == this.yearList[0];
  }

  adjustCurrentDateToValidRange() {
    let adjustedDate = this.currentDate;
    if (this.minDate && this.dateAdapter.isBefore(adjustedDate, this.minDate)) {
      adjustedDate = this.minDate;
    } else if (this.maxDate && this.dateAdapter.isAfter(adjustedDate, this.maxDate)) {
      adjustedDate = this.maxDate;
    }

    // Ensure we're not changing the date unnecessarily
    if (!this.dateAdapter.isSameDay(this.currentDate, adjustedDate)) {
      this.currentDate = adjustedDate;
      this.generateCalendar();
    }
  }

  isDateDisabled(date: Date): boolean {
    return (this.minDate && this.dateAdapter.isBefore(date, this.minDate)) ||
           (this.maxDate && this.dateAdapter.isAfter(date, this.maxDate));
  }

  isMonthDisabled(month: number): boolean {
    const year = this.dateAdapter.getYear(this.currentDate);
    const startOfMonth = this.dateAdapter.createDate(year, month - 1, 1);
    const endOfMonth = this.dateAdapter.endOfMonth(startOfMonth);
    return this.isDateDisabled(startOfMonth) && this.isDateDisabled(endOfMonth);
  }

  isYearDisabled(year: number): boolean {
    const startOfYear = this.dateAdapter.createDate(year, 0, 1);
    const endOfYear = this.dateAdapter.createDate(year, 11, 31);
    return this.isDateDisabled(startOfYear) && this.isDateDisabled(endOfYear);
  }

  isYearRangeDisabled(yearRange: { start: number, end: number }): boolean {
    return this.isYearDisabled(yearRange.start) && this.isYearDisabled(yearRange.end);
  }

  isPrevMonthDisabled(): boolean {
    const prevMonth = this.dateAdapter.addMonths(this.currentDate, -1);
    return this.isDateDisabled(prevMonth);
  }

  isNextMonthDisabled(): boolean {
    const nextMonth = this.dateAdapter.addMonths(this.currentDate, 1);
    return this.isDateDisabled(nextMonth);
  }

  closeDatePicker() {
    this.closePicker.emit();
  }
}