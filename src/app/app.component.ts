import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'my-datepicker';
  myDate: any = new Date();
  rtl = false;
  rangPicker = false;
  maxDate = new Date(2024,11,16);
  minDate = new Date(2024,5,1);

  ngOnInit(): void {
    // console.log("ngOnInit:",this.minDate,this.maxDate);
  }
  onChange(event:any) {
    console.log(event);
  }
  changeDirection() {
    this.rtl = !this.rtl;
  }
}
