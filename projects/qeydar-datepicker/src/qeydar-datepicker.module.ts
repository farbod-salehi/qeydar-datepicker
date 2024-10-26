import { NgModule } from '@angular/core';
import { DatePickerComponent } from './date-picker.component';
import { DatePickerPopupComponent } from './date-picker-popup/date-picker-popup.component';
import { DateMaskDirective } from './inputMask/input-mask.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OverlayModule } from '@angular/cdk/overlay';
import { NzConnectedOverlayDirective } from './overlay/overlay';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    DatePickerComponent,
    DatePickerPopupComponent,
    DateMaskDirective,
    NzConnectedOverlayDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OverlayModule,
  ],
  exports: [DatePickerComponent],
  providers: [ provideAnimations() ],
})
export class QeydarDatePickerModule { }
