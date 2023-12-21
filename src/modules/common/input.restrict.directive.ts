// Angular imports
import { Directive, ElementRef, HostListener, Input, OnInit, OnChanges, EventEmitter, Output } from '@angular/core';
import { NgModel } from '@angular/forms';

/**
 * directive to be used for restrictions
 */
@Directive({
    selector: '[inputRestrict]'
})

/** class exported for use of directive */
export class InputRestrictDirective implements OnInit, OnChanges {
    /**
     * input variable for defining type of restrictions
     */
    @Input() inputRestrict: any;
    /**
     * input to define string to be restricted
     */
    @Input() input: any;

    /**
     * variable for defining type of restrictions
     */
    restrictType: string;

    /**
     * ngModelChange variable to emit updatedText value for 2-way binding with ngModel and Input value
     */
    @Output() ngModelChange: EventEmitter<any> = new EventEmitter();

    /**
     * initializes values
     * @param el: ElementRef
     * @param model: NgModel
     */
    constructor(private el: ElementRef, private model: NgModel) {
    }

    /**
     * called to set values on init
     * InputRestrictDirective
     */
    ngOnInit() {
        this.restrictType = this.inputRestrict;
    }

    /**
     * called on change of any input field
     * changes
     * InputRestrictDirective
     */
    ngOnChanges(changes) {
        if (changes['input'] && changes['input'].currentValue) {
            this.validateText(changes['input'].currentValue.toString());
        }
    }

    /**
     * event listener for devices
     * string: type of event to be listened
     */
    @HostListener('keyup', ['$event']) onKeyUpChange($event) {
        this.validateText(this.el.nativeElement.value);
    }

    /**
     * validates for type of data recieved as input
     * inputVal:string
     */
    validateText(inputVal: string) {
        // const txt: string = this.el.nativeElement.value;
        let updatedTxt: string;
        if (this.restrictType === 'alphanumeric') {
            updatedTxt = inputVal.replace(/[^A-Za-z0-9]/g, ''); // replace numbers in original input value.
        }
        if (this.restrictType === 'alphanumericwithspace') {
            updatedTxt = inputVal.replace(/[^A-Za-z0-9\s]/g, ''); // replace the special character in original input value.
        }
        if (this.restrictType === 'numericwithdecimal') {
            updatedTxt = inputVal.replace(/[^0-9.]/g, ''); // replace numbers in original input value.
        }
        if (this.restrictType === 'numeric') {
            updatedTxt = inputVal.replace(/[^0-9]/g, ''); // replace numbers in original input value.
        }
        if (inputVal !== updatedTxt) {
            this.el.nativeElement.value = updatedTxt;
            this.model.valueAccessor.writeValue(updatedTxt);
            this.ngModelChange.emit(updatedTxt);
        }
    }
}
