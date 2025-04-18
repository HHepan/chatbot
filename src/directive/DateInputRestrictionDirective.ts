// date-input-restriction.directive.ts
import {Directive, ElementRef, AfterViewInit, NgModule} from '@angular/core';

@Directive({
  selector: 'input[type="date"], input[type="month"]'
})
export class DateInputRestrictionDirective implements AfterViewInit {

  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    // 设置 min 和 max 属性
    const htmlInputElement = this.el.nativeElement as HTMLInputElement;
    if (htmlInputElement.type === 'date') {
      this.el.nativeElement.setAttribute('min', '1000-01-01');
      this.el.nativeElement.setAttribute('max', '9999-12-31');
    } else if (htmlInputElement.type === 'month') {
      this.el.nativeElement.setAttribute('min', '1000-01');
      this.el.nativeElement.setAttribute('max', '9999-12');
    }
  }
}

@NgModule({
  declarations: [
    DateInputRestrictionDirective
  ],
  exports: [
    DateInputRestrictionDirective
  ]
})
export class DateInputRestrictionModule {}
