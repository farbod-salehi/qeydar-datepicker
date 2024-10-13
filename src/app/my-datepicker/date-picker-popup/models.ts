export interface CustomLabels {
    label: string,
    value: Array<Date> | 'custom',
    arrow?: boolean
}

export interface YearRange {
    start: number,
    end: number
}

export interface DateRange {
    start: Date,
    end: Date
}

export interface RangeInputLabels {
    start: string,
    end: string,
}

export interface Lang_Locale {
    lastHour: string;
    lastDay: string;
    lastWeek: string;
    lastMonth: string;
    custom: string;
    previousMonth: string;
    nextMonth: string;
    previousYear: string;
    nextYear: string;
    selectDate: string;
    selectMonth: string;
    selectYear: string;
    selectDateRange: string;
    startDate: string;
    endDate: string;
}

export class lang_Fa implements Lang_Locale{
    lastHour:string = "آخرین ساعت";
    lastDay:string = "آخرین روز";
    lastWeek:string = "آخرین هفته";
    lastMonth:string = "آخرین ماه";
    custom:string = "دلخواه";
    previousMonth:string = "ماه قبل";
    nextMonth:string = "ماه بعد";
    previousYear:string = "سال قبل";
    nextYear:string = "سال بعد";
    selectDate:string = "انتخاب تاریخ";
    selectMonth:string = "انتخاب ماه";
    selectYear:string = "انتخاب سال";
    selectDateRange:string = "انتخاب محدوده تاریخ";
    startDate:string = "از تاریخ";
    endDate:string = "تا تاریخ";
}

export class lang_En implements Lang_Locale{
    lastHour:string = "last Hour";
    lastDay:string = "last Day";
    lastWeek:string = "last Week";
    lastMonth:string = "last Month";
    custom:string = "Custom";
    previousMonth:string = "Previous Month";
    nextMonth:string = "Next Month";
    previousYear:string = "Previous Year";
    nextYear:string = "Next Year";
    selectDate:string = "Select date";
    selectMonth:string = "Select month";
    selectYear:string = "Select year";
    selectDateRange:string = "Select date range";
    startDate:string = "Start date";
    endDate:string = "End date";
}