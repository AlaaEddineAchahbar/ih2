import { Injectable } from '@angular/core';
import { HTTPService } from '../../core/http.service';
import { ITemplateResponseModel, IEntDepositConfigurationDetailsModel, IDepositRuleInfoModel } from './policy-mgmt-create-template.model';
import {
    GLOBAL_CONFIG, API_CONTEXT_PATH, POLICY_TYPE_FOR_API, POLICY_LEVEL,
    API_RESPONSE_CODE, POLICY_FLOW, POLICY_TYPE
} from '../../core/constants';
import { ContextService } from '../../core/context.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IHTTPResponse, IDropDownItem } from '../../core/common.model';
import { TranslationMap } from '../../core/translation.constant';
import { SharedDataService } from '../../core/shared.data.service';
import { CANCELLATION_OPTIONS, DISTRIBUTION_MESSAGES } from '../../core/rules-config.constant';
import { DEFAULT_ADVANCE_NOTICE, DEPOSIT_CONFIGURATION_CONSTANTS } from './policy-mgmt-create-template.constant';
import { IEMTemplateResponseModel } from '../../search/policy-mgmt-search.model';

@Injectable()
export class PolicyMgmtCreateTemplateService {
    translationMap: any;

    /**
     * holding boolean value to check create template popup flag
     */
    templatePopUp: boolean;
    constructor(
        private httpService: HTTPService,
        private contextService: ContextService,
        private sharedDataService: SharedDataService
    ) {
        this.translationMap = TranslationMap;
    }

