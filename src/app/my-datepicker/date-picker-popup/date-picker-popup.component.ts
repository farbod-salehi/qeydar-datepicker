import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { DateAdapter, GregorianDateAdapter, JalaliDateAdapter } from '../date-adapter';
import { CustomLabels, DateRange, lang_En, lang_Fa, YearRange } from './models';

@Component({
  selector: 'app-date-picker-popup',
  template: `
    <div class="date-picker-popup" [class.rtl]="rtl">
      <div *ngIf="mode === 'range'" class="period-selector">
        <button *ngFor="let period of periods" 
                [class.active]="isActivePeriod(period)"
                (click)="selectPeriod(period)">
          {{ period.label }}
          <span *ngIf="period.arrow" class="arrow">→</span>
        </button>
      </div>
      <div *ngIf="mode !== 'range'" class="side-selector" #itemSelector>
        <ng-container *ngIf="viewMode == 'days'">
          <button 
            *ngFor="let month of monthListNum" 
            [id]="'selector_'+month"
            [class.active]="isActiveMonth(month)"
            [disabled]="isMonthDisabled(month)"
            (click)="selectMonth(month, false)">
            {{ getMonthName(month) }}
          </button>
        </ng-container>
        <ng-container *ngIf="viewMode == 'months'">
          <button
            *ngFor="let year of yearList" 
            [id]="'selector_'+year"
            [class.active]="isActiveYear(year)"
            [disabled]="isYearDisabled(year)"
            (click)="selectYear(year, true)"
          >
            {{ year }}
          </button>
        </ng-container>
        <ng-container *ngIf="viewMode == 'years'">
          <button
            *ngFor="let yearRange of yearRanges" 
            [id]="'selector_'+yearRange.start"
            [class.active]="isActiveYearRange(yearRange.start)"
            [disabled]="isYearRangeDisabled(yearRange)"
            (click)="selectYearRange(yearRange.start)"
          >
            {{ yearRange.start }} - {{ yearRange.end }}
          </button>
        </ng-container>
      </div>
      <div class="calendar">
        <div class="header">
          <button class="qeydar-calendar-nav-left" (click)="goPrev()" [disabled]="isPrevMonthDisabled()"></button>
          <span class="month-year">
            <span class="month-name" (click)="showMonthSelector()">{{ getCurrentMonthName() }}</span>
            <span class="year" (click)="showYearSelector()">{{ getCurrentYear() }}</span>
          </span>
          <button class="qeydar-calendar-nav-right" (click)="goNext()" [disabled]="isNextMonthDisabled()"></button>
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
  @Input() customLabels: Array<CustomLabels> = [];
  @Input() calendarType: 'jalali' | 'georgian' = 'georgian';
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() dateRangeSelected = new EventEmitter<DateRange>();
  @Output() closePicker = new EventEmitter<void>();

  @ViewChild('itemSelector') itemSelector: ElementRef;

  dateAdapter: DateAdapter<Date>;
  weekDays: string[] = [];
  periods: Array<CustomLabels> = [];
  days: Date[] = [];
  currentDate: Date;
  selectedPeriod: any = '';
  tempEndDate: Date | null = null;
  monthListNum = Array.from({ length: 12 }, (_, i) => i + 1);
  /**
   * Conventional: takes 15 numbers of the year type
   */
  yearList: number[] = [];
  yearRanges: Array<YearRange> = [];
  viewMode: 'days' | 'months' | 'years' = 'days';
  lang = this.calendarType == 'jalali'? lang_Fa: lang_En;

  constructor(public el: ElementRef,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.setDateAdapter();
    this.setInitialDate();
    this.generateCalendar();
    this.weekDays = this.dateAdapter.getDayOfWeekNames('short');
    if (this.mode == 'year') {
      this.showYearSelector();
    }
    this.initLables();
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

  initLables() {
    const today = this.dateAdapter.today();

    if (this.customLabels.length) {
      this.periods = this.customLabels;
    } else {
      if (this.mode == 'range') {
        this.periods = [
          { label: this.lang.lastHour, value: [this.dateAdapter.addHours(today, 0),this.dateAdapter.addHours(today, -1)] },
          { label: this.lang.lastDay, value: [this.dateAdapter.addDays(today, -1), today] },
          { label: this.lang.lastWeek, value: [this.dateAdapter.addDays(today, -7), today], arrow: true },
          { label: this.lang.lastMonth, value: [this.dateAdapter.addMonths(today, -1), today] },
          { label: this.lang.custom, value: 'custom' }
        ]
      }
    }
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
    this.lang = this.calendarType == 'jalali'? lang_Fa: lang_En;
  }

  generateCalendar() {
    const firstDayOfMonth = this.dateAdapter.startOfMonth(this.currentDate);
    const startDate = this.dateAdapter.startOfWeek(firstDayOfMonth);
    this.days = Array.from({length: 42}, (_, i) => this.dateAdapter.addDays(startDate, i));
  }

  scrollToSelectedItem(id: number|null = null) {
    let itemId = id;
    if (id == null) {
      if (this.viewMode == 'days') {
        itemId = this.dateAdapter.getMonth(this.selectedDate) + 1;
      } else if(this.viewMode == 'months') {
        itemId = this.dateAdapter.getYear(this.selectedDate);
      } else {
        let currentYear = this.dateAdapter.getYear(this.selectedDate);
        let currentRange = this.yearRanges.find((range:any) => range.start <= currentYear && range.end >= currentYear);
        itemId = id || currentRange.start;
      }
    }

    if (this.itemSelector && this.selectedDate) {
      setTimeout(() => {
        const selectedMonthElement = this.itemSelector.nativeElement.querySelector(`#selector_${itemId}`);
        if (selectedMonthElement) {
          selectedMonthElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 0);
    }
  }

  showMonthSelector() {
    this.viewMode = 'months';
    this.generateYearList(100);
    this.scrollToSelectedItem(this.dateAdapter.getYear(this.selectedDate));
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
      setTimeout(() => {
        this.viewMode = 'days';
      }, 0);
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

  isActivePeriod(period: CustomLabels) {
    let sameStart,sameEnd;
    if (period.value != 'custom') {
      sameStart = this.dateAdapter.isEqual(
        this.dateAdapter.startOfDay(period.value[0] as Date),
        this.dateAdapter.startOfDay(this.selectedStartDate)
      );
      sameEnd = this.dateAdapter.isEqual(
        this.dateAdapter.startOfDay(period.value[1] as Date),
        this.dateAdapter.startOfDay(this.selectedEndDate)
      );
      period.arrow = sameStart && sameEnd;
      return sameStart && sameEnd;
    }

    period.arrow = !this.periods.find(p => p.arrow)?.arrow;

    return period.arrow;
  }

  selectPeriod(period: CustomLabels) {
    this.selectedPeriod = period.value;
    let start: Date, end: Date;
    if (period.value != 'custom') {
      start = period.value[0];
      end = period.value[1];

      this.dateRangeSelected.emit({ start, end });
      return;
    }
    // if is custom:
    // this.periods = this.periods.map(p => {
    //   // p.arrow = p.value == 'custom';
    //   return p;
    // })
  }

  prevMonth() {
    if (this.isPrevMonthDisabled()) {
      return;
    }
    this.currentDate = this.dateAdapter.addMonths(this.currentDate, -1);
    this.generateCalendar();
    this.scrollToSelectedItem(this.dateAdapter.getMonth(this.currentDate)+1);
  }

  nextMonth() {
    if (this.isNextMonthDisabled()) {
      return;
    }
    this.currentDate = this.dateAdapter.addMonths(this.currentDate, 1);
    this.generateCalendar();
    this.scrollToSelectedItem(this.dateAdapter.getMonth(this.currentDate)+1);
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

  generateYearList(length: number = 15) {
    const currentYear = this.dateAdapter.getYear(this.selectedDate);
    const currentRange = this.yearRanges.find((range:any) => range.start <= currentYear && range.end >= currentYear);
    const startYear = this.dateAdapter.getYear(this.selectedDate) - (Math.round(length/2));
    let start = this.viewMode == 'years'? currentRange.start: startYear;
    
    this.yearList = Array.from({length: length}, (_, i) => start + i);
  }

  selectYearRange(startYear: number) {
    this.yearList = Array.from({length: 15}, (_, i) => startYear + i);
    this.viewMode = 'years';
    this.scrollToSelectedItem(startYear);
  }

  selectYear(year: number, sideSelector = false) {
    if (this.isYearDisabled(year)) {
      return;
    }

    this.currentDate = this.dateAdapter.createDate(year, this.dateAdapter.getMonth(this.currentDate), 1);
    if (this.mode === 'year') {
      this.selectedDate = this.currentDate;
      this.dateSelected.emit(this.currentDate);
      // Close the date picker
      this.closeDatePicker();
      return;
    }
    if (sideSelector) {
      this.currentDate = this.dateAdapter.setYear(this.selectedDate, year);
      this.scrollToSelectedItem(year);
    } else {
      setTimeout(() => {
        this.viewMode = 'months';
      }, 0);
    }
  }

  isActiveYear(year: number) {
    return year == this.dateAdapter.getYear(this.currentDate);
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
    let isDisabled = false;
    const minYear = this.dateAdapter.getYear(this.minDate);
    const maxYear = this.dateAdapter.getYear(this.maxDate);
    if (this.minDate) {
      isDisabled = minYear > year;
    }
    if (this.maxDate) {
      isDisabled = maxYear < year;
    }

    if (this.minDate && this.maxDate) {
      isDisabled = minYear > year || maxYear < year;
    }
    return isDisabled;
  }

  isYearRangeDisabled(yearRange: YearRange): boolean {
    let isDisabled = false;
    const minYear = this.dateAdapter.getYear(this.minDate);
    const maxYear = this.dateAdapter.getYear(this.maxDate);
    if (this.minDate) {
      isDisabled = minYear > yearRange.end;
    }
    if (this.maxDate) {
      isDisabled = maxYear < yearRange.start;
    }

    if (this.minDate && this.maxDate) {
      isDisabled = minYear > yearRange.end || maxYear < yearRange.start;
    }
    return isDisabled;
  }

  isPrevMonthDisabled(): boolean {
    if (this.viewMode == 'days') {
      const prevMonth = this.dateAdapter.getMonth(this.currentDate) - 1;
      const minMonth = this.dateAdapter.getMonth(this.minDate);
      return minMonth > prevMonth;
    }
    if (this.viewMode == 'months') {
      const prevYear = this.dateAdapter.getYear(this.currentDate)-1;
      const minYear = this.dateAdapter.getYear(this.minDate);
      return minYear > prevYear;
    }

    // for this.viewMode == 'years'
    const prevYearRangEnd = this.yearList[this.yearList.length];
    const minYear = this.dateAdapter.getYear(this.minDate);
    return minYear > prevYearRangEnd;
  }

  isNextMonthDisabled(): boolean {
    if (this.viewMode == 'days') {
      const nextMonth = this.dateAdapter.getMonth(this.currentDate) + 1;
      const maxMonth = this.dateAdapter.getMonth(this.maxDate);
      return maxMonth < nextMonth;
    }
    if (this.viewMode == 'months') {
      const nextYear = this.dateAdapter.getYear(this.currentDate)+1;
      const maxYear = this.dateAdapter.getYear(this.maxDate);
      return maxYear < nextYear;
    }

    // for this.viewMode == 'years'
    const nextYearRangStart = this.yearList[0];
    const maxYear = this.dateAdapter.getYear(this.maxDate);
    return maxYear < nextYearRangStart;
  }

  closeDatePicker() {
    this.closePicker.emit();
  }

  goPrev() {
    if (this.viewMode == 'days') {
      this.prevMonth();
      return;
    }

    let id: number;
    if (this.viewMode == 'months') {
      this.currentDate = this.dateAdapter.addYears(this.currentDate, -1);
      id = this.dateAdapter.getYear(this.currentDate);
    }

    if (this.viewMode == 'years') {
      let yearStart = this.yearList[0] - 15;
      this.yearList = Array.from({length: 15}, (_, i) => yearStart + i);
      id = yearStart;
    }

    this.scrollToSelectedItem(id);
  }

  goNext() {
    if (this.viewMode == 'days') {
      this.nextMonth();
      return;
    }

    let id: number;
    if (this.viewMode == 'months') {
      this.currentDate = this.dateAdapter.addYears(this.currentDate, 1);
      id = this.dateAdapter.getYear(this.currentDate);
    }

    if (this.viewMode == 'years') {
      let yearStart = this.yearList[14] + 1;
      this.yearList = Array.from({length: 15}, (_, i) => yearStart + i);
      id = yearStart;
    }

    this.scrollToSelectedItem(id);
  }
}