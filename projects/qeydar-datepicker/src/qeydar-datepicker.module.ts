import { NgModule } from '@angular/core';
import { DatePickerComponent } from './date-picker.component';
import { DatePickerPopupComponent } from './date-picker-popup/date-picker-popup.component';
import { DateMaskDirective } from './utils/input-mask.directive';
import { NzConnectedOverlayDirective } from './public-api';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { CustomTemplate } from './utils/template.directive';

@NgModule({
  imports: [
    DatePickerComponent,
    DatePickerPopupComponent,
    DateMaskDirective,
    NzConnectedOverlayDirective,
    TimePickerComponent,
    CustomTemplate
  ],
  exports: [
    DatePickerComponent,
    TimePickerComponent,
    DatePickerPopupComponent,
    DateMaskDirective,
    NzConnectedOverlayDirective,
    CustomTemplate
  ]
})
export class QeydarDatePickerModule { }
