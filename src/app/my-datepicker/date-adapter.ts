import {
  format as formatJalali,
  parse as parseJalali,
  addDays as addDaysJalali,
  addMonths as addMonthsJalali,
  addYears as addYearsJalali,
  addHours as addHoursJalali,
  startOfWeek as startOfWeekJalali,
  startOfMonth as startOfMonthJalali,
  endOfMonth as endOfMonthJalali,
  isSameDay as isSameDayJalali,
  isSameMonth as isSameMonthJalali,
  isSameYear as isSameYearJalali,
  isAfter as isAfterJalali,
  isBefore as isBeforeJalali,
} from 'date-fns-jalali';

import {
  format as formatGregorian,
  parse as parseGregorian,
  addDays as addDaysGregorian,
  addMonths as addMonthsGregorian,
  addYears as addYearsGregorian,
  addHours as addHoursGregorian,
  startOfWeek as startOfWeekGregorian,
  startOfMonth as startOfMonthGregorian,
  endOfMonth as endOfMonthGregorian,
  isSameDay as isSameDayGregorian,
  isSameMonth as isSameMonthGregorian,
  isSameYear as isSameYearGregorian,
  isAfter as isAfterGregorian,
  isBefore as isBeforeGregorian,
} from 'date-fns';

export interface DateAdapter<D> {
  today(): D;
  parse(value: any, formatString: string): D | null;
  format(date: D, formatString: string): string;
  addDays(date: D, amount: number): D;
  addMonths(date: D, amount: number): D;
  addYears(date: D, amount: number): D;
  addHours(date: D, amount: number): D;
  getYear(date: D): number;
  getMonth(date: D): number;
  getDate(date: D): number;
  getDayOfWeek(date: D): number;
  getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
  getDateNames(): string[];
  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[];
  getFirstDayOfWeek(): number;
  getNumDaysInMonth(date: D): number;
  clone(date: D): D;
  createDate(year: number, month: number, date: number): D;
  isSameDay(date1: D, date2: D): boolean;
  isSameMonth(date1: D, date2: D): boolean;
  isSameYear(date1: D, date2: D): boolean;
  isAfter(date1: D, date2: D): boolean;
  isBefore(date1: D, date2: D): boolean;
  startOfMonth(date: D): D;
  endOfMonth(date: D): D;
  startOfWeek(date: D): D;
}

export class JalaliDateAdapter implements DateAdapter<Date> {
  today(): Date {
    return new Date();
  }

  parse(value: any, formatString: string): Date | null {
    return parseJalali(value, formatString, new Date());
  }

  format(date: Date, formatString: string): string {
    return formatJalali(date, formatString);
  }

  addDays(date: Date, amount: number): Date {
    return addDaysJalali(date, amount);
  }

  addMonths(date: Date, amount: number): Date {
    return addMonthsJalali(date, amount);
  }

  addYears(date: Date, amount: number): Date {
    return addYearsJalali(date, amount);
  }

  addHours(date: Date, amount: number): Date {
    return addHoursJalali(date, amount);
  }

  getYear(date: Date): number {
    return parseInt(formatJalali(date, 'yyyy'));
  }

  getMonth(date: Date): number {
    // Jalali months are 1-indexed in date-fns-jalali
    return parseInt(formatJalali(date, 'M')) - 1;
  }

  getDate(date: Date): number {
    return parseInt(formatJalali(date, 'dd'));
  }

  getDayOfWeek(date: Date): number {
    return parseInt(formatJalali(date, 'i')) - 1;
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const jalaliMonths = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];

