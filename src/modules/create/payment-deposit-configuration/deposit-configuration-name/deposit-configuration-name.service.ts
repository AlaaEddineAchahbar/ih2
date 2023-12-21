import { Injectable } from '@angular/core';
import {
  IPaymentDepositConfigurationDetailData, IPaymentDepositConfigurationNameErrorModel
} from '../payment-deposit-configuration-create.model';
import { ErrorMessage } from '../../../core/common.model';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from '../../../core/translation.constant';


@Injectable()
export class PaymentDepositConfigurationNameService {

  /**
   * Holds Translation map
   */
  translationMap: any;

  constructor(
    private translate: TcTranslateService
  ) {
    this.translationMap = TranslationMap;
  }

  /**
   * Validates and returns error object
   * @param data: deposit configuration detail data
   * @returns errorObj: IPaymentDepositConfigurationNameErrorModel
   */
  validateDepositConfigurationDetailStepData(data: IPaymentDepositConfigurationDetailData) {
    const errorObj: IPaymentDepositConfigurationNameErrorModel = {
      depositConfigurationNameErrorMessage: new ErrorMessage()
    };

    // remove whitespaces from beginning and end of payment deposit configuration name.
    data.paymentDepositConfigurationName = data.paymentDepositConfigurationName.trim();

    // check if Payment Deposit Configuration is an Empty String or Not.
    if (data.paymentDepositConfigurationName.length === 0) {
      errorObj.depositConfigurationNameErrorMessage = {
        show: true,
        message: this.translate.translateService.instant(this.translationMap.ENTER_A_DEPOSIT_CONFIGURATION_NAME),
      };
    }
    return errorObj;
  }
}
