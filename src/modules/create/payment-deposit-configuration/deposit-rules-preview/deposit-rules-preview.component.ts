/* Angular-Module Imports */
import { Component, OnInit } from '@angular/core';

/* TC-module Imports */
import { TranslationMap } from '../../../core/translation.constant';
import {
  IPaymentDepositConfigurationRulesData,
  CHARGE_TYPES,
  IPropertyPaymentDepositConfigurationRulesData
} from '../payment-deposit-configuration-create.model';
import { PaymentDepositConfigurationStepperDataService } from '../payment-deposit-configuration-stepper-data.service';
import { ContextService } from '../../../core/context.service';
import { POLICY_LEVEL } from '../../../core/constants';
import { IHotelInfo } from '../../../core/common.model';
import { SharedDataService } from '../../../core/shared.data.service';

@Component({
  selector: 'payment-deposit-configuration-rules-preview',
  templateUrl: './deposit-rules-preview.component.html'
})
export class PaymentDepositConfigurationRulesPreviewComponent implements OnInit {

  depositRulesData: IPaymentDepositConfigurationRulesData | IPropertyPaymentDepositConfigurationRulesData;
  translationMap: any;
  CHARGE_TYPE = CHARGE_TYPES;
  isEnterpriseLevel: boolean;
  depositConfigurationDefaultCurrency: string;
  hotelInfo: IHotelInfo;

  constructor(
    private stepperDataService: PaymentDepositConfigurationStepperDataService,
    private sharedDataService: SharedDataService,
    private contextService: ContextService
  ) {
    this.translationMap = TranslationMap;
    this.isEnterpriseLevel = this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE;
    this.hotelInfo = this.sharedDataService.getHotelInfo();
  }

  ngOnInit(): void {
    if (this.isEnterpriseLevel) {
      this.depositRulesData = this.stepperDataService.getDepositConfigurationRulesData();
    } else {
      this.depositRulesData = this.stepperDataService.getPropertyDepositConfigurationRulesData();
      this.depositConfigurationDefaultCurrency =
        this.stepperDataService.getPropertyDepositConfigurationDefaultCurrency(this.hotelInfo);
    }
  }
}
