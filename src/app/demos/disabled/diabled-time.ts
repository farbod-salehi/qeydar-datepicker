import { Component } from "@angular/core";
import { JalaliDateAdapter } from "projects/qeydar-datepicker/src/date-adapter";


@Component({
    selector: 'disabled-times',
    template: `
        Disabled Times:
        <qeydar-time-picker
            [(ngModel)]="selectedDate"
            [disabledTimesFilter]="disabledTimesFilter"
            [displayFormat]="'HH:mm:ss'"
        >
        </qeydar-time-picker>
        <br>
       
        <button class="toggle-btn" (click)="toggleCode(code)">show code</button>
        <div id="code" class="code" #code>
            <code>
                {{ demoCode }}
            </code>
        </div>
    `,
    standalone: false
})
export class DisabledTimes {
    selectedDate: Date | string;

    // Basic
    disabledTimesFilter = (date: Date) => {
        const hour = date.getHours();
        const minute = date.getMinutes();
        
        // Regular hours
        if (hour < 9 || hour >= 17) return true;
        
        // Break time
        if (hour === 12 && minute >= 30) return true;
        if (hour === 13 && minute < 30) return true;
        
        return false;
    };

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
            selector: 'disabled-times',
            template: \`
                Disabled Times:
                <qeydar-time-picker
                    [(ngModel)]="selectedDate"
                    [disabledTimesFilter]="disabledTimesFilter"
                    [displayFormat]="'HH:mm:ss'"
                >
                </qeydar-time-picker>
            \`,
        })
        export class DisabledTimes {
            selectedDate: Date | string;

            // Basic
            disabledTimesFilter = (date: Date) => {
                const hour = date.getHours();
                const minute = date.getMinutes();
                
                // Regular hours
                if (hour < 9 || hour >= 17) return true;
                
                // Break time
                if (hour === 12 && minute >= 30) return true;
                if (hour === 13 && minute < 30) return true;
                
                return false;
            };
        }
    `;
}