import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'policy-mgmt-list-details-modal',
    templateUrl: './policy-mgmt-list-details-modal.component.html',
    styleUrls: ['policy-mgmt-list-details-modal.component.scss']
})
export class PolicyMgmtListDetailsModalComponent {
    /**
     * element ref of modal
     */
    @ViewChild('listDetailsModal', { static: false }) listDetailsContentReference: ElementRef;

    /**
     * List items to show in modal
     */
    listData: any = [];

    /**
     * modal reference
     */
    listDetailsModalRef: NgbModalRef;

    /**
     * modal heading
     */
    modalHeading: string;

    /**
     * initializes class attributes
     * @param modalService - reference of modal popup service
     */
    constructor(private modalService: NgbModal) { }

    /**
     * Opens Modal to show list of items
     * @param list: List of items
     * @param label: Label for modal
     */
    open(list: Array<string>, label: string) {
        this.listData = list;
        this.modalHeading = label;

        this.listDetailsModalRef = this.modalService.open(this.listDetailsContentReference, {
            windowClass: 'tc-modal tc-modal-25',
            beforeDismiss: this.beforeModalClose
        });
    }

    /**
     * function called before closing of modal
     */
    beforeModalClose(): boolean {
        return false;
    }

    /**
     * close modal popup reference
     *
     */
    close() {
        if (this.listDetailsModalRef) {
            this.listDetailsModalRef.close();
        }
    }
}
