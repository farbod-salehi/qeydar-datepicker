import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-datepicker';
  myDate = new Date();
  rtl = false;
  rangPicker = false;
  maxDate = new Date(2024,8);
  minDate = new Date(2024,5);

  onChange(event:any) {
    console.log(event);
  }
  changeDirection() {
    this.rtl = !this.rtl;
  }
}
