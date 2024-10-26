import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";


@Injectable()
export class QeydarDatePickerService {
    activeInput$: BehaviorSubject<string> = new BehaviorSubject('');

    getActiveInputValue() {
        return this.activeInput$.getValue();
    }
}

@Injectable()
export class DestroyService extends Subject<void> implements OnDestroy {
  ngOnDestroy(): void {
    this.next();
    this.complete();
  }
}