/**
 * Core angular modules
 */
import { Component, ViewEncapsulation, OnInit, ViewChild, ElementRef } from '@angular/core';

/* Third party imports */
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';

/* Application level imports */
import { ILinkedPolicyTemplatesErrorInfo } from '../../policy-mgmt-search.model';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from '../../../core/translation.constant';
import { LinkedPolicyTemplatesErrorService } from './linked-policy-templates-error.service';
import { ContextService } from '../../../core/context.service';
import { POLICY_LEVEL } from '../../../core/constants';

@Component({
    selector: 'linked-policy-templates-error',
    templateUrl: './linked-policy-templates-error.component.html',
    styleUrls: ['./linked-policy-templates-error.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class LinkedPolicyTemplatesErrorComponent implements OnInit {

    /**
     * element reference of modal
     */
    @ViewChild('linkedPolicyTemplatesModal', { static: false }) linkedPolicyTemplatesContentRef: ElementRef;

    /**
     * modal reference
     */
    linkedPolicyTemplatesModalRef: NgbModalRef;

    /**
     * PrimeNg Table inputs
     * columns: Table Columns
     */
    columns: Array<{
        field: string,
        header: string
        }> = [];

    /**
     *
     */
    errorListData: Array<ILinkedPolicyTemplatesErrorInfo> = [];

    /**
     * Holds translation Map
     */
    translationMap: any;

    constructor(
        private translate: TcTranslateService,
        private linkedPolicyTemplatesErrorService: LinkedPolicyTemplatesErrorService,
        private modalService: NgbModal,
        private contextService: ContextService
        ) {
        this.translationMap = TranslationMap;
      }

    ngOnInit(): void {
      if(this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE){
        this.columns = [
          {
              field: 'templateName',
              header: this.translate.translateService.instant(TranslationMap['DEPOSIT_POLICY_TEMPLATE_NAME'])
          },
          {
              field: 'hotelName',
              header: this.translate.translateService.instant(TranslationMap['HOTEL_NAME'])
          },
          {
              field: 'hotelCode',
              header: this.translate.translateService.instant(TranslationMap['HOTEL_CODE'])
          },
          {
              field: 'context',
              header: this.translate.translateService.instant(TranslationMap['CONTEXT'])
          }
        ];
      } else {
        this.columns = [
          {
              field: 'templateName',
              header: this.translate.translateService.instant(TranslationMap['DEPOSIT_POLICY_TEMPLATE_NAME'])
          }];
      }
    }

    openModalPopUp(errorMessage: string) {
      this.errorListData = this.linkedPolicyTemplatesErrorService.MapLinkedPolicyTemplatesErrorInformation(errorMessage);

      this.linkedPolicyTemplatesModalRef = this.modalService.open(this.linkedPolicyTemplatesContentRef, {
        backdrop: 'static', windowClass: 'tc-modal tc-modal-90 linked-policy-templates-modal'
      });
    }

    closeModalPopUp() {
      if (this.linkedPolicyTemplatesModalRef) {
        this.linkedPolicyTemplatesModalRef.close();
      }
    }
}
