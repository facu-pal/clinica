import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appScrollable]'
})
export class ScrollableDirective implements AfterViewInit {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() { 
    this.renderer.setStyle(this.el.nativeElement, 'overflow-y', 'auto');
     this.renderer.setStyle(this.el.nativeElement, 'max-height', '400px'); 
     this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
    }


}


