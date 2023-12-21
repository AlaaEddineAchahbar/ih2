/* Angular-Module Imports */
import { Injectable } from '@angular/core';

/* Third Party Module Imports */
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/* TC-module Imports */
import { IHTTPResponse } from '../../core/common.model';
import {
  API_CONTEXT_PATH,
  API_RESPONSE_CODE,
  GLOBAL_CONFIG,
  POLICY_LEVEL,
  POLICY_FLOW
} from '../../core/constants';
import { ContextService } from '../../core/context.service';
import { HTTPService } from '../../core/http.service';
import { TranslationMap } from '../../core/translation.constant';
import {
  CHARGE_TYPES,
  EmPaymentDepositRulesResponseModel,
  IEmPaymentDepositRulesCreateUpdateResponseModel,
  IPropertyPaymentDepositRuleDetail,
  IPropertyPaymentDepositRulesResponseModel
} from './payment-deposit-configuration-create.model';
import { IEmPaymentDepositRulesResponseModel } from '../../search/policy-mgmt-search.model';
import { SharedDataService } from 'src/modules/core/shared.data.service';
import {
  DEPOSIT_CONFIGURATION_OWNER_TYPE,
  PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE,
  PROPERTY_DEPOSIT_CONFIGURATION_STATUS
} from 'src/modules/core/rules-config.constant';
import { RULE_PRIORITY } from 'src/modules/core/rules.constant';

@Injectable()
export class PaymentDepositConfigurationCreateService {
  translationMap: any;

  constructor(
    private httpService: HTTPService,
    private contextService: ContextService,
    private sharedDataService: SharedDataService
  ) {
    this.translationMap = TranslationMap;
  }

