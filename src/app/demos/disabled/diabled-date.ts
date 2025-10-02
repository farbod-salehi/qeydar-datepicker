import { Component } from "@angular/core";
import { JalaliDateAdapter } from "projects/qeydar-datepicker/src/date-adapter";


@Component({
    selector: 'disabled-dates',
    template: `
        Gregorian:
        <qeydar-date-picker
            [(ngModel)]="selectedDate"
            [disabledDates]="disabledDates"
            [disabledDatesFilter]="disabledDatesFilter"
        >
        </qeydar-date-picker>
        <br>
        Jalali:
        <qeydar-date-picker
            dir="rtl"
            [rtl]="true"
            [calendarType]="'jalali'"
            [disabledDates]="disabledDatesJalali"
            [disabledDatesFilter]="disabledDatesFilterJalali"
            [(ngModel)]="selectedDate"
        >
        </qeydar-date-picker>
        <br>
        Month:
        <qeydar-date-picker
            [(ngModel)]="selectedDate"
            [mode]="'month'"
            [disabledDatesFilter]="disabledDatesFilterMonth"
        >
        </qeydar-date-picker>
        <br>
        Year:
        <qeydar-date-picker
            [(ngModel)]="selectedDate"
            [mode]="'year'"
            [disabledDatesFilter]="disabledDatesFilterYear"
        >
        </qeydar-date-picker>
        <br>
        Combining with Time:
        <qeydar-date-picker
            [format]="'yyyy/MM/dd HH:mm'"
            [disabledDatesFilter]="disabledDatesFilterCombined"
            [disabledTimesFilter]="disabledTimesFilter"
            [(ngModel)]="selectedDate"
        >
        </qeydar-date-picker>
        <button class="toggle-btn" (click)="toggleCode(code)">show code</button>
        <div id="code" class="code" #code>
            <code>
                {{ demoCode }}
            </code>
        </div>
    `,
    standalone: false
})
export class DisabledDates {
    selectedDate: Date | string;

    // Basic
    disabledDates = [
        new Date(), // Disables current date
        '2024/12/05',
        '2024/12/07'
    ];
    disabledDatesFilter = (date: Date) => {
        const day = date.getDay();
        // weekends: Saturday (6) and Sunday (0)
        return day === 0 || day === 6;
    };

    // Jalali
    disabledDatesJalali = [
        '1403/09/01',
        '1403/09/15',
        '1403/10/01',
        new Date(2024, 8, 15), // September 15, 2024
        new Date(2024, 11, 25), // December 25, 2024
        new Date() //today
    ];
    disabledDatesFilterJalali = (date: Date) => {
        const year = this.jalali.getYear(date)
        const month = this.jalali.getMonth(date);
        // Disable 1407 year and every Farvardin (0) and Ordibehesht (1) months
        return year == 1407 || month === 0 || month === 1;
    };

    // Disabled month
    disabledDatesFilterMonth = (date: Date) => {
        const month = date.getMonth();
        // Disables even months
        return month % 2 === 0;
    };

    // Disabled Year
    disabledDatesFilterYear = (date: Date) => {
        const year = date.getFullYear();
        let yearRange = []
        for (let i = 1; i <= 20; i++) {
            let startYear = 1996;
            yearRange.push(startYear+i)
        }
        let entryYear = year == 2019 || year == 2021 || year == 2026 || year == 2027 || year == 2030;
        return yearRange.includes(year) || entryYear;
    };

    // Combining Time Restrictions
    disabledDatesFilterCombined = (date: Date) => {
        const weekDay = date.getDay();
        return weekDay === 5; // Disable Fridays
    };
    disabledTimesFilter = (date: Date) => {
        const hour = date.getHours();
        const weekDay = date.getDay();

        // Disable:
        // - Before 9 AM and after 5 PM on weekdays
        // - All hours on weekends
        if (weekDay === 0 || weekDay === 6) return true;
        return hour < 9 || hour >= 17;
    };
    
