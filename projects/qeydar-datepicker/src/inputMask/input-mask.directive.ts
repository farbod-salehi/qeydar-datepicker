import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[qeydar-dateMask]'
})
export class DateMaskDirective {
  @Input('qeydar-dateMask') dateFormat: string = 'yyyy/MM/dd';

  private delimiter: string;
  private parts: string[];
  private lastValue: string = '';

  constructor(private el: ElementRef) {
    this.delimiter = this.getDelimiter();
    this.parts = this.dateFormat.split(this.delimiter);
  }

  @HostListener('input', ['$event'])
  onInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    let value = input.value.replace(/[^0-9/\-\.]/g, '');
    
    // Check if a character was removed
    if (value.length < this.lastValue.length) {
      // Allow removal of delimiters and characters before them
      this.lastValue = value;
      return;
    }

    const parts = value.split(this.delimiter);
    const formattedParts: string[] = [];

    let shouldAddDelimiter = false;
    let totalLength = 0;
    let newCursorPosition = cursorPosition;

    for (let i = 0; i < this.parts.length; i++) {
      if (parts[i]) {
        let part = parts[i];
        const expectedLength = this.getPartLength(this.parts[i]);
        
        if (part.length >= expectedLength) {
          part = this.validatePart(part.slice(0, expectedLength), this.parts[i]);
          shouldAddDelimiter = true;
        }

        formattedParts.push(part);
        totalLength += part.length;

        if (shouldAddDelimiter && i < this.parts.length - 1) {
          formattedParts.push(this.delimiter);
          totalLength += this.delimiter.length;
          shouldAddDelimiter = false;

          // If cursor was at the end of this part, move it after the delimiter
          if (cursorPosition === totalLength - this.delimiter.length) {
            newCursorPosition = totalLength;
          }
        }
      } else {
        break;
      }
    }

    const formattedValue = formattedParts.join('');
    input.value = formattedValue;

    // Set cursor position
    newCursorPosition = Math.min(newCursorPosition, totalLength);
    input.setSelectionRange(newCursorPosition, newCursorPosition);

    this.lastValue = formattedValue;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === this.delimiter) {
      const input = event.target as HTMLInputElement;
      const cursorPosition = input.selectionStart || 0;
      const parts = input.value.split(this.delimiter);
      const currentPartIndex = this.getCurrentPartIndex(input.value, cursorPosition);

      if (currentPartIndex < this.parts.length - 1) {
        const currentPart = this.validatePart(parts[currentPartIndex], this.parts[currentPartIndex]);
        parts[currentPartIndex] = currentPart;
        
        const newValue = parts.slice(0, currentPartIndex + 1).join(this.delimiter) + this.delimiter;
        input.value = newValue + parts.slice(currentPartIndex + 1).join(this.delimiter);
        
        const newPosition = newValue.length;
        input.setSelectionRange(newPosition, newPosition);
        event.preventDefault();
      }
    }
  }

  private getDelimiter(): string {
    const match = this.dateFormat.match(/[^yMd]/);
    return match ? match[0] : '/';
  }

  private validatePart(value: string, format: string): string {
    if (value === '') return '';  // Return empty string if value is empty
    const numValue = parseInt(value, 10);
    switch (format) {
      case 'MM':
        return Math.min(Math.max(numValue, 1), 12).toString().padStart(2, '0');
      case 'dd':
        return Math.min(Math.max(numValue, 1), 31).toString().padStart(2, '0');
      case 'yyyy':
        return value.padStart(4, '0');
      default:
        return value;
    }
  }

  private getPartLength(format: string): number {
    switch (format) {
      case 'yyyy':
        return 4;
      case 'MM':
      case 'dd':
        return 2;
      default:
        return 2;
    }
  }

  private getCurrentPartIndex(value: string, cursorPosition: number): number {
    const parts = value.split(this.delimiter);
    let currentIndex = 0;
    let totalLength = 0;

    for (let i = 0; i < parts.length; i++) {
      totalLength += parts[i].length;
      if (cursorPosition <= totalLength + i * this.delimiter.length) {
        return i;
      }
    }

    return parts.length - 1;
  }
}