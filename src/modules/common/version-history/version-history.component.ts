import { Component, ViewEncapsulation, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IHistoryRecord } from './version-history.model';
import { VersionHistoryService } from './version-history.service';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from '../../core/translation.constant';
import { IErrorMessage, IHttpErrorResponse } from '../../core/common.model';
import { PolicyMgmtErrorService } from '../../core/error.service';

@Component({
    selector: 'version-history',
    templateUrl: './version-history.component.html',
    styleUrls: ['./version-history.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class VersionHistoryComponent implements OnInit {

    /**
     * element ref of modal
     */
    @ViewChild('versionHistoryModal', { static: false }) versionHistoryContentRef: ElementRef;

    /**
     * modal reference
     */
    versionHistoryModalRef: NgbModalRef;

    /**
     * modal heading
     */
    modalHeading: string;

    /**
     * PrimeNg Table inputs
     * historyList: Data to table
     * historyFields: Fields Dropdown Data
     * columns: Table Columns
     */
    historyList: Array<IHistoryRecord> = [];
    historyFields: Array<string> = [];
    columns: Array<{
        field: string,
        header: string,
        filterMatchMode?: string
    }>;

    /**
     * Tooltip Flag
     */
    toolTipFlag = false;

    /**
     * Holds alpha-numeric regex
     */
    alphaNumRegex: RegExp = /[a-z0-9]/i;

    /**
     * Error Toaster related fields
     */
    showToastFlag: boolean;
    apiErrorMessageDetails: IErrorMessage;

    /**
     * initializes class attributes
     * @param modalService - reference of modal popup service
     */
    constructor(
        private modalService: NgbModal,
        private versionHistoryService: VersionHistoryService,
        private translate: TcTranslateService,
        private errorService: PolicyMgmtErrorService
    ) {
        // set default values to error toaster
        this.showToastFlag = false;
        this.apiErrorMessageDetails = {
            show: true,
            message: {}
        };
    }

    ngOnInit(): void {
        this.columns = [
            {
                field: 'date',
                header: this.translate.translateService.instant(TranslationMap['DATE']),
                filterMatchMode: 'contains'
            },
            {
                field: 'userName',
                header: this.translate.translateService.instant(TranslationMap['USER_NAME']),
                filterMatchMode: 'contains'
            },
            {
                field: 'field',
                header: this.translate.translateService.instant(TranslationMap['FIELD_NAME']),
                filterMatchMode: 'equals'
            },
            {
                field: 'oldValue',
                header: this.translate.translateService.instant(TranslationMap['OLD_VALUE'])
            },
            {
                field: 'newValue',
                header: this.translate.translateService.instant(TranslationMap['NEW_VALUE'])
            }
        ];
    }

    tooltipCondition(e: any) {
        if (e.target.scrollWidth > e.target.clientWidth) {
            this.toolTipFlag = true;
        } else {
            this.toolTipFlag = false;
        }
    }

    /**
     * Opens Modal to show list of items
     * @param list: List of items
     * @param label: Label for modal
     */
    open(id: number) {
        this.historyList = [];
        this.modalHeading = this.translate.translateService.instant(TranslationMap['VERSION_HISTORY']);

        this.versionHistoryService.getVersionHistoryData(id).subscribe((response: Array<IHistoryRecord>) => {
            if (response) {
                this.historyList = response;
                this.historyFields = this.findHistoryFields(response);

                this.versionHistoryModalRef = this.modalService.open(this.versionHistoryContentRef, {
                    windowClass: 'tc-modal tc-modal-90 version-history-modal',
                    beforeDismiss: this.beforeModalClose
                });
            }
        }, (error: IHttpErrorResponse) => {
            const errorObj = [{
                message: this.translate.translateService.instant(TranslationMap['NO_RECORDS_FOUND']),
                errorCode: error.status.toString()
            }];
            this.apiErrorMessageDetails = this.errorService.setErrorMessage(errorObj);
            this.showToastFlag = true;
        });
    }

    /**
     * Returns Unique Fields from history data
     * @param data: History data
     */
    findHistoryFields(data: Array<IHistoryRecord>) {
        const historyFields = [];
        data.forEach((record: IHistoryRecord) => {
            if (historyFields.findIndex(item => item.label === record.field) === -1) {
                historyFields.push({
                    label: record.field,
                    value: record.field,
                });
            }
        });
        const fields = [{
            label: this.translate.translateService.instant(TranslationMap['DROPDOWN_SELECT']),
            value: ''
        }, ...historyFields];
        return fields;
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
        if (this.versionHistoryModalRef) {
            this.versionHistoryModalRef.close();
        }
    }
}
