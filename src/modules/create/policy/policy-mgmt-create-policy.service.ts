import { Injectable } from '@angular/core';
import { HTTPService } from '../../core/http.service';
import { ContextService } from '../../core/context.service';
import { SharedDataService } from '../../core/shared.data.service';
import { Observable } from 'rxjs';
import { IPolicyResponseModel, IPolicyRouteParams } from './policy-mgmt-create-policy.model';
import { GLOBAL_CONFIG, API_CONTEXT_PATH, API_RESPONSE_CODE, POLICY_LEVEL, POLICY_TYPE_FOR_API } from '../../core/constants';
import { map } from 'rxjs/operators';
import { IHTTPResponse } from '../../core/common.model';
import { IEMPolicySearchResponseModel, IPolicySearchRepsonseModel } from '../../search/policy-mgmt-search.model';
import { IRules, IRuleDecisionModifier, IRuleCriteriaParam } from '../../core/rules-metadata.model';
import { OPERATION_TYPES } from '../../core/rules.constant';
import { PolicyMgmtSearchPayloadService } from '../../core/search-payload.service';
import { ENTERPRISE_POLICY_CREATION_LEVEL } from '../../core/rules-config.constant';

@Injectable()
export class PolicyMgmtCreatePolicyService {

  constructor(
    private httpService: HTTPService,
    private contextService: ContextService,
    private sharedDataService: SharedDataService,
    private searchPayloadService: PolicyMgmtSearchPayloadService
  ) { }