  /**
   * returns the payment deposit rule data
   */
  getPaymentDepositConfigurationData(id: number): Observable<IEmPaymentDepositRulesResponseModel> {
    let apiUrl = '';
    if (GLOBAL_CONFIG.PRODUCTION) {
      if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
        const chainCode = this.contextService.getChainCode();
        apiUrl = `enterprise/${chainCode}/payment-deposit-rule/${id}`;
        return this.httpService.get(apiUrl, API_CONTEXT_PATH.IHONBOARDING)
          .pipe(map(this.mapPaymentDepositRule));
      } else {
        return null;
      }
    } else {
      apiUrl = 'payment-deposit-rule/edit/PaymentDepositRulesResponse.json';
      return this.httpService.get(apiUrl, '').pipe(map((res: IHTTPResponse) => res.body));
    }
  }

  /**
   * Sends GET request to return the property payment deposit configuration data
   * @param id: id of property payment deposit rule
   * @returns observale of IPropertyPaymentDepositRulesResponseModel
   */
  getPropertyPaymentDepositConfigurationData(id: number): Observable<IPropertyPaymentDepositRulesResponseModel> {
    let apiUrl = '';
    if (GLOBAL_CONFIG.PRODUCTION) {
      const hotelCode = this.sharedDataService.getHotelInfo().hotelCode;
      apiUrl = `hotels/${hotelCode}/payment-deposit-rule/${id}`;

      return this.httpService.get(apiUrl, API_CONTEXT_PATH.POLICY_MGMT)
        .pipe(map(this.mapPropertyPaymentDepositRule));
    } else {
      apiUrl = 'payment-deposit-rule/retrieve/PaymentDepositRulesResponse.json';
      return this.httpService.get(apiUrl, API_CONTEXT_PATH.POLICY_MGMT).pipe(map((res: IHTTPResponse) => res.body));
    }
  }

  /**
   * Sends Create/POST or Update/PUT request
   * @param data: create/update payment deposit configuration request data
   */
  createUpdatePaymentDepositConfiguration(data: IEmPaymentDepositRulesResponseModel): Observable<any> {
    let apiUrl = '';
    let responseData: IEmPaymentDepositRulesCreateUpdateResponseModel = {
      emPaymentDepositRule: new EmPaymentDepositRulesResponseModel()
    };
    responseData.emPaymentDepositRule = data;
    if (GLOBAL_CONFIG.PRODUCTION) {
      const chainCode = this.contextService.getChainCode();
      apiUrl = `enterprise/${chainCode}/payment-deposit-rule`;

      // Make POST/PUT call depending on the flow - Create/Edit
      if (this.contextService.policyFlow === POLICY_FLOW.CREATE) {
        return this.httpService.post(apiUrl, responseData, API_CONTEXT_PATH.POLICY_MGMT)
          .pipe(map((res: IHTTPResponse) => res.body));
      } else {
        return this.httpService.put(apiUrl, responseData, API_CONTEXT_PATH.POLICY_MGMT)
          .pipe(map((res: IHTTPResponse) => res.body));
      }
    } else {
      apiUrl = 'payment-deposit-rule/edit/PaymentDepositRulesResponse.json';
      if (this.contextService.policyFlow === POLICY_FLOW.CREATE) {
        apiUrl = 'payment-deposit-rule/create/PaymentDepositRulesResponse.json';
        return this.httpService.post(apiUrl, responseData, API_CONTEXT_PATH.POLICY_MGMT)
          .pipe(map((res: IHTTPResponse) => res.body));
      } else {
        return this.httpService.put(apiUrl, responseData, API_CONTEXT_PATH.POLICY_MGMT)
          .pipe(map((res: IHTTPResponse) => res.body));
      }
    }
  }

  /**
   * Sends Create/POST or Update/PUT
   * @param data: create/update property payment deposit configuration request data
   */
  createUpdatePropertyPaymentDepositConfiguration(data: IPropertyPaymentDepositRulesResponseModel): Observable<any> {
    let apiUrl = '';
    if (GLOBAL_CONFIG.PRODUCTION) {
      const hotelCode = this.sharedDataService.getHotelInfo().hotelCode;

      // Make POST/PUT call depending on the flow - Create/Edit
      if (this.contextService.policyFlow === POLICY_FLOW.CREATE) {
        apiUrl = `hotels/${hotelCode}/payment-deposit-rule`;
        return this.httpService.post(apiUrl, data, API_CONTEXT_PATH.POLICY_MGMT)
          .pipe(map((res: IHTTPResponse) => res.body));
      } else {
        apiUrl = `hotels/${hotelCode}/payment-deposit-rule/${data.paymentDepositRuleId}`;
        return this.httpService.put(apiUrl, data, API_CONTEXT_PATH.POLICY_MGMT)
          .pipe(map((res: IHTTPResponse) => res.body));
      }
    } else {
      if (this.contextService.policyFlow === POLICY_FLOW.CREATE) {
        apiUrl = 'property-payment-deposit-rule/create/payment-deposit-rule-response.json';
        return this.httpService.post(apiUrl, data, API_CONTEXT_PATH.POLICY_MGMT)
          .pipe(map((res: IHTTPResponse) => res.body));
      } else {
        apiUrl = 'property-payment-deposit-rule/edit/payment-deposit-rule-response.json';
        return this.httpService.put(apiUrl, data, API_CONTEXT_PATH.POLICY_MGMT)
          .pipe(map((res: IHTTPResponse) => res.body));
      }
    }
  }

  /**
   * Map the response to the payment deposit rule data
   * @param res
   * @returns
   */
  mapPaymentDepositRule(res: IHTTPResponse): IEmPaymentDepositRulesResponseModel {
    if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
      if (res.body) {
        let depositRuleData: IEmPaymentDepositRulesResponseModel = new EmPaymentDepositRulesResponseModel();
        depositRuleData.emPaymentDepositRuleTemplateName = res.body.emPaymentDepositRuleTemplateName;
        depositRuleData.emPaymentDepositRuleTemplateId = res.body.emPaymentDepositRuleTemplateId;
        depositRuleData.chainInfo = res.body.chainInfo;
        depositRuleData.paymentDepositRule = res.body.paymentDepositRule;
        return depositRuleData;
      }
    }
    return null;
  }

  /**
   * Map the response to the property payment deposit rule data
   * @param response returned from the api
   * @returns IPropertyPaymentDepositRulesResponseModel
   */
  mapPropertyPaymentDepositRule(response: IHTTPResponse): IPropertyPaymentDepositRulesResponseModel {
    if (response.status === API_RESPONSE_CODE.GET_SUCCESS) {
      if (response.body) {
        let depositRuleData: IPropertyPaymentDepositRulesResponseModel = {
          paymentDepositRuleName: response.body.name,
          paymentDepositRuleId: Number(response.body.depositRuleId),
          active: 1,
          hotelId: response.body.hotelId,
          ownerType: response.body.ruleInfo[0].ownerType,
          status: PROPERTY_DEPOSIT_CONFIGURATION_STATUS.EDIT,
          rules: response.body.ruleInfo.map((rule: IPropertyPaymentDepositRuleDetail) => ({
            chargeType: rule.chargeType,
            chargeDate: RULE_PRIORITY.defaultPolicy,
            percentOnEnhancement: Number(rule.percentOnEnhancement),
            chargeAmount: Number(rule.chargeAmount),
            chargePercentage: Number(rule.chargePercentage)
          }))
        };

        depositRuleData.rules.forEach((rule) => {
          switch (rule.chargeType) {
            case CHARGE_TYPES.ARRIVAL_DAY_CHARGE:
              rule.chargeType = PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE.ARRIVAL_DAY;
              break;
            case CHARGE_TYPES.FLAT:
              rule.chargeType = PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE.FLAT;
              break;
            case CHARGE_TYPES.PERCENTAGE:
              rule.chargeType = PROPERTY_DEPOSIT_CONFIGURATION_CHARGE_TYPE.PERCENTAGE;
              break;
            default:
              break;
          }
        });
        return depositRuleData;
      }
    }
    return null;
  }
}
