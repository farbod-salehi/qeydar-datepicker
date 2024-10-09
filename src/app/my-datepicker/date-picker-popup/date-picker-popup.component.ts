// date-picker-popup.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-date-picker-popup',
  template: `
    <div class="date-picker-popup" [class.rtl]="rtl">
      <div class="period-selector">
        <button *ngFor="let period of periods" 
                [class.active]="selectedPeriod === period.value"
                (click)="selectPeriod(period.value)">
          {{ period.label }}
          <span *ngIf="period.arrow" class="arrow">→</span>
        </button>
      </div>
      <div class="calendar">
        <div class="header">
          <button (click)="prevMonth()">&lt;</button>
          <span class="month-name">{{ currentMonth | uppercase }}</span>
          <button (click)="nextMonth()">&gt;</button>
        </div>
        <div class="weekdays">
          <span *ngFor="let day of weekDays">{{ day }}</span>
        </div>
        <div class="days">
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
      width: 400px;
      border: 1px solid #ddd;
    }
    .period-selector {
      width: 150px;
      border-inline-end: 1px solid #e0e0e0;
    }
    .period-selector button {
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
    .period-selector button:hover {
      background-color: #e6f7ff;
    }
    .period-selector button.active {
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
export class DatePickerPopupComponent implements OnInit, OnChanges {
  @Input() rtl = false;
  @Input() selectedDate: Date | null = null;
  @Input() selectedStartDate: Date | null = null;
  @Input() selectedEndDate: Date | null = null;
  @Input() isRangeMode = false;
  @Input() customLabels: { label: string, value: Date }[] = [];
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() dateRangeSelected = new EventEmitter<{ start: Date, end: Date }>();

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

  ngOnInit() {
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDate'] || changes['selectedStartDate'] || changes['selectedEndDate']) {
      this.generateCalendar();
    }
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
    if (this.isRangeMode) {
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
    if (this.isRangeMode) {
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
}