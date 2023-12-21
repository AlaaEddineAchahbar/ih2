// Angular imports
import { Component, Input, OnChanges, ViewEncapsulation, SimpleChanges } from '@angular/core';

// Application level imports
import { IErrorMessage } from '../core/common.model';

/**
 * component for showing error messages on UI
 */
@Component({
    selector: 'policy-mgmt-error-message',
    template: `
        <div class="error tc-error-box__error tc-error-inline__error" [hidden]="!messageDetails.show">
            <p class="message tc-error-box__error__message tc-error-inline__error__message">
                {{ messageDetails.message }}
            </p>
        </div>
    `,
    encapsulation: ViewEncapsulation.None
})
export class PolicyMgmtErrorMessageComponent implements OnChanges {
    /**
     * input field used to define error message details
     */
    @Input() messageDetails: IErrorMessage;

    /**
     * initializes component variables
     */
    constructor() {
        this.messageDetails = {
            show: false,
            message: ''
        };
    }

    /**
     * Called on change in input attributes
     * @param changes: simpleChanges
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('messageDetails') && changes.messageDetails.currentValue !== changes.messageDetails.previousValue) {
            this.messageDetails = changes.messageDetails.currentValue;
        }
    }
}
