/** Basic angular imports */
import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

// third party library imports
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TranslationMap } from '../../core/translation.constant';

/**
 * component used for creating confirmation and information popup
 */
@Component({
    selector: 'policy-mgmt-confirmation-modal',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss']
})

/**
 * component class for modal popup
 */
export class PolicyMgmtConfirmationModalComponent {
    /** event emitter for OK button
     */
    @Output() modalCancel: EventEmitter<string> = new EventEmitter();

    /** event emitter for Cancel button
     */
    @Output() modalOk: EventEmitter<string> = new EventEmitter();

    /**
     * defines content for message body
     */
    messageContent: string;

    /**
     * holds modal title
     */
    modalTitle: any;

    /**
     * holds modal type
     */
    modalType: string;

    /**
     * flag to show/hide close button ontop of modal
     */
    isHideCloseButton: boolean;

    /**
     * defines margin to be added to modal
     */
    marginTopBottom: string;

    /**
     * element ref of modal
     */
    @ViewChild('confirmationPopup', { static: false }) confirmationModalContentReference: ElementRef;

    /**
     * holds values from constant modal type
     */
    constModalType: object;
    /**
     * used for importing translation JSON
     */
    translationMap: any;

    /**
     * holds modal button labels
     */
    buttonLabels: any;

    /**
     * initializes class attributes
     * @param modalService - reference of modal popup service
     */

    constructor(private modalService: NgbModal) {
        this.isHideCloseButton = false;
        this.marginTopBottom = '30px';
        this.translationMap = TranslationMap;
        this.buttonLabels = {
            ok: 'OK',
            cancel: 'CANCEL'
        };
    }

    /**
     * function to open modal
     * @param message: string content of modal
     * @param title: string title of the modal
     * @param className: string user defined class name
     */
    open(message: string, title: string, type: any, className: string = null, isDismiss: boolean = false, labels?: object) {
        this.messageContent = message;
        this.modalTitle = title;
        this.modalType = type;
        if (className === null) {
            this.isHideCloseButton = false;
            this.modalService.open(this.confirmationModalContentReference, {
                windowClass: 'tc-modal tc-normal-modal',
                backdrop: 'static',
                keyboard: false
            });

        } else {
            this.isHideCloseButton = false;
            this.modalService.open(this.confirmationModalContentReference, {
                windowClass: 'tc-modal ' + className,
                backdrop: 'static',
                keyboard: false
            });
        }
        if (labels) {
            this.buttonLabels = labels;
        }

    }

    /**
     * function called before closing of modal
     */
    beforeModalClose() {
        return false;
    }

    /**
     * function called on click of ok button in modal to emit ok event
     */
    clickOk() {
        this.modalOk.emit(this.modalType);
    }

    /**
     * function call on click of cancel to emit cancel event in modal
     */
    clickCancel() {
        this.modalCancel.emit(this.modalType);
    }
}