    /**
     * returns the template data
     */
    getTemplateResponseData(templateId: number): Observable<ITemplateResponseModel> {
      let apiUrl = '';
      if (GLOBAL_CONFIG.PRODUCTION) {
          if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
              const hotelCode = this.sharedDataService.getHotelInfo().hotelCode;
              apiUrl = 'hotels/' + hotelCode + '/policy-template/'
                  + POLICY_TYPE_FOR_API[this.contextService.policyType] + '/' + templateId;
              return this.httpService.get(apiUrl, API_CONTEXT_PATH.POLICY_MGMT)
              .pipe(map(this.mapTemplateData));
          } else {
            const chainCode = this.contextService.getChainCode();
            apiUrl = `enterprise/${chainCode}/policyTemplate/${templateId}`;
            return this.httpService.get(apiUrl, API_CONTEXT_PATH.IHONBOARDING)
              .pipe(map(this.mapTemplateData));
          }
      } else {
          const policyLevel = this.contextService.policyLevel === POLICY_LEVEL.PROPERTY ? '' : 'enterprise_';
          apiUrl = `policy-template/getTemplate/${policyLevel}${this.contextService.policyType}.json`;
          return this.httpService.get(apiUrl, '').pipe(map((res: IHTTPResponse) => res.body));
      }
    }

    /**
     * Sends create template post request
     * @param data: create template request data
     */
    createUpdatePolicyTemplate(data: ITemplateResponseModel | IEMTemplateResponseModel, templateId: number = null): Observable<any> {

        let apiUrl = '';
        if (GLOBAL_CONFIG.PRODUCTION) {
            if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
                const hotelCode = this.sharedDataService.getHotelInfo().hotelCode;
                apiUrl = 'hotels/' + hotelCode + '/policy-template/'
                    + POLICY_TYPE_FOR_API[this.contextService.policyType];
                if (this.contextService.policyFlow === POLICY_FLOW.EDIT) {
                    apiUrl += '/' + templateId;
                }
            } else {
                const chainCode = this.sharedDataService.getChainInfo().chainCode;
                apiUrl = `enterprise/${chainCode}/policyTemplate/${POLICY_TYPE_FOR_API[this.contextService.policyType]}`;
            }

            // make Post/Put call depends on flow - create/Edit
            if (this.contextService.policyFlow === POLICY_FLOW.CREATE) {
                if(GLOBAL_CONFIG.LOCAL_BACK_END) {
                    return this.httpService.postLocal(apiUrl, data, API_CONTEXT_PATH.POLICY_MGMT)
                    .pipe(map((res: IHTTPResponse) => res.body));
                }
                return this.httpService.post(apiUrl, data, API_CONTEXT_PATH.POLICY_MGMT)
                    .pipe(map((res: IHTTPResponse) => res.body));
            } else {
              if(GLOBAL_CONFIG.LOCAL_BACK_END) {
                return this.httpService.putLocal(apiUrl, data, API_CONTEXT_PATH.POLICY_MGMT)
                    .pipe(map((res: IHTTPResponse) => res.body));
              }
                return this.httpService.put(apiUrl, data, API_CONTEXT_PATH.POLICY_MGMT)
                    .pipe(map((res: IHTTPResponse) => res.body));
            }

        } else {
            if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
                apiUrl = `policy-template/postTemplate/${this.contextService.policyType}.json`;
            } else {

            }
            return this.httpService.get(apiUrl, '')
                .pipe(map((res: IHTTPResponse) => res.body));
        }
    }

    /**
     * returns resolved promise - deposit rules list
     */
    async loadDepositRuleListInfo(): Promise<any> {
        const depositRuleListObservable = await this.getDepositRuleList().toPromise();
        return Promise.resolve({
            depositRuleListObservable
        });
    }

    /**
     * returns deposit rules list data
     */
    getDepositRuleList() {
        let apiUrl = '';
        if (GLOBAL_CONFIG.PRODUCTION) {
            if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
                const hotelCode = this.sharedDataService.getHotelInfo().hotelCode;
                apiUrl = `hotels/${hotelCode}/payment-deposit-rule/search`;

                return this.httpService.post(apiUrl, {}, API_CONTEXT_PATH.POLICY_MGMT)
                    .pipe(map(this.mapDepositRules));
            } else {
                const chainCode = this.sharedDataService.getChainInfo().chainCode;
                apiUrl = `enterprise/${chainCode}/payment-deposit-rule/name-list`;

                return this.httpService.get(apiUrl, API_CONTEXT_PATH.POLICY_MGMT)
                    .pipe(map(this.mapEntDepositRules));
            }
        } else {
            if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
                apiUrl = 'policy-template/getDepositRules/deposit-rules.json';
            } else {
                apiUrl = 'policy-template/getDepositRules/ent-dr-name-list.json';
            }
            return this.httpService.get(apiUrl, '')
                .pipe(map(this.mapDepositRules));
        }
    }

    /**
     * Map function to modify deposit rules list and return list
     */
    mapDepositRules = (res: IHTTPResponse): Array<IDropDownItem> | boolean => {
        if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
            const depositRules: Array<IDropDownItem> = [];
            if (res.body) {
                res.body.paymentDepositRules.forEach(rule => {
                    depositRules.push({
                        id: Number(rule.depositRuleId),
                        name: rule.name,
                        chargePercentage: rule.chargePercentage
                    });
                });
                this.sharedDataService.setDepositRulesList(depositRules);
                return depositRules;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    /**
     * Map function to modify deposit rules list and return list
     */
    mapEntDepositRules = (res: IHTTPResponse): Array<IDropDownItem> | boolean => {
        if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
            const depositRules: Array<IDropDownItem> = [];
            if (res.body && res.body.paymentDepositRuleNames) {
                res.body.paymentDepositRuleNames.forEach(rule => {
                    depositRules.push({
                        id: Number(rule.paymentDepositRuleTemplateId),
                        name: rule.paymentDepositRuleName
                    });
                });
                this.sharedDataService.setDepositRulesList(depositRules);
                return depositRules;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    /**
     * This Function will return Deposit Rule Details based on
     * selected RuleID from Dropdown
     */
    getDepositRuleDetails(ruleId: number): Observable<any> {
        let apiUrl = '';
        if (GLOBAL_CONFIG.PRODUCTION) {
            if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
                const hotelCode = this.sharedDataService.getHotelInfo().hotelCode;
                apiUrl = 'hotels/' + hotelCode + '/depositrule/'
                    + ruleId;
                return this.httpService.get(apiUrl, API_CONTEXT_PATH.POLICY_MGMT)
                    .pipe(map((res: IHTTPResponse) => res.body));
            } else {
                const chainCode = this.sharedDataService.getChainInfo().chainCode;
                apiUrl = `enterprise/${chainCode}/payment-deposit-rule/${ruleId}`;
                return this.httpService.get(apiUrl, API_CONTEXT_PATH.IHONBOARDING)
                    .pipe(map(this.mapDepositConfigurationDetails));
            }

        } else {
            if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
                apiUrl = 'policy-template/getDepositRules/deposit-rule-details.json';
            } else {
                // apiUrl = 'policy-template/getPolicy.json';
            }
            return this.httpService.get(apiUrl, '')
                .pipe(map((res: IHTTPResponse) => res.body));
        }
    }

    mapDepositConfigurationDetails = (res: IHTTPResponse, ruleId: number): IEntDepositConfigurationDetailsModel | boolean => {
        if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
            if (res.body && res.body.paymentDepositRule) {
                const depositConfigurationDetail: IEntDepositConfigurationDetailsModel = {
                    name: res.body.paymentDepositRule.ruleName,
                    ruleInfo: this.mapRuleInfo(res.body.paymentDepositRule.rules)
                };
                return depositConfigurationDetail;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    mapRuleInfo(rules): Array<IDepositRuleInfoModel>{
        const ruleInfos: Array<IDepositRuleInfoModel> = [];
        rules.forEach(rule => {
            if(rule.chargeType === 'flat'){
                rule.chargeAmounts.forEach(chargeAmount => {
                    chargeAmount.currency.forEach(currency => {
                        ruleInfos.push({
                            status: rule.status,
                            chargeDate: DEPOSIT_CONFIGURATION_CONSTANTS.CHARGE_DATE,
                            action: DEPOSIT_CONFIGURATION_CONSTANTS.CHARGE_ACTION,
                            chargeType: rule.chargeType.toUpperCase(),
                            chargeAmount: `${chargeAmount.chargeAmount} ${currency}`,
                            chargePercentage: rule.chargePercentage,
                            percentOnEnhancement: rule.percentOnEnhancement
                        });
                    });
                });
            } else {
                ruleInfos.push({
                    status: rule.status,
                    chargeDate: DEPOSIT_CONFIGURATION_CONSTANTS.CHARGE_DATE,
                    action: DEPOSIT_CONFIGURATION_CONSTANTS.CHARGE_ACTION,
                    chargeType: rule.chargeType === 'arrivalDay' ?
                    DEPOSIT_CONFIGURATION_CONSTANTS.ARRIVAL_DAY_CHARGE : rule.chargeType.toUpperCase(),
                    chargeAmount: '',
                    chargePercentage: rule.chargePercentage,
                    percentOnEnhancement: rule.percentOnEnhancement
                });
            }

        });
        return ruleInfos;
    }

    /**
     * This function will help to set any default value if any property is
     * missing in case of Edit Flow.
     */
    mapTemplateData = (res: IHTTPResponse): ITemplateResponseModel => {
        if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
            if (res.body) {
              const templateData: ITemplateResponseModel = res.body;
              const policySetting = templateData.policySetting;
                  if (this.contextService.policyType === POLICY_TYPE.CANCELLATION) {
                      if (policySetting.hasOwnProperty('otaSetting')) {
                          if (policySetting.otaSetting.hasOwnProperty('otaChargeAmount')) {
                              policySetting.otaSetting.otaChargeAmount = policySetting.otaSetting.otaChargeAmount !== 0 ?
                                  policySetting.otaSetting.otaChargeAmount : null;
                          }
                          if (policySetting.otaSetting.hasOwnProperty('otaChargeNights')) {
                              policySetting.otaSetting.otaChargeNights = policySetting.otaSetting.otaChargeNights !== 0 ?
                                  policySetting.otaSetting.otaChargeNights : null;
                          }
                          if (policySetting.otaSetting.hasOwnProperty('otaChargePercentage')) {
                              policySetting.otaSetting.otaChargePercentage = policySetting.otaSetting.otaChargePercentage !== 0 ?
                                  policySetting.otaSetting.otaChargePercentage : null;
                          }
                      } else {
                          policySetting.otaSetting = {
                              otaChargeType: '',
                              otaChargeAmount: null,
                              otaChargeNights: null,
                              otaChargePercentage: null
                          };
                      }
                      if (policySetting.hasOwnProperty('cancellationRule') &&
                          policySetting.cancellationRule.chargeType === CANCELLATION_OPTIONS.NON_REFUNDABLE) {
                          policySetting.cancellationRule.priorDays = DEFAULT_ADVANCE_NOTICE.PRIOR_DAYS;
                          policySetting.cancellationRule.priorHours = DEFAULT_ADVANCE_NOTICE.PRIOR_HOURS;
                      }
                  }

                  if (this.contextService.policyType === POLICY_TYPE.GUARANTEE) {
                      if (policySetting.hasOwnProperty('holdTime')) {
                          policySetting.holdTime = policySetting.holdTime !== 0 ? policySetting.holdTime : null;
                      }
                  }

                  if (this.contextService.policyType === POLICY_TYPE.DEPOSIT) {
                      if (policySetting.hasOwnProperty('depositRuleId')) {
                          policySetting.depositRuleId = policySetting.depositRuleId !== 0 ? policySetting.depositRuleId : null;
                      }
                  }

                  if (!templateData.hasOwnProperty('textList')) {
                      templateData.textList = [
                          {
                              textType: DISTRIBUTION_MESSAGES.onlineCCMessage,
                              languageTexts: []
                          },
                          {
                              textType: DISTRIBUTION_MESSAGES.gdsLine1,
                              languageTexts: []
                          },
                          {
                              textType: DISTRIBUTION_MESSAGES.gdsLine2,
                              languageTexts: []
                          }
                      ];
                  }
                  return templateData;
            }
        }
        return null;
    };
}
