import { Component, OnInit } from '@angular/core';
import { PolicyMgmtTemplateStepperDataService } from '../../policy-mgmt-template-stepper-data.service';
import { IDistributionMsgRulesData } from '../../policy-mgmt-create-template.model';
import { TranslationMap } from '../../../../core/translation.constant';
import { DEFAULT_VALUES } from '../../../../core/constants';

@Component({
  selector: 'policy-mgmt-distribution-messages-preview',
  templateUrl: './policy-mgmt-distribution-messages-preview.component.html',
  styleUrls: ['./policy-mgmt-distribution-messages-preview.component.scss']
})
export class PolicyMgmtDistributionMessagesPreviewComponent implements OnInit {

  translationMap: any;
  previewStepData: IDistributionMsgRulesData;
  languageIdForEnglish: number;

  constructor(private stepperDataService: PolicyMgmtTemplateStepperDataService) {
    this.translationMap = TranslationMap;
    this.languageIdForEnglish = DEFAULT_VALUES.messageLangDropdown.defaultLangId;
   }

  ngOnInit() {

    this.previewStepData = this.stepperDataService.getDistributionMsgData();
  }

  checkVisibility(key: string) {
    return this.previewStepData.fields.hasOwnProperty(key);
  }

}
