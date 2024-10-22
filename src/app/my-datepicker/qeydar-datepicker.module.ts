import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DatePickerComponent } from './my-datepicker.component';
import { DatePickerPopupComponent } from './date-picker-popup/date-picker-popup.component';
import { DateMaskDirective } from './input-mask.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';
import { NzConnectedOverlayDirective } from './overlay/overlay';

@NgModule({
  declarations: [
    DatePickerComponent,
    DatePickerPopupComponent,
    DateMaskDirective,
    NzConnectedOverlayDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    OverlayModule,
  ],
  exports: [DatePickerComponent],
  providers: [ provideAnimations() ],
})
export class QeydarDatePickerModule { }
