import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'my-datepicker';
  myDate: any = new Date();
  myDateRange: any //= {start:new Date(), end: new Date()};
  rtl = false;
  rangPicker = false;
  maxDate = new Date(2024,11,16);
  minDate = new Date(2024,5,1);
  myTime = '22:20';
  myValue: string = 'jgjhghgjj';

  ngOnInit(): void {
    // console.log("ngOnInit:",this.minDate,this.maxDate);
  }
  onChange(event:any) {
    console.log('event:',event,'myDate: ',this.myDate);
  }
  changeDirection() {
    this.rtl = !this.rtl;
  }

  onChangeValue(event: any) {
    console.log("My Value:",event);
    
  }
}
