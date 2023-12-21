// Angular imports
import { Component, Input, OnChanges, ViewEncapsulation, SimpleChanges } from '@angular/core';

// Application level imports
import { IErrorMessage } from '../core/common.model';

/**
 * component for showing error messages on UI
 */
@Component({
    selector: 'policy-mgmt-api-error-message',
    template: `
    <div *ngIf="toastDetails.show">
        <tc-toast [message]="toastDetails.message" (toastChange)="toggleToast($event, false)" [(toastFlag)]="toastDetails.show"
        [toastType]="'warning'" [dismiss]=true [dismissTime]="5000"></tc-toast>
    </div>`,
    styles: [`.toast-error-message {
        line-height: 23px;
        margin-bottom: 5px;
    }`],
    encapsulation: ViewEncapsulation.None
})

/**
 * class for error message component
 */
export class PolicyMgmtApiErrorMessageComponent implements OnChanges {
    /**
     * input field used to define error message details
     */
    @Input() toastDetails: IErrorMessage;

    /**
     * initializes component variables
     */
    constructor() { }

    /**
     * called on change in input attributes
     * @param changes: changes happened
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('toastDetails') && changes.toastDetails.currentValue !== changes.toastDetails.previousValue) {
            this.toastDetails = changes.toastDetails.currentValue;
        }
    }

    /**
     * function to toggle toast state
     */
    toggleToast(toastType, state) {
        this.toastDetails.show = state;
    }
}