    switch (style) {
      case 'long':
        return jalaliMonths;
      case 'short':
        return jalaliMonths.map(month => month.substring(0, 3));
      case 'narrow':
        return jalaliMonths.map(month => month.substring(0, 1));
      default:
        return jalaliMonths;
    }
  }

  getDateNames(): string[] {
    return Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const formats = {
      long: 'EEEE',
      short: 'EEE',
      narrow: 'EEEEE'
    };
    return Array.from({ length: 7 }, (_, i) =>
      formatJalali(addDaysJalali(startOfWeekJalali(new Date()), i), formats[style])
    );
  }

  getFirstDayOfWeek(): number {
    return 6; // Saturday is the first day of the week in the Jalali calendar
  }

  getNumDaysInMonth(date: Date): number {
    return parseInt(formatJalali(endOfMonthJalali(date), 'd'));
  }

  clone(date: Date): Date {
    return new Date(date.getTime());
  }

  createDate(year: number, month: number, date: number): Date {
    // Adjust for 0-indexed months in the interface vs 1-indexed months in date-fns-jalali
    return parseJalali(`${year}/${month + 1}/${date}`, 'yyyy/M/d', new Date());
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return isSameDayJalali(date1, date2);
  }

  isSameMonth(date1: Date, date2: Date): boolean {
    return isSameMonthJalali(date1, date2);
  }

  isSameYear(date1: Date, date2: Date): boolean {
    return isSameYearJalali(date1, date2);
  }

  isAfter(date1: Date, date2: Date): boolean {
    return isAfterJalali(date1, date2);
  }

  isBefore(date1: Date, date2: Date): boolean {
    return isBeforeJalali(date1, date2);
  }

  startOfMonth(date: Date): Date {
    return startOfMonthJalali(date);
  }

  endOfMonth(date: Date): Date {
    return endOfMonthJalali(date);
  }

  startOfWeek(date: Date): Date {
    return startOfWeekJalali(date, { weekStartsOn: this.getFirstDayOfWeek() as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  }
}

export class GregorianDateAdapter implements DateAdapter<Date> {
  today(): Date {
    return new Date();
  }

  parse(value: any, formatString: string): Date | null {
    return parseGregorian(value, formatString, new Date());
  }

  format(date: Date, formatString: string): string {
    return formatGregorian(date, formatString);
  }

  addDays(date: Date, amount: number): Date {
    return addDaysGregorian(date, amount);
  }

  addMonths(date: Date, amount: number): Date {
    return addMonthsGregorian(date, amount);
  }

  addYears(date: Date, amount: number): Date {
    return addYearsGregorian(date, amount);
  }

  addHours(date: Date, amount: number): Date {
    return addHoursGregorian(date, amount);
  }

  getYear(date: Date): number {
    return date.getFullYear();
  }

  getMonth(date: Date): number {
    return date.getMonth();
  }

  getDate(date: Date): number {
    return date.getDate();
  }

  getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const formats = {
      long: 'MMMM',
      short: 'MMM',
      narrow: 'MMMMM'
    };
    return Array.from({ length: 12 }, (_, i) =>
      formatGregorian(new Date(2000, i, 1), formats[style])
    );
  }

  getDateNames(): string[] {
    return Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    const formats = {
      long: 'EEEE',
      short: 'EEE',
      narrow: 'EEEEE'
    };
    return Array.from({ length: 7 }, (_, i) =>
      formatGregorian(addDaysGregorian(startOfWeekGregorian(new Date()), i), formats[style])
    );
  }

  getFirstDayOfWeek(): number {
    return 0; // Sunday is the first day of the week in the Gregorian calendar
  }

  getNumDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  clone(date: Date): Date {
    return new Date(date.getTime());
  }

  createDate(year: number, month: number, date: number): Date {
    return new Date(year, month, date);
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return isSameDayGregorian(date1, date2);
  }

  isSameMonth(date1: Date, date2: Date): boolean {
    return isSameMonthGregorian(date1, date2);
  }

  isSameYear(date1: Date, date2: Date): boolean {
    return isSameYearGregorian(date1, date2);
  }

  isAfter(date1: Date, date2: Date): boolean {
    return isAfterGregorian(date1, date2);
  }

  isBefore(date1: Date, date2: Date): boolean {
    return isBeforeGregorian(date1, date2);
  }

  startOfMonth(date: Date): Date {
    return startOfMonthGregorian(date);
  }

  endOfMonth(date: Date): Date {
    return endOfMonthGregorian(date);
  }

  startOfWeek(date: Date): Date {
    return startOfWeekGregorian(date, { weekStartsOn: this.getFirstDayOfWeek() as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
  }
}