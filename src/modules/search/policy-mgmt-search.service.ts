import { Injectable } from '@angular/core';
import { ContextService } from '../core/context.service';
import { HTTPService } from '../core/http.service';
import { SharedDataService } from '../core/shared.data.service';
// tslint:disable-next-line:max-line-length
/*eslint max-len: ["error", { "code": 180 }]*/
import { GLOBAL_CONFIG, API_CONTEXT_PATH, POLICY_LEVEL, CONFIG_TYPE, POLICY_TYPE_FOR_API, API_RESPONSE_CODE, PAYMENT_AUX_CONFIGS, POLICY_FLOW } from '../core/constants';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { IListFormat, IHTTPResponse } from '../core/common.model';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from '../core/translation.constant';
import { IListSearchParams, IPaymentDepositRulesResponseModel, ISearchEMTemplateParams } from './policy-mgmt-search.model';
import {
  EmPaymentDepositRulesResponseModel,
  IEmPaymentDepositRulesCreateUpdateResponseModel,
  IPropertyPaymentDepositRulesResponseModel,
  PropertyPaymentDepositRulesResponseModel
} from '../create/payment-deposit-configuration/payment-deposit-configuration-create.model';
import { IEmPaymentDepositRulesResponseModel, IPaymentDepositRulesChainHotel, IPaymentDepositRule } from '../search/policy-mgmt-search.model';
import { PolicyMgmtSearchPayloadService } from '../core/search-payload.service';
import { POLICY_METADATA_TYPE, POLICY_ASSOCIATED_METADATA_TYPE, ENTERPRISE_POLICY_METADATA_TYPE } from '../core/rules.constant';
import { IPolicyMetadata } from '../core/rules-metadata.model';
import { PolicyMgmtUtilityService } from '../core/utility.service';
import { HttpResponse } from '@angular/common/http';


@Injectable()
export class PolicyMgmtSearchService {

  /**
   * Holds Translation map
   */
  translationMap: any;

  /**
   * Subject for holding hide-filter-panel flag
   */
  hideFilterPanelSubject = new Subject<boolean>();

  /**
   * holds filter state - hide/show
   */
  hideFilterPanel: boolean;

  /**
   * Holds the paymentAuxConfigs values
   */
  paymentAuxConfigsArr: any;

  /**
   * To display Installment sections
   */
  enabledInstallmentFlag: boolean;

  constructor(
    private httpService: HTTPService,
    private sharedDataService: SharedDataService,
    private contextService: ContextService,
    private translate: TcTranslateService,
    private searchPayloadService: PolicyMgmtSearchPayloadService,
    private policyMgmtUtilityService: PolicyMgmtUtilityService
  ) {
    this.paymentAuxConfigsArr = [];
    this.translationMap = TranslationMap;
  }

  /**
   * Updates hide filter boolean
   */
  toggleHideFilterSubject() {
    this.hideFilterPanel = !this.hideFilterPanel;
    this.hideFilterPanelSubject.next(this.hideFilterPanel);
  }

  /**
   * Sets filter to default expanded state.
   */
  setFilterPanelToDefault() {
    this.hideFilterPanel = false;
    this.hideFilterPanelSubject.next(this.hideFilterPanel);
  }

