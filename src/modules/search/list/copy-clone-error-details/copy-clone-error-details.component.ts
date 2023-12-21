import { Component, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IErrorDetailsModel, IErrorDetailsTable } from './copy-clone-error-details.model';
import { IChainInfo } from 'src/modules/core/common.model';
import { CopyCloneErrorDetailsService } from './copy-clone-error-details.service';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from 'src/modules/core/translation.constant';

@Component({
    selector: 'copy-clone-error-details',
    templateUrl: './copy-clone-error-details.component.html',
    styleUrls: ['./copy-clone-error-details.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class CopyCloneErrorDetailsComponent {
    /**
     * Element reference of modal
     */
    @ViewChild('copyCloneErrorDetailsModal', { static: false }) copyCloneErrorDetailsContentRef: ElementRef;

    /**
     * Table reference of copy  lone error details
     */
    @ViewChild('copyCloneErrorDetailsListTable') datatableRef: any;

    /**
     * Modal reference
     */
    copyCloneErrorDetailsModalRef: NgbModalRef;

    /**
     * Holds translation Map
     */
    translationMap: any;

    /**
     * Inputs
     * copyCloneErrorDetailsList: Data to table
     * failedHotelsCount: propperties failed count
     * totalHotelsCount: total hotels count
     */
    copyCloneErrorDetailsList: Array<IErrorDetailsTable> = [];
    failedHotelsCount: number;
    totalHotelsCount: number;

    constructor(private modalService: NgbModal,
        private copyCloneErrorDetailsService: CopyCloneErrorDetailsService,
        private translate: TcTranslateService
    ) {
        this.translationMap = TranslationMap;
    }

    /**
     * Opens Modal to show list of copy clone error details
     * @param jobId
     * @param failedHotelsCount
     * @param totalHotelsCount
     * @param chainInfo: see @IChainInfo
     */
    open(jobId: string, failedHotelsCount: number, totalHotelsCount: number, chainInfo: IChainInfo) {
        this.failedHotelsCount = failedHotelsCount;
        this.totalHotelsCount = totalHotelsCount;
        this.copyCloneErrorDetailsList = [];
        this.copyCloneErrorDetailsService.getJobDetails(jobId).subscribe((response: Array<IErrorDetailsModel>) => {
            this.copyCloneErrorDetailsList = this.copyCloneErrorDetailsService.setErrorDetailsToDisplay(response, chainInfo);
            this.copyCloneErrorDetailsModalRef = this.modalService.open(this.copyCloneErrorDetailsContentRef, {
                windowClass: 'tc-modal tc-modal-90 copy-clone-error-details',
                beforeDismiss: this.beforeModalClose
            });
        });
    }

    /**
     * Called before closing a copy clone error details modal
     */
    beforeModalClose(): boolean {
        return false;
    }

    /**
     * Closes copy clone error details modal reference
     */
    close() {
        if (this.copyCloneErrorDetailsModalRef) {
            this.copyCloneErrorDetailsModalRef.close();
        }
    }

    /**
     * Export copy clone error details to Excel
     * @param exportCopyCloneErrorDetailsList
     */
    exportExcel(exportCopyCloneErrorDetailsList: string) {
        const blob = new Blob([document.getElementById(exportCopyCloneErrorDetailsList).innerHTML], {
            type: 'application/vnd.ms-excel;charset=charset=utf-8'
        });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
    }
}
