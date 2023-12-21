import { Component, OnInit } from '@angular/core';
import { PolicyMgmtTemplateStepperDataService } from '../../policy-mgmt-template-stepper-data.service';
import { ITemplateDetailsRulesData } from '../../policy-mgmt-create-template.model';
import { TranslationMap } from '../../../../core/translation.constant';
import { ContextService } from '../../../../core/context.service';
import { PolicyMgmtStepTemplateDetailsService } from '../policy-mgmt-step-template-details.service';
import { CANCELLATION_OPTIONS, OTA_CANCELLATION_CHARGE_OPTIONS, ACCEPTED_TENDER_OPTIONS } from '../../../../core/rules-config.constant';
import { POLICY_LEVEL, POLICY_TYPE, DEFAULT_VALUES, PAYMENT_PROCESSING_STATUS } from '../../../../core/constants';
import { TcTranslateService } from 'tc-angular-services';
import { SharedDataService } from '../../../../core/shared.data.service';
import { IDropDownItem, IHotelInfo } from '../../../../core/common.model';

@Component({
  selector: 'policy-mgmt-template-details-preview',
  templateUrl: './policy-mgmt-template-details-preview.component.html',
  styleUrls: ['./policy-mgmt-template-details-preview.component.scss']
})
export class PolicyMgmtTemplateDetailsPreviewComponent implements OnInit {

  previewStepData: ITemplateDetailsRulesData;
  translationMap: any;
  acceptedTender: string;
  cancellationNoticeTime: string;
  otaCancellationCharge: string;
  nightsRoomTax: string;
  hotelInfo: IHotelInfo;

  constructor(
    private stepperDataService: PolicyMgmtTemplateStepperDataService,
    private contextService: ContextService,
    private templateDetailsService: PolicyMgmtStepTemplateDetailsService,
    private translate: TcTranslateService,
    private sharedDataService: SharedDataService
  ) {
    this.translationMap = TranslationMap;
    /* Hotel info */
    this.hotelInfo = this.sharedDataService.getHotelInfo() ? this.sharedDataService.getHotelInfo() : null;
  }

  ngOnInit() {
    this.previewStepData = this.stepperDataService.getTemplateDetailData();
    if (this.previewStepData.fields.acceptedTender) {
      const acceptedTenderList: IDropDownItem[] = this.sharedDataService.getMetaData().acceptedTender[this.contextService.policyType];
      this.previewStepData.fields.acceptedTender = this.templateDetailsService.getFieldNameById(
        acceptedTenderList,
        this.previewStepData.fields.acceptedTender
      );
    }
    if (this.previewStepData.fields.depositRule) {
      const depositRuleList: IDropDownItem[] = this.sharedDataService.getDepositRulesList();
      const depositRule = this.templateDetailsService.getFieldNameById(
        depositRuleList,
        this.previewStepData.fields.depositRule
      );
      this.previewStepData.fields.depositRule = depositRule ? depositRule : null;
    }

    if (this.previewStepData.fields.otaCancellationChargeNotification) {
      switch (this.previewStepData.fields.otaCancellationChargeNotification) {
        case OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX:
          this.otaCancellationCharge = this.previewStepData.fields.otaNightRoomNTaxAmt + ' ';
          break;
        case OTA_CANCELLATION_CHARGE_OPTIONS.FLAT:
          this.otaCancellationCharge = ' - ' + this.previewStepData.fields.otaFlatAmt;
          break;
        case OTA_CANCELLATION_CHARGE_OPTIONS.PERCENTAGE:
          this.otaCancellationCharge = ' - ' + this.previewStepData.fields.otaPercentageAmt;
          break;
      }
    }

    if (this.previewStepData.fields.cancellationNotice) {
      switch (this.previewStepData.fields.cancellationNotice) {
        case CANCELLATION_OPTIONS.SAME_DAY:
          this.cancellationNoticeTime = ' - ' + this.previewStepData.fields.sameDayNoticeTime + ':00';
          break;
        case CANCELLATION_OPTIONS.ADVANCE_NOTICE:
          this.cancellationNoticeTime = ' - ' + this.previewStepData.fields.advanceNotice.days + ' '
            + this.translate.translateService.instant(this.translationMap.DAYS_PLUS) + ', '
            + this.previewStepData.fields.advanceNotice.hours + ' '
            + this.translate.translateService.instant(this.translationMap.HOURS);
          break;
      }
    }
    this.nightsRoomTax = OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX;

  }

  checkVisibility(key: string) {
    let visibility = this.previewStepData.fields.hasOwnProperty(key);
    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      switch (key) {
        case 'lateArrivalTime':
          visibility = this.hotelInfo && this.hotelInfo.hotelSettings.isGdsEnabled &&
            visibility && this.previewStepData.fields.acceptedTender === ACCEPTED_TENDER_OPTIONS.ACCEPT_ALL;
          break;
        case 'depositRule':
          visibility = visibility && this.hotelInfo &&
            (this.hotelInfo.paymentInfo.processingMode !== PAYMENT_PROCESSING_STATUS.DISABLED
              || this.hotelInfo.hotelSettings.isGdsEnabled);
          break;
      }
    }
    return visibility;
  }
}
