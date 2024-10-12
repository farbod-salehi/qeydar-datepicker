import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[qeydar-dateMask]'
})
export class DateMaskDirective {
  @Input('qeydar-dateMask') dateFormat: string = 'yyyy/MM/dd';

  private delimiter: string;
  private parts: string[];

  constructor(private el: ElementRef) {
    this.delimiter = this.getDelimiter();
    this.parts = this.dateFormat.split(this.delimiter);
  }

  @HostListener('input', ['$event'])
  onInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    let value = input.value.replace(/[^0-9/\-\.]/g, '');
    
    const parts = value.split(this.delimiter);
    const formattedParts: string[] = [];
    // for backspace
    if (!event.data) {
        return;
    }
    for (let i = 0; i < this.parts.length; i++) {
      if (parts[i]) {
        const part = this.validatePart(parts[i], this.parts[i]);
        formattedParts.push(part.padStart(this.getPartLength(this.parts[i]), '0'));
      } else {
        break;
      }
    }

    const formattedValue = formattedParts.join(this.delimiter);
    input.value = formattedValue;

    // Adjust cursor position
    const newPosition = this.getAdjustedCursorPosition(value, formattedValue, cursorPosition);
    input.setSelectionRange(newPosition, newPosition);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === this.delimiter) {
      const input = event.target as HTMLInputElement;
      const cursorPosition = input.selectionStart || 0;
      const parts = input.value.split(this.delimiter);
      const currentPartIndex = parts.length - 1;

      if (currentPartIndex < this.parts.length - 1 && parts[currentPartIndex].length > 0) {
        const currentPart = this.validatePart(parts[currentPartIndex], this.parts[currentPartIndex]);
        parts[currentPartIndex] = currentPart.padStart(this.getPartLength(this.parts[currentPartIndex]), '0');
        
        input.value = parts.join(this.delimiter) + (currentPartIndex < this.parts.length - 1 ? this.delimiter : '');
        input.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
        event.preventDefault();
      }
    }
  }

  private getDelimiter(): string {
    const match = this.dateFormat.match(/[^yMd]/);
    return match ? match[0] : '/';
  }

  private validatePart(value: string, format: string): string {
    const numValue = parseInt(value, 10);
    switch (format) {
      case 'MM':
        return Math.min(Math.max(numValue, 1), 12).toString();
      case 'dd':
        return Math.min(Math.max(numValue, 1), 31).toString();
      case 'yyyy':
        return value.slice(0, 4);
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

  private getAdjustedCursorPosition(oldValue: string, newValue: string, oldPosition: number): number {
    let newPosition = oldPosition;
    for (let i = 0; i < newPosition; i++) {
      if (oldValue[i] !== newValue[i]) {
        if (newValue[i] === '0' || newValue[i] === this.delimiter) {
          newPosition++;
        } else {
          break;
        }
      }
    }
    return newPosition;
  }
}
