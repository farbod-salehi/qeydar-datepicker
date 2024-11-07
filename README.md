# Qeydar Date and Time Pickers

A comprehensive package providing separate DatePicker and TimePicker components for Angular applications, with support for both Jalali (Persian) and Georgian calendars.
This package supports Angular 14 and above. Specific version compatibility:

| Package Version | Angular Version |
|----------------|-----------------|
| 1.x.x          | ≥14.0.0        |

## Components
This package includes two main components:
1. `QeydarDatePicker`: A flexible date picker with range selection support
2. `QeydarTimePicker`: A standalone time picker with 12/24 hour format support

## Features
### DatePicker
- 📅 Support for both Jalali (Persian) and Georgian calendars
- 🎯 Single date and date range selection
- 🌐 Multilingual support (English/Persian)
- 📏 Min/Max date restrictions
- 🎨 Customizable styles
- 📱 Responsive design
- ⌨️ Keyboard navigation
- 🔄 Form integration
- 📋 Custom period labels
- 📐 Multiple placement options

### TimePicker
- ⏰ 12/24 hour format support
- ⏱️ Optional seconds display
- 🔒 Time range restrictions
- 🎭 Time input mask
- 🌐 Multilingual AM/PM

## Installation

```bash
npm install @qeydar/datepicker
```

### Dependencies
```json
{
  "@angular/cdk": ">=14.0.0",
  "date-fns": ">=2.0.0",
  "date-fns-jalali": ">=2.13.0"
}
```

### Required Styles
```css
@import '@angular/cdk/overlay-prebuilt.css';
```

## DatePicker Usage

### Basic Usage
```typescript
// app.module.ts
import { QeydarDatepickerModule } from '@qeydar/datepicker';

@NgModule({
  imports: [QeydarDatepickerModule]
})
export class AppModule { }

// component.ts
@Component({
  template: `
    <qeydar-date-picker 
      [(ngModel)]="selectedDate"
      [calendarType]="'jalali'"
    ></qeydar-date-picker>
  `
})
export class AppComponent {
  selectedDate: Date | string = '1403/01/01'; // Can accept both Date object and string
}
```

### Range Selection
The DatePicker supports flexible range selection with multiple ways to handle values:

```typescript
@Component({
  template: `
    <qeydar-date-picker
      [(ngModel)]="dateRange"
      [isRange]="true"
      [rangeInputLabels]="{ start: 'From', end: 'To' }"
      [emitInDateFormat]="false"
      [calendarType]="'jalali'"
    ></qeydar-date-picker>
  `
})
export class AppComponent {
  // Using string values
  dateRange = {
    start: '1403/08/12',
    end: '1403/08/15'
  };

  // Using mixed values (string and Date)
  dateRange2 = {
    start: '1403/08/12',
    end: new Date()
  };

  // Using Date objects
  dateRange3 = {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-07')
  };

  // With emitInDateFormat=true, values will be emitted as Date objects
  onRangeChange(range: { start: Date, end: Date }) {
    console.log('Start:', range.start);
    console.log('End:', range.end);
  }
}
```

### Range Selection with Predefined Periods
```typescript
// Define custom period labels
const customLabels: CustomLabels[] = [
  {
    label: 'This Week',
    value: [new Date('2024-01-01'), new Date('2024-01-07')]
  },
  {
    label: 'Last 7 Days',
    value: ['1403/08/05', '1403/08/12'] // Can use strings for Jalali dates
  },
  {
    label: 'Custom Range',
    value: 'custom'
  }
];

@Component({
  template: `
    <qeydar-date-picker
      [(ngModel)]="dateRange"
      [isRange]="true"
      [customLabels]="customLabels"
      (onChangeValue)="onRangeChange($event)"
    ></qeydar-date-picker>
  `
})
```

## TimePicker Usage

The TimePicker is a separate component for time selection:

```typescript
@Component({
  template: `
    <qeydar-time-picker
      [(ngModel)]="selectedTime"
      [timeFormat]="'24'"
      [showSeconds]="true"
      [minTime]="'09:00'"
      [maxTime]="'17:00'"
    ></qeydar-time-picker>
  `
})
export class AppComponent {
  selectedTime = '14:30:00';

  // Or using Date object with valueType="date"
  selectedDateTime = new Date();
}
```