  /**
   * returns the template data
   */
  getPolicyResponseData(policyRouteParams: IPolicyRouteParams)
    : Observable<IPolicyResponseModel | any> {
    let apiUrl = '';
    if (GLOBAL_CONFIG.PRODUCTION) {
      if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
        const hotelCode = this.sharedDataService.getHotelInfo().hotelCode;
        // check if policy data present for given policy name and return data,
        // else make API call for get policy
        const editPolicyData = this.getPolicyResponseDataFromSearch(policyRouteParams.policyName);
        if (editPolicyData) {
          return new Observable((subscriber) => {
            const temp: IHTTPResponse = {
              status: API_RESPONSE_CODE.GET_SUCCESS,
              body: {
                policies: [editPolicyData]
              }
            };
            subscriber.next(temp);
            subscriber.complete();
          }).pipe(map(this.mapGetPolicyResponse));

                } else if (policyRouteParams.policyRuleIds && policyRouteParams.policyCreationLevel) {
                    const payload = this.searchPayloadService.getPolicySearchPayload(
                        policyRouteParams.policyRuleIds, [policyRouteParams.policyCreationLevel]
                    );
                    apiUrl = 'hotels/' + hotelCode + '/policy/' + POLICY_TYPE_FOR_API[this.contextService.policyType] + '/search';
                    return this.httpService.post(apiUrl, payload, API_CONTEXT_PATH.POLICY_MGMT)
                        .pipe(map(this.mapGetPolicyResponse));
                }
            } else {
                const chainCode = this.sharedDataService.getChainInfo().chainCode;
                const policyIds = policyRouteParams.policyRuleIds.join(',');
                apiUrl = 'enterprise/' + chainCode + '/policy/' + POLICY_TYPE_FOR_API[this.contextService.policyType] +
                    '?policyIds=' + policyIds;
                return this.httpService.get(apiUrl, API_CONTEXT_PATH.POLICY_MGMT)
                    .pipe(map(this.mapGetPolicyResponse));
            }
        } else {
            if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
                apiUrl = `policy/getPolicy/${this.contextService.policyType}.json`;
            } else {

      }
      return this.httpService.get(apiUrl, '')
        .pipe(map((res: IHTTPResponse) => res.body));
    }
    return null;
  }

  /**
   * Sends create template post request
   * @param data: create template request data
   */
  createUpdatePolicy(data: IPolicyResponseModel, policyId: number = null): Observable<any> {

    let apiUrl = '';
    if (GLOBAL_CONFIG.PRODUCTION) {
      if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
        const hotelCode = this.sharedDataService.getHotelInfo().hotelCode;
        apiUrl = 'hotels/' + hotelCode + '/policy/'
          + POLICY_TYPE_FOR_API[this.contextService.policyType] + '/bulk-upsert';
      } else {
        const chainCode = this.sharedDataService.getChainInfo().chainCode;
        apiUrl = 'enterprise/' + chainCode + '/policy/'
          + POLICY_TYPE_FOR_API[this.contextService.policyType] + '/bulk-upsert';
      }

      // Its upsert call , so using Put call in both create/Edit flow
      return this.httpService.put(apiUrl, data, API_CONTEXT_PATH.POLICY_MGMT)
        .pipe(map((res: IHTTPResponse) => res.body));

    } else {
      if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
        apiUrl = `policy/postPolicy/${this.contextService.policyType}.json`;
      } else {

      }
      return this.httpService.get(apiUrl, '')
        .pipe(map((res: IHTTPResponse) => res.body));
    }
  }

  /**
   * Returns Policy Response Data if present, else undefined
   * @param policyName: policy name
   */
  getPolicyResponseDataFromSearch(policyName: string): IPolicySearchRepsonseModel {
    const policySearchData = this.sharedDataService.getPolicySearchData();
    const policyData = policySearchData.find(policy => policy.uxGroupName === policyName);
    return policyData;
  }

  /**
   * Policy Response Mapper function
   */
  mapGetPolicyResponse = (res: IHTTPResponse): IPolicyResponseModel | boolean => {
    if (res.status === API_RESPONSE_CODE.GET_SUCCESS) {
      let policyResponse: IPolicySearchRepsonseModel | IEMPolicySearchResponseModel;
      if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
        policyResponse = res.body.policies[0];
      } else {
        policyResponse = res.body;
      }

      const rules: Array<IRules> = [];
      policyResponse.rules.forEach(rule => {
        const formattedRule = this.formatPolicyResponse(rule);
        rules.push(formattedRule);
      });
      if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
        policyResponse = policyResponse as IPolicySearchRepsonseModel;
        const editPolicyResponse: IPolicyResponseModel = {
          groupname: policyResponse.uxGroupName,
          operation: OPERATION_TYPES.update,
          level: policyResponse.uxPolicyLevel,
          policyTemplateName: policyResponse.uxpolicyTemplateName,
          rules
        };
        if (policyResponse?.uxPolicyLevel === ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG) {
           editPolicyResponse['rateCatalogsName'] = policyResponse.uxRateCatalogs.map(e => e.rateCatalogName);
        }
        return editPolicyResponse;
      } else {
        policyResponse = policyResponse as IEMPolicySearchResponseModel;
        const editPolicyResponse: IPolicyResponseModel = {
          groupname: policyResponse.groupName,
          operation: OPERATION_TYPES.update,
          level: policyResponse.policyLevel,
          policyTemplateName: policyResponse.policyTemplateName,
          rateCatalogIds: policyResponse.rateCatalogIds,
          emRateCategoryIds: policyResponse.emRateCategoryIds,
          chainCategoryIds: policyResponse.chainCategoryIds,
          rules
        };
        return editPolicyResponse;
      }
    } else {
      return false;
    }
  };

  /**
   * Formats API response in UI PolicyResponseModel
   * @param rule: IRules
   */
  formatPolicyResponse(rule: IRules): IRules {
    // Set Rule Criteria params
    const ruleCriteriaParameters: Array<IRuleCriteriaParam> = [];
    if (rule.ruleCriteriaParameters && rule.ruleCriteriaParameters.length) {
      rule.ruleCriteriaParameters.forEach(criteria => {
        ruleCriteriaParameters.push({
          operatorID: Number(criteria.operatorID),
          ruleCriteriaID: Number(criteria.ruleCriteriaID),
          ruleCriteriaMemberID: Number(criteria.ruleCriteriaMemberID),
          ruleCriteriaParameterValue: criteria.ruleCriteriaParameterValue
        });
      });
    }

    // Set Rule Decisions
    const ruleDecisions = [];
    if (rule.ruleDecisions && rule.ruleDecisions.length) {
      rule.ruleDecisions.forEach(decision => {
        const ruleDecisionModifiers: Array<IRuleDecisionModifier> = [];
        decision.ruleDecisionModifiers.forEach(modifier => {
          ruleDecisionModifiers.push({
            ruleDecisionTypeModifierID: Number(modifier.ruleDecisionTypeModifierID),
            modifierValue: modifier.modifierValue === 'true' ? true
              : modifier.modifierValue === 'false' ? false : modifier.modifierValue
          });
        });
        ruleDecisions.push({
          ruleDecisionModifiers,
          ruleDecisionOrder: Number(decision.ruleDecisionOrder),
          ruleDecisionTypeID: Number(decision.ruleDecisionTypeID),
          ruleDecisionValue: Number(decision.ruleDecisionValue)
        });
      });
    }

    // Set Rule
    const policyRule: IRules = {
      activeStatus: rule.activeStatus,
      ruleLogic: rule.ruleLogic,
      rulePriority: Number(rule.rulePriority),
      uniqueTypeID: Number(rule.uniqueTypeID),
      ruleTypeID: Number(rule.ruleTypeID),
      ruleEndDate: rule.ruleEndDate,
      ruleStartDate: rule.ruleStartDate,
      ruleName: rule.ruleName,
      uniqueID: Number(rule.uniqueID),
      ruleID: Number(rule.ruleID),
      ruleCriteriaParameters,
      ruleDecisions,
      auxId: rule.auxId,
      auxType: rule.auxType
    };
    return policyRule;
  }
}

