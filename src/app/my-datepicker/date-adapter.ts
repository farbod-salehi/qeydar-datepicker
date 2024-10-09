import {
  format,
  parse,
  addDays,
  addMonths,
  addYears,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  isSameYear,
  isAfter,
  isBefore,
  Day,
} from 'date-fns-jalali';

export interface DateAdapter<D> {
  today(): D;
  parse(value: any, formatString: string): D | null;
  format(date: D, formatString: string): string;
  addDays(date: D, amount: number): D;
  addMonths(date: D, amount: number): D;
  addYears(date: D, amount: number): D;
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
    return parse(value, formatString, new Date());
  }

  format(date: Date, formatString: string): string {
    return format(date, formatString);
  }

  addDays(date: Date, amount: number): Date {
    return addDays(date, amount);
  }

  addMonths(date: Date, amount: number): Date {
    return addMonths(date, amount);
  }

  addYears(date: Date, amount: number): Date {
    return addYears(date, amount);
  }

  getYear(date: Date): number {
    return parseInt(format(date, 'yyyy'));
  }

  getMonth(date: Date): number {
    return parseInt(format(date, 'MM')) - 1;
  }

  getDate(date: Date): number {
    return parseInt(format(date, 'dd'));
  }

  getDayOfWeek(date: Date): number {
    return parseInt(format(date, 'i')) - 1;
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const formats = {
      long: 'MMMM',
      short: 'MMM',
      narrow: 'MMMMM'
    };
    return Array.from({ length: 12 }, (_, i) =>
      format(new Date(2000, i, 1), formats[style])
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
      format(addDays(startOfWeek(new Date()), i), formats[style])
    );
  }

  getFirstDayOfWeek(): Day {
    return 6 as Day; // Saturday is the first day of the week in the Jalali calendar
  }

  getNumDaysInMonth(date: Date): number {
    return parseInt(format(endOfMonth(date), 'd'));
  }

  clone(date: Date): Date {
    return new Date(date.getTime());
  }

  createDate(year: number, month: number, date: number): Date {
    return new Date(year, month, date);
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return isSameDay(date1, date2);
  }

  isSameMonth(date1: Date, date2: Date): boolean {
    return isSameMonth(date1, date2);
  }

  isSameYear(date1: Date, date2: Date): boolean {
    return isSameYear(date1, date2);
  }

  isAfter(date1: Date, date2: Date): boolean {
    return isAfter(date1, date2);
  }

  isBefore(date1: Date, date2: Date): boolean {
    return isBefore(date1, date2);
  }

  startOfMonth(date: Date): Date {
    return startOfMonth(date);
  }

  endOfMonth(date: Date): Date {
    return endOfMonth(date);
  }

  startOfWeek(date: Date): Date {
    return startOfWeek(date, { weekStartsOn: this.getFirstDayOfWeek() });
  }
}