    /**
     *
     */
    constructor(private jalali: JalaliDateAdapter) {
    }

    toggleCode(elm: HTMLDivElement) {
        let display = elm.style.display;
        if (display != 'block') {
          elm.style.display = 'block';
        } else {
          elm.style.display = 'none';
        }  
    }

    demoCode = `
        @Component({
        selector: 'disabled-dates',
        template: \`
            Gregorian:
            <qeydar-date-picker
                [(ngModel)]="selectedDate"
                [disabledDates]="disabledDates"
                [disabledDatesFilter]="disabledDatesFilter"
            >
            </qeydar-date-picker>
            <br>
            Jalali:
            <qeydar-date-picker
                dir="rtl"
                [rtl]="true"
                [calendarType]="'jalali'"
                [disabledDates]="disabledDatesJalali"
                [disabledDatesFilter]="disabledDatesFilterJalali"
                [(ngModel)]="selectedDate"
            >
            </qeydar-date-picker>
            <br>
            Month:
            <qeydar-date-picker
                [(ngModel)]="selectedDate"
                [mode]="'month'"
                [disabledDatesFilter]="disabledDatesFilterMonth"
            >
            </qeydar-date-picker>
            <br>
            Year:
            <qeydar-date-picker
                [(ngModel)]="selectedDate"
                [mode]="'year'"
                [disabledDatesFilter]="disabledDatesFilterYear"
            >
            </qeydar-date-picker>
            <br>
            Combining with Time:
            <qeydar-date-picker
                [format]="'yyyy/MM/dd HH:mm'"
                [disabledDatesFilter]="disabledDatesFilterCombined"
                [disabledTimesFilter]="disabledTimesFilter"
                [(ngModel)]="selectedDate"
            >
            </qeydar-date-picker>
        \`,
    })
    export class DisabledDates {
        selectedDate: Date | string;

        // Basic
        disabledDates = [
            new Date(), // Disables current date
            '2024/12/05',
            '2024/12/07'
        ];
        disabledDatesFilter = (date: Date) => {
            const day = date.getDay();
            // weekends: Saturday (6) and Sunday (0)
            return day === 0 || day === 6;
        };

        // Jalali
        disabledDatesJalali = [
            '1403/09/01',
            '1403/09/15',
            '1403/10/01',
            new Date(2024, 8, 15), // September 15, 2024
            new Date(2024, 11, 25), // December 25, 2024
            new Date() //today
        ];
        disabledDatesFilterJalali = (date: Date) => {
            const year = this.jalali.getYear(date)
            const month = this.jalali.getMonth(date);
            // Disable 1407 year and every Farvardin(0) and Ordibehesht(1)
            return year == 1407 || month === 0 || month === 1;
        };

        // Disabled month
        disabledDatesFilterMonth = (date: Date) => {
            const month = date.getMonth();
            // Disables even months
            return month % 2 === 0;
        };

        // Disabled Year
        disabledDatesFilterYear = (date: Date) => {
            const year = date.getFullYear();
            let yearRange = []
            for (let i = 1; i <= 20; i++) {
                let startYear = 1996;
                yearRange.push(startYear+i)
            }
            let entryYear = year == 2019 || year == 2021 || year == 2026 || year == 2027 || year == 2030;
            return yearRange.includes(year) || entryYear;
        };

        // Combining Time Restrictions
        disabledDatesFilterCombined = (date: Date) => {
            const weekDay = date.getDay();
            return weekDay === 5; // Disable Fridays
        };
        disabledTimesFilter = (date: Date) => {
            const hour = date.getHours();
            const weekDay = date.getDay();

            // Disable:
            // - Before 9 AM and after 5 PM on weekdays
            // - All hours on weekends
            if (weekDay === 0 || weekDay === 6) return true;
            return hour < 9 || hour >= 17;
        };

        constructor(private jalali: JalaliDateAdapter) {}
    }
    `;
}