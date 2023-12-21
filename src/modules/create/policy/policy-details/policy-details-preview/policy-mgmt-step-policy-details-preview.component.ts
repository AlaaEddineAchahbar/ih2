import { Component, OnInit } from '@angular/core';
import { PolicyMgmtPolicyStepperDataService } from '../../policy-mgmt-policy-stepper-data.service';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from '../../../../core/translation.constant';
import { IPolicyDetailsRulesData, DaysOfWeek } from '../../policy-mgmt-create-policy.model';
import * as moment from 'moment';
import { DEFAULT_DATED_POLICY_TYPE } from '../../../../core/rules.constant';
import { RulesMataDataService } from '../../../../core/rules-meta-data.service';
import { PolicyMgmtStepPolicyDetailsService } from '../policy-mgmt-step-policy-details.service';

@Component({
  selector: 'policy-mgmt-step-policy-details-preview',
  templateUrl: './policy-mgmt-step-policy-details-preview.component.html'
})
export class PolicyMgmtStepPolicyDetailsPreviewComponent implements OnInit {
  /**
   * step2 policy details data
   */
  previewStepData: IPolicyDetailsRulesData;

  /**
   * Transltion map
   */
  translationMap: any;

  /**
   * Holds Date Range Array
   */
  dateRangeList: Array<string>;

  /**
   * day of week selected
   */
  dowSelected: string;

  constructor(
    private stepperDataService: PolicyMgmtPolicyStepperDataService,
    private translate: TcTranslateService,
    private rulesMetadataService: RulesMataDataService,
    private policyDetailsService: PolicyMgmtStepPolicyDetailsService
  ) {
    this.translationMap = TranslationMap;
    this.dateRangeList = [];
    this.dowSelected = '';
  }

  ngOnInit() {
    this.previewStepData = this.stepperDataService.getPolicyDetailsData();

    if (this.previewStepData.fields.policyType === DEFAULT_DATED_POLICY_TYPE.dated) {
      // Set DateRange Display
      for (const dateRange of this.previewStepData.fields.dateRange) {
        const startDate = moment(dateRange.startDate).format('DD-MMM-YYYY');
        const endDate = dateRange.endDate ? moment(dateRange.endDate).format('DD-MMM-YYYY') :
          this.translate.translateService.instant(TranslationMap['NO_END_DATE']);
        this.dateRangeList.push(startDate + ' - ' + endDate);
      }

      // Set WeekDays Display
      const dayOfWeekList = [];
      const dayOfWeekData = this.previewStepData.fields.dayOfWeek;
      if (dayOfWeekData) {
        const isSomeOfDaySelected = Object.keys(dayOfWeekData).some(dow => !dayOfWeekData[dow]);
        if (isSomeOfDaySelected) {
          for (const key in dayOfWeekData) {
            if (dayOfWeekData[key]) {
              dayOfWeekList.push(this.translate.translateService.instant(TranslationMap[key]));
            }
          }
          this.dowSelected = dayOfWeekList.join(', ');
        } else {
          this.dowSelected = this.translate.translateService.instant(TranslationMap['ALL']);
        }
      }
    }

    // set policy template name
    this.previewStepData.fields.policyTemplate = this.rulesMetadataService.getTemplateNameById(parseInt
      (this.previewStepData.fields.policyTemplate, 10));
    this.setTemplateName();
    this.previewStepData.fields.policyTemplate = this.previewStepData.fields.policyTemplate ??
      this.previewStepData.fields['policyTemplateName'];
  }

  /**
   * CheckVisibility of Fields
   */
  checkVisibility(key: string) {
    let visibility;
    switch (key) {
      case DEFAULT_DATED_POLICY_TYPE.dated:
        visibility = this.previewStepData.fields.policyType === DEFAULT_DATED_POLICY_TYPE.dated;
        break;
    }
    return visibility;
  }

  /**
   * Setting selected template name in preview
   * after creation of new policy template using modal.
   */
  setTemplateName() {
    const templateItem = this.policyDetailsService.getTemplateListItem();
    if (templateItem && this.previewStepData.fields.policyTemplate === null) {
      this.previewStepData.fields.policyTemplate = templateItem.name;
    }
  }

}
