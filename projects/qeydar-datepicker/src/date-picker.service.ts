import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { lang_En, lang_Fa, Lang_Locale } from "./date-picker-popup/models";

export interface ValidTimeResult {
  isValid: boolean;
  normalizedTime: string;
}

@Injectable()
export class QeydarDatePickerService {
  activeInput$: BehaviorSubject<string> = new BehaviorSubject('');
  locale: Lang_Locale;
  /**
   *
   */
  constructor(public locale_fa: lang_Fa, public locale_en: lang_En) {
  }

  getActiveInputValue() {
    return this.activeInput$.getValue();
  }

  validateTime(value: string, timeFormat: '12' | '24', locale: Lang_Locale, showSeconds: boolean = false): ValidTimeResult {
    if (!value) {
      return { isValid: false, normalizedTime: '' };
    }

    // Remove multiple spaces and trim
    value = value.replace(/\s+/g, ' ').trim();

    try {
      // Split into time and period parts
      let [timePart, periodPart] = value.split(' ');
      let timeComponents = timePart.split(':');

      // Basic format validation
      if (!timeComponents.length || timeComponents.length > 3) {
        return { isValid: false, normalizedTime: value };
      }

      // Parse components
      let hours = parseInt(timeComponents[0], 10);
      let minutes = parseInt(timeComponents[1], 10);
      let seconds = timeComponents[2] ? parseInt(timeComponents[2], 10) : 0;

      // Validate ranges
      if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        return { isValid: false, normalizedTime: value };
      }

      // Validate hours based on format
      if (timeFormat === '24') {
        if (hours < 0 || hours > 23) {
          return { isValid: false, normalizedTime: value };
        }
        if (periodPart) { // 24-hour format shouldn't have AM/PM
          return { isValid: false, normalizedTime: value };
        }
      } else {
        if (hours < 1 || hours > 12) {
          return { isValid: false, normalizedTime: value };
        }

        // Check for valid period in multiple formats
        const validPeriods = [
          'AM', 'PM',
          locale.am.toUpperCase(), locale.pm.toUpperCase(),
          locale.am, locale.pm
        ];

        if (!periodPart || !validPeriods.includes(periodPart)) {
          return { isValid: false, normalizedTime: value };
        }
      }

      // Validate minutes and seconds
      if (minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
        return { isValid: false, normalizedTime: value };
      }

      // Format the validated time
      let normalizedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      if (showSeconds) {
        normalizedTime += `:${seconds.toString().padStart(2, '0')}`;
      }
      if (timeFormat === '12') {
        // Map the period to the locale's format
        let normalizedPeriod = periodPart.toUpperCase();
        if (['AM', locale.am.toUpperCase()].includes(normalizedPeriod)) {
          normalizedPeriod = locale.am;
        } else if (['PM', locale.pm.toUpperCase()].includes(normalizedPeriod)) {
          normalizedPeriod = locale.pm;
        }
        normalizedTime += ` ${normalizedPeriod}`;
      }

      return { isValid: true, normalizedTime };
    } catch (error) {
      return { isValid: false, normalizedTime: value };
    }
  }
}

@Injectable()
export class DestroyService extends Subject<void> implements OnDestroy {
  ngOnDestroy(): void {
    this.next();
    this.complete();
  }
}