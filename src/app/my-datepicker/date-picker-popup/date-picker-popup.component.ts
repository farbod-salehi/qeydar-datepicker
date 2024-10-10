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
      <div *ngIf="mode !== 'range'" class="month-selector" #monthSelector>
        <button 
          *ngFor="let month of monthListNum" 
          [id]="'month_'+month"
          [class.active]="isActiveMonth(month)"
          (click)="selectMonth(month, false)">
          {{ getMonthName(month) }}
        </button>
      </div>
      <div class="calendar">
        <div class="header">
          <button (click)="prevMonth()">&lt;</button>
          <span class="month-year">
            <span class="month-name" (click)="showMonthSelector()">{{ getCurrentMonthName() }}</span>
            <span class="year" (click)="showYearSelector()">{{ getCurrentYear() }}</span>
          </span>
          <button (click)="nextMonth()">&gt;</button>
        </div>
        <div *ngIf="viewMode === 'days'" class="weekdays">
          <span *ngFor="let day of getWeekDays()">{{ day }}</span>
        </div>
        <div *ngIf="viewMode === 'days'" class="days">
          <button *ngFor="let day of days" 
                  [class.different-month]="!isSameMonth(day, currentDate)"
                  [class.selected]="isSelected(day)"
                  [class.in-range]="isInRange(day)"
                  [class.today]="isToday(day)"
                  (click)="selectDate(day)"
                  (mouseenter)="onMouseEnter(day,$event)">
            {{ dateAdapter.getDate(day) }}
            <!-- <span *ngIf="isToday(day)" class="today">.</span> -->
          </button>
        </div>
        <div *ngIf="viewMode === 'months'" class="months">
          <button *ngFor="let month of monthListNum" 
                  [class.selected]="month === dateAdapter.getMonth(currentDate) + 1"
                  (click)="selectMonth(month)">
            {{ getMonthName(month) }}
          </button>
        </div>
        <div *ngIf="viewMode === 'years'" class="years">
          <button *ngFor="let year of yearList" 
                  [class.selected]="year === dateAdapter.getYear(currentDate)"
                  (click)="selectYear(year)">
            {{ year }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host * {
      font-family: 'vazirmatn';
      font-weight: 500;
    }
    .date-picker-popup {
      display: flex;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
      position: absolute;
      top: 107%;
      left: 0;
      z-index: 1000;
      width: fit-content;
      border: 1px solid #ddd;
    }
    .period-selector,.month-selector {
      width: 150px;
      border-inline-end: 1px solid #e0e0e0;
    }
    .month-selector {
      max-height: 19rem;
      overflow: auto; /* Allow scrolling */
      scrollbar-width: none; /* For Firefox */
      -ms-overflow-style: none; /* For Internet Explorer and Edge */
    }
    .month-selector::-webkit-scrollbar {
      display: none; /* For Chrome, Safari, and Opera */
    }
    .period-selector button,.month-selector button {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      width: 100%;
      padding: 10px;
      text-align: start;
      border: none;
      background: none;
      cursor: pointer;
      border-block-end: 1px solid #ddd;
      color: #555;
      transition: background-color 0.3s;
    }
    .period-selector button:hover,.month-selector button:hover {
      background-color: #e6f7ff;
    }
    .period-selector button.active,.month-selector button.active{
      background-color: #bfeaff;
      color: #0175e0;
      width: 100%;
    }
    .arrow {
      float: right;
    }
    .calendar {
      padding: 15px;
      flex-grow: 1;
      background: #FAFAFB;
      width: 15rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .header button {
      background: none;
      border: none;
      font-size: 16px;
      cursor: pointer;
    }
    .header .month-name {
      color: #47366C;
    }
    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      margin-bottom: 5px;
      font-weight: bold;
      color: #888;
      font-size: 14px;
    }
    .weekdays span{
      font-weight: bold;
    }
    .days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }
    .days button {
      position: relative;
      aspect-ratio: 1;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 50%;
      font-size: 14px;
      color: #555;
      transition: background-color 0.3s, color 0.3s;
    }
    .days button:hover {
      background-color: #e6f7ff;
    }
    .days button.different-month {
      color: #ccc;
    }
    .days button.selected {
      background-color: #1890ff;
      color: white;
    }
    .days button.in-range {
      background-color: #e6f7ff;
      color: #1890ff;
    }
    .days button.today {
      border: 3px solid #29b9ff;
    }
    .days button.today span{
      position: absolute;
      bottom: -1rem;
      right: .6rem;
      padding: 0;
      margin: 0;
      font-size: 36px;
      color: mediumpurple;
    }
    .month-year {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .month-name, .year {
      margin: 0 5px;
    }
    .months, .years {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5px;
    }
    .months button, .years button {
      padding: 10px;
      border: none;
      background: none;
      cursor: pointer;
    }
    .months button.selected, .years button.selected {
      background-color: #1890ff;
      color: white;
    }
    // rtl
    :dir(rtl) .date-picker-popup, .rtl.date-picker-popup{
      right: 0 !important;
      left: auto !important;
    }
    :dir(rtl) .arrow,[dir="rtl"] .arrow {
      rotate: 180deg;
    }
  `]
})
export class DatePickerPopupComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() rtl = false;
  @Input() selectedDate: Date | null = null;
  @Input() selectedStartDate: Date | null = null;
  @Input() selectedEndDate: Date | null = null;
  @Input() mode: 'day' | 'month' | 'year' | 'range' = 'day';
  @Input() customLabels: { label: string, value: Date }[] = [];
  @Input() calendarType: 'jalali' | 'georgian' = 'georgian';
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() dateRangeSelected = new EventEmitter<{ start: Date, end: Date }>();

  @ViewChild('monthSelector') monthSelector: ElementRef;

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
  viewMode: 'days' | 'months' | 'years' = 'days';

  constructor(public el: ElementRef) {}

  ngOnInit() {
    this.setDateAdapter();
    this.currentDate =  this.dateAdapter.today();
    this.generateCalendar();
    this.generateYearList();
    this.weekDays = this.dateAdapter.getDayOfWeekNames('short');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['calendarType']) {
      this.setDateAdapter();
    }
    if (changes['selectedDate'] || changes['selectedStartDate'] || changes['selectedEndDate'] || changes['mode'] || changes['calendarType']) {
      this.generateCalendar();
    }
  }

  ngAfterViewInit() {
    this.scrollToSelectedMonth();
  }

  setDateAdapter() {
    this.dateAdapter = this.calendarType === 'jalali' ? new JalaliDateAdapter() : new GregorianDateAdapter();
  }

  generateCalendar() {
    const firstDayOfMonth = this.dateAdapter.startOfMonth(this.currentDate);
    const startDate = this.dateAdapter.startOfWeek(firstDayOfMonth);
    this.days = Array.from({length: 42}, (_, i) => this.dateAdapter.addDays(startDate, i));
  }

  generateYearList() {
    const currentYear = this.dateAdapter.getYear(this.dateAdapter.today());
    this.yearList = Array.from({length: 20}, (_, i) => currentYear - 10 + i);
  }

  scrollToSelectedMonth(month: number|null = null) {
    let monthNum = month || this.selectedDate?.getMonth()! + 1;
    if (this.monthSelector && this.selectedDate) {
      const selectedMonthElement = this.monthSelector.nativeElement.querySelector(`#month_${monthNum}`);
      if (selectedMonthElement) {
        selectedMonthElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  showMonthSelector() {
    this.viewMode = 'months';
  }

  showYearSelector() {
    this.viewMode = 'years';
  }

  selectYear(year: number) {
    this.currentDate = this.dateAdapter.createDate(year, this.dateAdapter.getMonth(this.currentDate), 1);
    this.viewMode = 'months';
    this.generateCalendar();
  }

  selectMonth(month: number, closeAfterSelection: boolean = false) {
    this.currentDate = this.dateAdapter.createDate(this.dateAdapter.getYear(this.currentDate), month - 1, 1);
    if (closeAfterSelection) {
      this.selectDate(this.currentDate);
    } else {
      this.viewMode = 'days';
      this.generateCalendar();
    }
    this.scrollToSelectedMonth(month);
  }

  selectDate(date: Date) {
    if (this.mode === 'range') {
      if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate) || this.dateAdapter.isBefore(date, this.selectedStartDate)) {
        this.selectedStartDate = date;
        this.selectedEndDate = null;
      } else {
        this.selectedEndDate = date;
        this.dateRangeSelected.emit({ start: this.selectedStartDate, end: this.selectedEndDate });
      }
    } else {
      this.dateSelected.emit(date);
    }
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
    this.currentDate = this.dateAdapter.addMonths(this.currentDate, -1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = this.dateAdapter.addMonths(this.currentDate, 1);
    this.generateCalendar();
  }

  isSelected(date: Date): boolean {
    if (this.mode === 'range') {
      return (this.selectedStartDate && this.dateAdapter.isSameDay(date, this.selectedStartDate)) ||
             (this.selectedEndDate && this.dateAdapter.isSameDay(date, this.selectedEndDate));
    } else {
      return this.selectedDate && this.dateAdapter.isSameDay(date, this.selectedDate);
    }
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
}