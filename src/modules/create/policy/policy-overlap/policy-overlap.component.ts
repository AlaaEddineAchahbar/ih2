import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IOverlapPolicyInfo } from './policy-overlap.model';
import { TranslationMap } from '../../../core/translation.constant';
import { TcTranslateService } from 'tc-angular-services';
import { ENTERPRISE_POLICY_LEVEL_FILTERS } from '../../../core/rules-config.constant';
import { PolicyMgmtUtilityService } from '../../../core/utility.service';

@Component({
  selector: 'policy-overlap',
  templateUrl: './policy-overlap.component.html',
  styleUrls: ['./policy-overlap.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PolicyOverlapComponent implements OnInit {
  /**
   * Element ref of modal
   */
  @ViewChild('policyOverlapModal', { static: false }) policyOverlapContentRef: ElementRef;

  /**
   * Modal reference
   */
  policyOverlapComponentModalRef: NgbModalRef;

  /**
   * Holds translation Map
   */
  translationMap: any;

  /**
   * Holds a list of overlap policies
   */
  policyOverlapListData: Array<IOverlapPolicyInfo> = [];

  /**
   * Holds a flag for modal button ok is clicked
   */
  isOkClicked: boolean = false;

  /**
   * Holds a list of columns to display
   */
  overlapPolicyCols: Array<{
    field: string,
    header: string
  }> = [];

  /**
   * Holds initial list of columns to display
   */
  initOverlapPolicyCols: Array<{
    field: string,
    header: string
  }> = [
      {
        field: 'id',
        header: this.translate.translateService.instant(TranslationMap['ID'])
      },
      {
        field: 'policyDateRange',
        header: this.translate.translateService.instant(TranslationMap['DATE_RANGE'])
      },
      {
        field: 'policyName',
        header: this.translate.translateService.instant(TranslationMap['POLICY_NAME'])
      },
      {
        field: 'issue',
        header: this.translate.translateService.instant(TranslationMap['ISSUE'])
      }
    ];

  constructor(private modalService: NgbModal,
    private translate: TcTranslateService,
    private utilityService: PolicyMgmtUtilityService) {
    this.translationMap = TranslationMap;
  }

  ngOnInit(): void {
    this.overlapPolicyCols = [...this.initOverlapPolicyCols];
  }

  /**
   * Method to open policy overlap modal to show list of items
   * @param overlapPolicyInfo: list of policies returned by search api
   */
  openPolicyOverlapModal(overlapPolicyInfo: Array<IOverlapPolicyInfo>) {
    let columns: Array<{
      field: string,
      header: string
    }> = [];

    const creationLevel: string = overlapPolicyInfo[0].policyLevel;
    if (creationLevel === ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES) {
      columns.push({
        field: 'name',
        header: this.translate.translateService.instant(TranslationMap['CHAIN_CATEGORIES'])
      });
    } else if (creationLevel === ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS) {
      columns.push({
        field: 'name',
        header: this.translate.translateService.instant(TranslationMap['RATE_PLANS'])
      });
    } else if (creationLevel === ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES) {
      columns.push({
        field: 'name',
        header: this.translate.translateService.instant(TranslationMap['RATE_CATEGORIES'])
      });
    } else {
      columns.push({
        field: 'name',
        header: this.translate.translateService.instant(TranslationMap['CHAIN'])
      });
    }

    this.overlapPolicyCols = columns.concat(this.initOverlapPolicyCols);
    this.policyOverlapListData = overlapPolicyInfo;
    this.policyOverlapComponentModalRef = this.modalService.open(this.policyOverlapContentRef, {
      backdrop: 'static',
      windowClass: 'tc-modal tc-modal-90 policy-overlap-modal'
    });

    return this.policyOverlapComponentModalRef;
  }

  /**
   * Method to close policy overlap modal
   * @param isOkClicked: true if OK button is clicked
   */
  closePolicyOverlapModal(isOkClicked: boolean) {
    this.isOkClicked = isOkClicked;
    this.policyOverlapComponentModalRef.close();
  }

  /**
   * Export the CSV data
   * @param csvPolicyOverlapDataArray list data modal to be exported as CSV data
   */
  exportCsvData(csvPolicyOverlapDataArray: Array<any>) {
    const fileName = `${this.translate.translateService.instant(TranslationMap['EXPORT'])}.csv`;
    this.utilityService.exportToCSV(csvPolicyOverlapDataArray, fileName, false);
  }
}