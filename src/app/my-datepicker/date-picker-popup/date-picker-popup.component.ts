// date-picker-popup.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef,AfterViewInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-date-picker-popup',
  template: `
    <div class="date-picker-popup" [class.rtl]="rtl">
      <div *ngIf="mode === 'range'" class="period-selector">
        <!-- ... (keep existing period-selector code) ... -->
      </div>
      <div *ngIf="mode !== 'range'" class="month-selector" #monthSelector>
        <button 
          *ngFor="let month of monthListNum" 
          [id]="'month_'+month"
          [class.active]="isActiveMonth(month)"
          (click)="selectMonth(month)"
        >
          {{ getMonthName(month) }}
        </button>
      </div>
      <div class="calendar">
        <div class="header">
          <button (click)="prevMonth()">&lt;</button>
          <span class="month-year">
            <span class="month-name" (click)="showMonthSelector()">{{ currentMonth | uppercase }}</span>
            <span class="year" (click)="showYearSelector()">{{ currentYear }}</span>
          </span>
          <button (click)="nextMonth()">&gt;</button>
        </div>
        <div *ngIf="viewMode === 'days'" class="weekdays">
          <span *ngFor="let day of weekDays">{{ day }}</span>
        </div>
        <div *ngIf="viewMode === 'days'" class="days">
          <button *ngFor="let day of days" 
                  [class.different-month]="day.getMonth() !== currentDate.getMonth()"
                  [class.selected]="isSelected(day)"
                  [class.in-range]="isInRange(day)"
                  [class.today]="isToday(day)"
                  (click)="selectDate(day)"
                  (mouseenter)="onMouseEnter(day,$event)">
            {{ day.getDate() }}
            <span *ngIf="isToday(day)" class="today">.</span>
          </button>
        </div>
        <div *ngIf="viewMode === 'months'" class="months">
          <button *ngFor="let month of monthListNum" 
                  [class.selected]="month === currentDate.getMonth() + 1"
                  (click)="selectMonth(month)">
            {{ getMonthName(month) }}
          </button>
        </div>
        <div *ngIf="viewMode === 'years'" class="years">
          <button *ngFor="let year of yearList" 
                  [class.selected]="year === currentDate.getFullYear()"
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
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() dateRangeSelected = new EventEmitter<{ start: Date, end: Date }>();

  @ViewChild('monthSelector') monthSelector: ElementRef;

  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  periods = [
    { label: 'Last hour', value: 'hour' },
    { label: 'Last day', value: 'day' },
    { label: 'Last week', value: 'week', arrow: true },
    { label: 'Last month', value: 'month' },
    { label: 'Custom', value: 'custom' }
  ];
  days: Date[] = [];
  currentDate = new Date();
  currentMonth: string = '';
  currentYear: number = 0;
  selectedPeriod: string = '';
  tempEndDate: Date | null = null;
  monthListNum = Array.from({ length: 12 }, (_, i) => i + 1);
  yearList: number[] = [];
  viewMode: 'days' | 'months' | 'years' = 'days';

  constructor(public el: ElementRef) {}

  ngOnInit() {
    this.generateCalendar();
    this.generateYearList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDate'] || changes['selectedStartDate'] || changes['selectedEndDate'] || changes['mode']) {
      this.generateCalendar();
    }
  }

  ngAfterViewInit() {
    this.scrollToSelectedMonth();
  }

  generateCalendar(month: number = this.currentDate.getMonth(), year: number = this.currentDate.getFullYear()) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    this.currentMonth = firstDay.toLocaleString('default', { month: 'long' });

    this.days = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevMonthDay = new Date(year, month, -i);
      this.days.unshift(prevMonthDay);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.days.push(new Date(year, month, i));
    }
    const remainingDays = 42 - this.days.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.days.push(new Date(year, month + 1, i));
    }

    this.currentYear = year;
  }

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.yearList = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
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
    this.currentDate.setFullYear(year);
    this.viewMode = 'months';
    this.generateCalendar(this.currentDate.getMonth(), year);
  }

  selectMonth(month: number) {
    this.currentDate.setMonth(month);
    this.viewMode = 'days';
    this.generateCalendar(this.currentDate.getMonth(), this.currentDate.getFullYear());
    this.scrollToSelectedMonth(month);
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar(this.currentDate.getMonth(), this.currentDate.getFullYear());
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar(this.currentDate.getMonth(), this.currentDate.getFullYear());
  }

  selectPeriod(period: string) {
    this.selectedPeriod = period;
    const today = new Date();
    let start: Date, end: Date;

    switch (period) {
      case 'hour':
        start = new Date(today.getTime() - 60 * 60 * 1000);
        end = today;
        break;
      case 'day':
        start = new Date(today.setDate(today.getDate() - 1));
        end = new Date();
        break;
      case 'week':
        start = new Date(today.setDate(today.getDate() - 7));
        end = new Date();
        break;
      case 'month':
        start = new Date(today.setMonth(today.getMonth() - 1));
        end = new Date();
        break;
      case 'custom':
        return; // Don't emit for custom, wait for user selection
    }

    // @ts-ignore
    this.dateRangeSelected.emit({ start, end });
  }

  selectCustomLabel(date: Date) {
    this.dateSelected.emit(date);
  }

  selectDate(date: Date) {
    if (this.mode === 'range') {
      if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate) || date < this.selectedStartDate) {
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

  isSelected(date: Date): boolean|any {
    if (this.mode === 'range') {
      return (this.selectedStartDate && date.toDateString() === this.selectedStartDate.toDateString()) ||
             (this.selectedEndDate && date.toDateString() === this.selectedEndDate.toDateString()) ||
             (this.tempEndDate && date.toDateString() === this.tempEndDate.toDateString());
    } else {
      return this.selectedDate && date.toDateString() === this.selectedDate.toDateString();
    }
  }

  isInRange(date: Date): boolean|any {
    // @ts-ignore
    return this.isRangeMode && this.selectedStartDate && (this.selectedEndDate || this.tempEndDate) && date > this.selectedStartDate && (date < this.selectedEndDate || date < this.tempEndDate);
  }

  isToday(date: Date) {
    let isToday;
    return date.toDateString() == new Date().toDateString();
  }

  onMouseEnter(date: Date, e:Event) {
    this.tempEndDate = date;
  }

  getMonthName(month: number): string {
    let date = new Date(this.currentDate.getFullYear(), month, 1);
    return date.toLocaleString('default', { month: 'long' });
  }

  isActiveMonth(month: number): boolean {
    return this.currentDate.getMonth() == month;
  }
}