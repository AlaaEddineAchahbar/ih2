import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslationMap } from '../../../../core/translation.constant';
import { IDepositRuleDetailsModel } from '../../policy-mgmt-create-template.model';
import { TcTranslateService } from 'tc-angular-services';
import { ContextService } from 'src/modules/core/context.service';


@Component({
  selector: 'deposit-rule-details-modal',
  templateUrl: './deposit-rule-details-modal.html',
  styleUrls: ['deposit-rule-details-modal.scss']
})
export class PolicyMgmtDepositRuleDetailsModalComponent {
  /**
   * element ref of modal
   */
  @ViewChild('depositRuleDetailsModal', { static: false }) depositRuleDetailsContentReference: ElementRef;

  translationMap: any;

  depositRuleDetails: IDepositRuleDetailsModel;

  /**
   * modal reference
   */
  depositRuleModalRef: NgbModalRef;

  /**
   * initializes class attributes
   * @param modalService - reference of modal popup service
   */
  constructor(private modalService: NgbModal, private translate: TcTranslateService,
    private contextService: ContextService) {
    this.translationMap = TranslationMap;
  }

  open(depositRuleDetailsData: IDepositRuleDetailsModel) {
    this.depositRuleDetails = depositRuleDetailsData;
    this.depositRuleModalRef = this.modalService.open(this.depositRuleDetailsContentReference, {
      windowClass: 'tc-modal tc-modal-50',
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
    if (this.depositRuleModalRef) {
      this.depositRuleModalRef.close();
    }
  }
}
