import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'qeydar-datepicker';
  myDate: any = new Date();
  myDateRange = {start:'1403/08/12', end: new Date()};
  rtl = true;
  rangPicker = true;
  maxDate = new Date(2024,11,16).toISOString();
  minDate = new Date(2024,5,1).toISOString();
  myTime = '22:20';
  myValue: string = 'jgjhghgjj';

  form = new FormGroup({
    time: new FormControl('17:17'),
    date: new FormControl('2024-09-29T00:00:00')
  })
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
