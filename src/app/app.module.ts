import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { DatePickerComponent } from './my-datepicker/my-datepicker.component';
import { DatePickerPopupComponent } from './my-datepicker/date-picker-popup/date-picker-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateMaskDirective } from './my-datepicker/input-mask.directive';

@NgModule({
  declarations: [
    AppComponent,
    DatePickerComponent,
    DatePickerPopupComponent,
    DateMaskDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
