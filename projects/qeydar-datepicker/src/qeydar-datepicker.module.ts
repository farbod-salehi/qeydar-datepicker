import { NgModule } from '@angular/core';
import { DatePickerComponent } from './date-picker.component';
import { DatePickerPopupComponent } from './date-picker-popup/date-picker-popup.component';
import { DateMaskDirective } from './utils/input-mask.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';
import { NzConnectedOverlayDirective } from './public-api';
import { CommonModule } from '@angular/common';
import { TimePickerComponent } from './time-picker/time-picker.component';

@NgModule({
  declarations: [
    DatePickerComponent,
    DatePickerPopupComponent,
    DateMaskDirective,
    NzConnectedOverlayDirective,
    TimePickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OverlayModule,
  ],
  exports: [DatePickerComponent,TimePickerComponent],
  providers: [ provideAnimations() ],
})
export class QeydarDatePickerModule { }