### TimePicker with Custom Format
```typescript
<qeydar-time-picker
  [(ngModel)]="time"
  [timeFormat]="'12'"
  [displayFormat]="'hh:mm a'"
  [rtl]="true"
  (timeChange)="onTimeChange($event)"
></qeydar-time-picker>
```

## API Reference

### DatePicker Inputs
| Input             | Type                     | Default       | Description |
|-------------------|--------------------------|---------------|-------------|
| rtl               | boolean                  | false         | Right-to-left mode |
| mode              | 'day' \| 'month' \| 'year' | 'day'      | Selection mode |
| isRange           | boolean                  | false         | Enable range selection |
| format            | string                   | 'yyyy/MM/dd'  | Date format |
| calendarType      | 'jalali' \| 'georgian'   | 'georgian'    | Calendar type |
| minDate           | Date                     | null          | Minimum selectable date |
| maxDate           | Date                     | null          | Maximum selectable date |
| cssClass          | string                   | ''            | Custom CSS class |
| footerDescription | string                   | ''            | Footer description text |
| rangeInputLabels  | RangeInputLabels        | undefined     | Labels for range inputs |
| inputLabel        | string                   | undefined     | Label for single input |
| placement         | Placement                | 'bottomLeft'  | Dropdown placement |
| disabled          | boolean                  | false         | Disable the datepicker |
| isInline          | boolean                  | false         | Show calendar inline |
| showSidebar       | boolean                  | true          | Show sidebar with months/years |
| emitInDateFormat  | boolean                  | false         | Emit date object instead of string |
| showToday         | boolean                  | false         | Highlight today's date |

### DatePicker Outputs
| Output        | Type                  | Description |
|--------------|----------------------|-------------|
| onFocus      | EventEmitter<any>    | Fires when input receives focus |
| onBlur       | EventEmitter<any>    | Fires when input loses focus |
| onChangeValue | EventEmitter<any>    | Fires when value changes |
| onOpenChange  | EventEmitter<boolean> | Fires when picker opens/closes |


### TimePicker Inputs

| Input          | Type                | Default      | Description |
|----------------|---------------------|--------------|-------------|
| placeholder    | string             | 'Select time' | Input placeholder |
| timeFormat     | '12' \| '24'        | '12'         | Time format |
| displayFormat  | string             | 'hh:mm a'    | Time display format |
| minTime        | string             | undefined    | Minimum selectable time |
| maxTime        | string             | undefined    | Maximum selectable time |
| valueType      | 'string' \| 'date'  | 'string'     | Output value type |
| cssClass       | string             | ''           | Custom CSS class |
| showIcon       | boolean            | true         | Show clock icon |
| rtl            | boolean            | false        | Right-to-left mode |
| lang           | Lang_Locale        | lang_En      | Language settings |

### TimePicker Outputs

| Output      | Type                   | Description |
|-------------|------------------------|-------------|
| timeChange  | EventEmitter<any>      | Fires when time changes |
| openChange  | EventEmitter<boolean>  | Fires when picker opens/closes |

## Form Integration Examples

### Reactive Forms with Both Components
```typescript
@Component({
  template: `
    <form [formGroup]="form">
      <!-- Date Range -->
      <qeydar-date-picker
        formControlName="dateRange"
        [isRange]="true"
        [calendarType]="'jalali'"
      ></qeydar-date-picker>

      <!-- Time -->
      <qeydar-time-picker
        formControlName="time"
        [timeFormat]="'24'"
      ></qeydar-time-picker>
    </form>
  `
})
export class AppComponent {
  form = this.fb.group({
    dateRange: [{
      start: '1403/08/12',
      end: new Date()
    }],
    time: ['14:30']
  });

  constructor(private fb: FormBuilder) {}
}
```

### Template-driven Forms
```typescript
<form #form="ngForm">
  <qeydar-date-picker
    [(ngModel)]="dateRange"
    name="dateRange"
    [isRange]="true"
    required
  ></qeydar-date-picker>

  <qeydar-time-picker
    [(ngModel)]="time"
    name="time"
    required
  ></qeydar-time-picker>
</form>
```

## Styling
Both components can be styled using CSS variables:
```css
.qeydar-datepicker, .qeydar-time-picker {
  --primary-color: #40a9ff;
  --border-color: #d9d9d9;
  --text-color: #666;
  --background-color: white;
}
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
MIT License