  /**
   * Makes Search call for search screen
   */
  searchPolicies(): Observable<any> {
    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      return this.searchPropertyPolicies();
    } else {
      if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
        return this.searchEnterprisePolicyTemplates();
      } else {
        return this.searchEnterprisePolicies();
      }
    }
  }

  /**
   * Makes Search call for Property Policies screen
   */
  searchPropertyPolicies(): Observable<any> {
    let payload;
    if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
      payload = this.searchPayloadService.getSearchPayload();
    } else {
      payload = this.searchPayloadService.getPolicySearchPayload();
    }

    if (GLOBAL_CONFIG.PRODUCTION) {
      const url = this.formatSearchUrl();
      return this.httpService.post(url, payload, API_CONTEXT_PATH.POLICY_MGMT)
        .pipe(map((this.mapSearchPoliciesData)));
    } else {
      const url = this.formatSearchUrlOnLocal();
      return this.httpService.get(url, '')
        .pipe(map((this.mapSearchPoliciesData)));
    }
  }

  /**
   * Makes Search call for Enterprise Policy Templates screen
   */
  searchEnterprisePolicyTemplates(): Observable<any> {
    const payload = this.searchPayloadService.getSearchEMPayload();
    let httpOperationResult: Observable<HttpResponse<Object>>;

    if (GLOBAL_CONFIG.PRODUCTION) {
      const url = this.formatEnterpriseSearchUrl();
      httpOperationResult = this.httpService.post(url, payload, API_CONTEXT_PATH.IHONBOARDING);
    } else {
      const url = this.formatSearchUrlOnLocal();
      httpOperationResult = this.httpService.get(url, '');
    }
    return httpOperationResult.pipe(map((this.mapSearchPoliciesData)));
  }

  searchDepositConfiguration(): Observable<any> {
    const payload = this.searchPayloadService.getDepositConfigurationPayload();
    const url = this.formatSearchUrl();
    const apiContext = this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE ? API_CONTEXT_PATH.IHONBOARDING : API_CONTEXT_PATH.POLICY_MGMT;
    // replace postLocal by post when api is ready
    if (GLOBAL_CONFIG.LOCAL_BACK_END) {
      return this.httpService.postLocal(url, payload, apiContext)
        .pipe(map((this.mapSearchDepositConfigurationData)));
    } else {
      return this.httpService.post(url, payload, apiContext)
        .pipe(map((this.mapSearchDepositConfigurationData)));
    }
  }

  searchEnterprisePolicies(): Observable<any> {
    let payload;
    payload = this.searchPayloadService.getEnterprisePolicySearchPayload();

    if (GLOBAL_CONFIG.PRODUCTION) {
      const url = this.formatSearchUrl();
      return this.httpService.post(url, payload, API_CONTEXT_PATH.POLICY_MGMT)
        .pipe(map((this.mapSearchEnterprisePoliciesData)));
    } else {
      const url = this.formatSearchUrlOnLocal();
      return this.httpService.get(url, '')
        .pipe(map((this.mapSearchEnterprisePoliciesData)));
    }
  }

  /**
   * function to map Search Policies Data
   */
  mapSearchPoliciesData = (res: IHTTPResponse) => {
    if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
      const response = res.body;
      if (this.contextService.configType === CONFIG_TYPE.POLICY) {
        let policyAssociatedRatePlan = [];
        let policyAssociatedRateCategory = [];
        let policyAssociatedTemplate = [];

        response.policies.forEach(element => {
          if (element.uxRatePlanIds) {
            policyAssociatedRatePlan = policyAssociatedRatePlan.concat(element.uxRatePlanIds);
          }
          if (element.uxRateCategoryIds) {
            policyAssociatedRateCategory = policyAssociatedRateCategory.concat(element.uxRateCategoryIds);
          }
          if (element.uxpolicyTemplateName) {
            policyAssociatedTemplate = policyAssociatedTemplate.concat(element.uxpolicyTemplateName);
          }
        });

        // tslint:disable-next-line:forin
        for (const key in POLICY_METADATA_TYPE) {
          const metaDataType = POLICY_METADATA_TYPE[key];
          const metaData = this.sharedDataService.getPolicyMetadata(metaDataType);
          let policyAssociatedMetaData = [];
          let sortedPolicyTemplateArray = [];
          if (metaDataType === POLICY_METADATA_TYPE.template) {
            policyAssociatedMetaData = this.getPolicyAssociatedMetaData(metaData, metaDataType, policyAssociatedTemplate);
            sortedPolicyTemplateArray = this.policyMgmtUtilityService.customSort(1, 'name', policyAssociatedMetaData);
            this.sharedDataService.setPolicyMetadata(POLICY_ASSOCIATED_METADATA_TYPE.templates, sortedPolicyTemplateArray);
          } else if (metaDataType === POLICY_METADATA_TYPE.rateCategory) {
            policyAssociatedMetaData = this.getPolicyAssociatedMetaData(metaData, metaDataType, policyAssociatedRateCategory);
            this.sharedDataService.setPolicyMetadata(POLICY_ASSOCIATED_METADATA_TYPE.rateCategories, policyAssociatedMetaData);
          } else {
            policyAssociatedMetaData = this.getPolicyAssociatedMetaData(metaData, metaDataType, policyAssociatedRatePlan);
            this.sharedDataService.setPolicyMetadata(POLICY_ASSOCIATED_METADATA_TYPE.ratePlans, policyAssociatedMetaData);
          }
        }
      }
      return response;
    } else {
      return false;
    }
  };

  mapSearchDepositConfigurationData = (res: IHTTPResponse) => {
    if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
      const response = res.body;
      return response;
    } else {
      return false;
    }
  };

  /**
   * function to map Search Policies Data
   */
  mapSearchEnterprisePoliciesData = (res: IHTTPResponse) => {
    if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
      return res.body;
    } else {
      return false;
    }
  };

  /**
   * Policy Associated Meta Data
   */

  getPolicyAssociatedMetaData(metaData: Array<IPolicyMetadata>, metaDataType: string, policyAssociatedMetaData: Array<string>)
    : Array<IPolicyMetadata> {
    const filteredMetaData: Array<IPolicyMetadata> = [];
    if (metaDataType === POLICY_METADATA_TYPE.ratePlan) {
      metaData.forEach(rateCategory => {
        rateCategory.list.forEach(ratePlan => {
          const ratePlanIndex = policyAssociatedMetaData.findIndex(item => item === ratePlan.id);
          if (ratePlanIndex !== -1 && !(filteredMetaData.find(data => data.id === rateCategory.id))) {
            filteredMetaData.push(rateCategory);
          }
        });
      });

    } else if (metaDataType === POLICY_METADATA_TYPE.rateCategory) {
      metaData.forEach(element => {
        const id = element.id.substring(element.id.length - 2);
        const index = policyAssociatedMetaData.findIndex(item => item.endsWith(id));
        if (index !== -1) {
          filteredMetaData.push(element);
        }
      });
    } else {
      metaData.forEach(element => {
        const index = policyAssociatedMetaData.findIndex(item => item === element.name);
        if (index !== -1) {
          filteredMetaData.push(element);
        }
      });
    }
    return filteredMetaData;
  }

  /**
   * generates property search url required.
   */
  formatSearchUrl(): string {
    let searchUrl = '';

    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      searchUrl = `hotels/${this.sharedDataService.getHotelInfo().hotelCode}/`;
    } else {
      searchUrl = `enterprise/${this.sharedDataService.getChainInfo().chainCode}/`;
    }

    if (this.contextService.configType === CONFIG_TYPE.POLICY) {
      searchUrl += this.getSearchPoliciesUrl();
    } else if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
      searchUrl += this.getSearchPolicyTemplatesUrl();
    } else {
      searchUrl += this.getSearchDepositConfigurationUrl();
    }
    searchUrl += '/search';
    return searchUrl;
  }

  /**
   * generates enterprise search url required.
   */
  formatEnterpriseSearchUrl(): string {
    let searchUrl = `enterprise/${this.sharedDataService.getChainInfo().chainCode}/`;
    if (this.contextService.configType === CONFIG_TYPE.POLICY) {
      searchUrl += 'policy/';
    } else {
      searchUrl += 'policyTemplate/';
    }
    searchUrl += POLICY_TYPE_FOR_API[this.contextService.policyType] + '/search';
    return searchUrl;
  }

  getSearchPoliciesUrl(): string {
    return 'policy/' + POLICY_TYPE_FOR_API[this.contextService.policyType];
  }

  getSearchPolicyTemplatesUrl(): string {
    return 'policy-template/' + POLICY_TYPE_FOR_API[this.contextService.policyType];
  }

  getSearchDepositConfigurationUrl(): string {
    return 'payment-deposit-rule';
  }

  /**
   * local JSON data call
   */
  formatSearchUrlOnLocal(): string {
    let searchUrl = '';
    if (this.contextService.configType === CONFIG_TYPE.POLICY) {
      searchUrl = 'policy/';
    } else {
      searchUrl = 'policy-template/';
    }
    searchUrl += 'search/' + this.contextService.policyType + '.json';
    // searchUrl += '?' + this.getQueryParams(payload);
    return searchUrl;
  }

  getQueryParams(payload: IListSearchParams): string {
    let params = '';
    for (const key in payload) {
      if (payload[key].toString().length > 0) {
        params += `${key}=${payload[key].toString().toLowerCase()}&`;
      }
    }
    return params;
  }

  /**
   * Translates the tab list passed
   * @param tabList: list of tabs
   * @returns: translated tab list
   */
  translateTabList(tabList: Array<IListFormat>): Array<IListFormat> {
    const translatedTabList: Array<IListFormat> = [];
    tabList.forEach((tabItem: IListFormat) => {
      translatedTabList.push({
        name: this.translate.translateService.instant(this.translationMap[tabItem.id.toUpperCase()]),
        id: tabItem.id
      });
    });
    return translatedTabList;
  }

  updateStatus(id: number, status: string): Observable<any> {
    const hotelCode = this.sharedDataService.getHotelInfo().hotelCode;
    // tslint:disable-next-line:object-literal-key-quotes
    const payload = { status: status };
    let apiUrl = '';
    if (GLOBAL_CONFIG.PRODUCTION) {
      if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
        apiUrl = 'hotels/' + hotelCode + '/policy-template/'
          + POLICY_TYPE_FOR_API[this.contextService.policyType]
          + '/' + id;

        return this.httpService.patch(apiUrl, payload, API_CONTEXT_PATH.POLICY_MGMT)
          .pipe(map((res: IHTTPResponse) => {
            return res;
          }));
      } else {

      }
    } else {
      if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
        apiUrl = `policy-template/getTemplate/${this.contextService.policyType}.json`;
      } else {

      }
      return this.httpService.patch(apiUrl, null, '')
        .pipe(map((res: IHTTPResponse) => res.body));
    }
    return null;
  }

  /**
   * Checking paymentInfo key contenting auxConfig obj from API to enabledInstallment checkbox  enabled/disabled
   */
  checkPaymentAuxConfigsObj() {
    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      this.paymentAuxConfigsArr = this.sharedDataService.getHotelInfo().paymentInfo.paymentAuxConfigs;
      if (this.paymentAuxConfigsArr === undefined) { return; }
      return this.paymentAuxConfigsArr.some((data) => {
        return (data.auxConfigValue === PAYMENT_AUX_CONFIGS.auxConfigValue &&
          data.auxConfigTypeId === PAYMENT_AUX_CONFIGS.auxConfigTypeId);
      });
    } else {
      return false;
    }
  }

  setEnableInstallment() {
    if (this.checkPaymentAuxConfigsObj()) {
      this.enabledInstallmentFlag = true;
    } else {
      this.enabledInstallmentFlag = false;
    }
    return this.enabledInstallmentFlag;
  }

  setDeleteStatus(depositConfigurationData: IEmPaymentDepositRulesResponseModel & IPaymentDepositRulesResponseModel): Observable<any> {
    let apiUrl = '';
    let responseData;
    if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
      responseData = {
        emPaymentDepositRule: this.mapDepositConfigurationDeleteData(depositConfigurationData)
      };
    } else {
      responseData = this.mapPropertyDepositConfigurationDeleteData(depositConfigurationData);
    }

    if (GLOBAL_CONFIG.PRODUCTION) {
      if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
        const chainCode = this.contextService.getChainCode();
        apiUrl = `enterprise/${chainCode}/payment-deposit-rule`;
      }
      else {
        const hotelCode = this.sharedDataService.getHotelInfo().hotelCode;
        apiUrl = `hotels/${hotelCode}/payment-deposit-rule/${depositConfigurationData.depositRuleId}`;
      }
      return this.httpService.put(apiUrl, responseData, API_CONTEXT_PATH.POLICY_MGMT)
        .pipe(map((res: IHTTPResponse) => res.body));
    } else {
      apiUrl = 'payment-deposit-rule/delete/PaymentDepositRulesDeleteError.json';
      return this.httpService.put(apiUrl, responseData, API_CONTEXT_PATH.POLICY_MGMT)
        .pipe(map((res: IHTTPResponse) => res.body));
    }
  }

  /**
   * Map the response data from search to request data
   * for deposit configuration deletion
   * @param data
   * @returns deposit configuration deletion request data
   */
  mapDepositConfigurationDeleteData(data: IEmPaymentDepositRulesResponseModel): IEmPaymentDepositRulesResponseModel {
    let deleteDepositConfiguration: IEmPaymentDepositRulesResponseModel = new EmPaymentDepositRulesResponseModel();
    let deleteStatus: string = 'delete';

    deleteDepositConfiguration.emPaymentDepositRuleTemplateName = data.emPaymentDepositRuleTemplateName;
    deleteDepositConfiguration.emPaymentDepositRuleTemplateId = data.emPaymentDepositRuleTemplateId;
    deleteDepositConfiguration.chainInfo = data.chainInfo;
    deleteDepositConfiguration.paymentDepositRule = data.paymentDepositRule;
    deleteDepositConfiguration.paymentDepositRule.status = deleteStatus;
    deleteDepositConfiguration.chainInfo.chainHotels.forEach((hotel: IPaymentDepositRulesChainHotel) => {
      hotel.status = deleteStatus;
    });
    deleteDepositConfiguration.paymentDepositRule.rules.forEach((rule: IPaymentDepositRule) => {
      rule.status = deleteStatus;
    });

    return deleteDepositConfiguration;
  }

  /**
   * Map the response data from search to request data
   * for deposit configuration deletion
   * @param data
   * @returns deposit configuration deletion request data
   */
  mapPropertyDepositConfigurationDeleteData(data: IPaymentDepositRulesResponseModel): PropertyPaymentDepositRulesResponseModel {
    let deleteDepositConfiguration: PropertyPaymentDepositRulesResponseModel = new PropertyPaymentDepositRulesResponseModel();
    let deleteStatus: string = POLICY_FLOW.DELETE;

    deleteDepositConfiguration.hotelId = this.sharedDataService.getHotelInfo().hotelCode;
    deleteDepositConfiguration.paymentDepositRuleId = data.depositRuleId;
    deleteDepositConfiguration.status = deleteStatus;
    deleteDepositConfiguration.ownerType = data.ownerType;
    deleteDepositConfiguration.paymentDepositRuleName = data.name;

    return deleteDepositConfiguration;
  }

  /**
   * Retrieve name, id and category of the ratePlan from the ratePlan name
   * @param ratePlanNames the rate planNames to retrieve
   * @returns the list of policy
   */
  getRatePlanEnterpriseWithCategory(ratePlanNames: string[]): Observable<IPolicyMetadata[]> {
    const chainCode = this.sharedDataService.getHotelInfo().chainCode;
    const apiUrl = `enterprise/${chainCode}/rateplans/search?status=active&query=${ratePlanNames.join(',')}&query_fields=rateplanInfo.rateName&pagesize=999&pageindex=0`;
    return this.httpService.get(apiUrl, API_CONTEXT_PATH.IHONBOARDING)
      .pipe(map((res: IHTTPResponse) => this.parseToHaveOnlyRatePlanWithCategory(res.body)));
  }


  /**
   * Transform request from policy api ratePlan to conserve only name, id and category
   * @param responseResquest the request to clean
   * @returns the list of policy metadata
   */
  private parseToHaveOnlyRatePlanWithCategory(responseResquest: any[]): IPolicyMetadata[] {
    return responseResquest.map(e => ({ id: e.catelogRateplanId.toString(), category: e.rateplanInfo.rateCategory, name: e.rateplanInfo.rateName }));
  }
}
