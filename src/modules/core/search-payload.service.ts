import { Injectable } from '@angular/core';
import { IListSearchParams,
    IPolicySearchRequestModel,
    IPolicySearchParams,
    IDepositConfigurationSearchRequestModel,
    IEnterprisePolicySearchRequestModel,
    ISearchEMTemplateParams,
    ISearchEMTemplateColumnFilter,
    ISearchEMTemplateSortModel,
    IEnterprisePolicySearchParameter,
    IEnterprisePolicySearchFilter,
    IEnterprisePolicyFilterModel,
    IEnterprisePolicySortModel
 } from '../search/policy-mgmt-search.model';
import { SEARCH_EM_SORT_OPTIONS, SEARCH_PORPERTY_SORT_OPTIONS, SEARCH_SORT_DROPDOWN_OPTIONS } from '../search/policy-mgmt-search.constant';
import { DEFAULT_VALUES, FILTER_TYPE, MODIFIED_DATE, SORT_DIRECTION, CONFIG_TYPE, POLICY_LEVEL} from './constants';
import { SharedDataService } from './shared.data.service';
import { RulesMataDataService } from './rules-meta-data.service';
import { IRuleCriteriaMember } from './rules-metadata.model';
import { ContextService } from './context.service';
import {
  PROPERTY_POLICY_CREATION_LEVEL,
  ENTERPRISE_POLICY_CREATION_LEVEL,
  COMMON_OPTIONS,
  ENTERPRISE_POLICY_LEVEL_FILTERS
} from './rules-config.constant';
import { RULE_CRITERIA_MEMBER_NAMES, RULE_DECISION_TYPE_MODIFIER } from './rules.constant';

@Injectable()
export class PolicyMgmtSearchPayloadService {
  /**
   * Holds search payload
   */
  searchPayload: IListSearchParams;

  /**
   * Holds search enterprise policy template payload
   */
  searchEMPayload: ISearchEMTemplateParams;

  constructor(
    private sharedDataService: SharedDataService,
    private rulesMetaDataService: RulesMataDataService,
    private contextService: ContextService
  ) {
    this.initializeSearchPayload();
  }

    /**
     * Sets default initial value of search payload
     */
    initializeSearchPayload() {
        const isPropertyDepositConfig = this.contextService.policyLevel === POLICY_LEVEL.PROPERTY
        && this.contextService.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION;

        this.searchPayload = {
            sortBy: isPropertyDepositConfig ? SEARCH_PORPERTY_SORT_OPTIONS.DEPOSIT_RULE_NAME :
                    SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE,
            pageIndex: DEFAULT_VALUES.searchScreen.pagination.startPageIndex,
            pageSize: DEFAULT_VALUES.searchScreen.pagination.pageSize,
        };

        if(isPropertyDepositConfig) {
          this.searchPayload.sortOrder = SEARCH_PORPERTY_SORT_OPTIONS.ASC_SORT_TYPE;
        }

    this.searchEMPayload = {
      offSet: DEFAULT_VALUES.searchScreen.pagination.startPageIndex,
      maxEntries: this.searchPayload.pageSize,
      filterModel: {
        status: {
          filterType: 'Equal',
          value: COMMON_OPTIONS.ALL,
        }
      },
      sortModel: [
        {
          fieldName: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_FIELD_NAME,
          sortType: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_DESC_SORT_TYPE
        }
      ]
    };
  }

  /**
   * Resets search payload to default
   */
  resetSearchPayload() {
    this.initializeSearchPayload();
  }

  /**
   * Return search payload
   */
  getSearchPayload(): IListSearchParams {
    return this.searchPayload;
  }

  /**
   * return search-enterprise-payload
   */
  getSearchEMPayload(): ISearchEMTemplateParams {
    return this.searchEMPayload;
  }

  /**
   * Updates/Sets search payload
   * @param payload: search payload
   */
  setSearchPayload(payload: IListSearchParams) {
    const policyTemplateName: string = 'policyTemplateName';
    const policyName: string = 'policyName';

    for (const key in payload) {
      if (payload[key] !== this.searchPayload[key]) {
        this.searchPayload[key] = payload[key];
      }
    }

    // remove name property if set in last search criteria, but not in current.
    if (!payload.hasOwnProperty(policyTemplateName) && this.searchPayload.hasOwnProperty(policyTemplateName)) {
      delete this.searchPayload[policyTemplateName];
    }

    // remove policyName property if set in last search criteria, but not in current.
    if (!payload.hasOwnProperty(policyName) && this.searchPayload.hasOwnProperty(policyName)) {
      delete this.searchPayload[policyName];
    }
  }

  /**
   * Updates/Sets search enterprise template payload
   * @param payload
   */
  setSearchEMPayload(payload: ISearchEMTemplateParams) {
    const name: string = 'name';

    for (const key in payload) {
      if (payload[key] !== this.searchEMPayload[key]) {
        this.searchEMPayload[key] = payload[key];
      }
    }

    // remove name property if set in last search criteria, but not in current.
    if (!payload.hasOwnProperty(name) && this.searchEMPayload.hasOwnProperty(name)) {
      delete this.searchEMPayload[name];
    }
  }

  createPropertySearchRequestParam(ruleTypeID: number, ruleIds?: Array<string>, policyLevels?: string[]):
    Array<IPolicySearchParams | IEnterprisePolicySearchParameter> {
    const policyCreationLevel = [];

    const chainID = this.sharedDataService?.getChainInfo()?.chainId;
    const hotelCode = this.sharedDataService.getHotelInfo().hotelCode;
    if (policyLevels) {
      policyCreationLevel.push(policyLevels);
    } else {
      if (chainID) {
        Object.keys(ENTERPRISE_POLICY_CREATION_LEVEL).forEach(level => {
          policyCreationLevel.push(ENTERPRISE_POLICY_CREATION_LEVEL[level]);
        });
      }
      Object.keys(PROPERTY_POLICY_CREATION_LEVEL).forEach(level => {
        policyCreationLevel.push(PROPERTY_POLICY_CREATION_LEVEL[level]);
      });
    }
    const searchParams: Array<IPolicySearchParams | IEnterprisePolicySearchParameter> = [];

    policyCreationLevel.forEach(level => {
      const uniqueTypeID = this.rulesMetaDataService.getUniqueTypeIdByPolicyLevel(level).toString();
      const searchParam: IEnterprisePolicySearchParameter | IPolicySearchParams = {
        ruleTypeID,
        uniqueTypeID
      };
      if (level === PROPERTY_POLICY_CREATION_LEVEL.PROPERTY) {
        searchParam.uniqueID = hotelCode.toString();
      } else if (level === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE) {
        searchParam.uniqueID = chainID;
        searchParam.hotelID = hotelCode.toString();
      } else {
        searchParam['chainID'] = chainID;
        searchParam.hotelID = hotelCode.toString();
      }

      // if ruleIds are set, then set it for respective policy: GET Policy Flow
      if (ruleIds && ruleIds.length) {
        searchParam.ids = ruleIds;
      }
      searchParams.push(searchParam);
    });
    return searchParams;
  }

  createEMSearchRequestParam(ruleTypeID: number, ruleIds?: Array<string>, policyLevel?: string): Array<IEnterprisePolicySearchParameter> {
    const chainID = this.sharedDataService.getChainInfo().chainId;
    const searchParams: Array<IEnterprisePolicySearchParameter> = [];
    const policyCreationLevel = [];
    if (policyLevel) {
      policyCreationLevel.push(policyLevel);
    } else {
      Object.keys(ENTERPRISE_POLICY_CREATION_LEVEL).forEach(level => {
        policyCreationLevel.push(ENTERPRISE_POLICY_CREATION_LEVEL[level]);
      });
    }

    policyCreationLevel.forEach(level => {
      const uniqueTypeID = this.rulesMetaDataService.getUniqueTypeIdByPolicyLevel(level).toString();
      const searchParam: IEnterprisePolicySearchParameter = {
        uniqueTypeID,
        ruleTypeID
      };

      if (level === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE) {
        searchParam.uniqueID = chainID.toString();
      } else {
        searchParam.chainID = chainID;
      }

      // if ruleIds are set, then set it for respective policy: GET Policy Flow
      if (ruleIds && ruleIds.length) {
        searchParam.ids = ruleIds;
      }
      searchParams.push(searchParam);
    });
    return searchParams;
  }

  getDowRuleCriteriaID(ruleCriteria: Array<IRuleCriteriaMember>): string {
    let dowRuleCriteriaID: string;
    ruleCriteria.forEach(criteria => {
      if (criteria.criteriaMemberNames === RULE_CRITERIA_MEMBER_NAMES.dayOfWeek) {
        dowRuleCriteriaID = criteria.ruleCriteriaID.toString();
      }
    });
    return dowRuleCriteriaID;
  }

  getDateRangeRuleCriteriaID(ruleCriteria: Array<IRuleCriteriaMember>): string {
    let dateRangeRuleCriteriaID: string;
    ruleCriteria.forEach(criteria => {
      if (criteria.criteriaMemberNames === RULE_CRITERIA_MEMBER_NAMES.dateRange) {
        dateRangeRuleCriteriaID = criteria.ruleCriteriaID.toString();
      }
    });
    return dateRangeRuleCriteriaID;
  }

  getRuleDecisionTypeModifier(ruleTypeId: number): string {
    let uxPolicyTypeRuleDecisionTypeModifierID: string;
    const ruleDecisionData = this.rulesMetaDataService.getRuleDecisionTypeModifierDataByRuleTypeId(ruleTypeId);
    for (const ruleDecision of ruleDecisionData) {
      if (ruleDecision.ruleDecisionTypeModifierName === RULE_DECISION_TYPE_MODIFIER.isDefaultPolicy) {
        uxPolicyTypeRuleDecisionTypeModifierID = ruleDecision.ruleDecisionTypeModifierID.toString();
      }
    }
    return uxPolicyTypeRuleDecisionTypeModifierID;
  }

  /**
   * Creates search payload for policies and returns it.
   */
  getPolicySearchPayload(ruleIds?: Array<string>, policyLevel?: string[]): IPolicySearchRequestModel {
    const ruleTypeID = this.rulesMetaDataService.getRuleTypeIdByRuleTypeDisplay(this.contextService.policyType);
    const searchParams = this.createPropertySearchRequestParam(ruleTypeID, ruleIds, policyLevel);
    const ruleCriteria = this.rulesMetaDataService.getRuleCriteriaMemberDataByRuleTypeId(ruleTypeID);

    const uxDowRuleCriteriaID = this.getDowRuleCriteriaID(ruleCriteria);
    const uxDateRangeRuleCriteriaID = this.getDateRangeRuleCriteriaID(ruleCriteria);
    const uxPolicyTemplateRuleDecisionTypeID = this.rulesMetaDataService.getRuleDecisionTypeIdByRuleTypeId(ruleTypeID).toString();
    const uxPolicyTypeRuleDecisionTypeModifierID = this.getRuleDecisionTypeModifier(ruleTypeID);

    // Finally, constructing search request
    const policySearchRequest: IPolicySearchRequestModel = {
      search: {
        searchRequest: {
          searchParameters: searchParams
        }
      },
      uxDateRangeRuleCriteriaID,
      uxDowRuleCriteriaID,
      uxPolicyTemplateRuleDecisionTypeID,
      uxPolicyTypeRuleDecisionTypeModifierID
    };

    return policySearchRequest;
  }

  getDepositConfigurationPayload(): IDepositConfigurationSearchRequestModel {
    let request: IDepositConfigurationSearchRequestModel =
    {
      offSet: this.searchPayload.pageIndex,
      maxEntries: this.searchPayload.pageSize,
      filterModel: {
        paymentDepositRuleName: {
          filterType: 'LIKE',
          value: this.searchPayload.depositConfigurationName,
          valueTo: '',
          values: []
        }
      },
      sortModel: [
        {
          fieldName: this.searchPayload.sortBy,
          sortType: this.searchPayload.sortOrder
        }
      ]
    };

    return request;
  }

  /**
   * Returns search filter parameter for enterprise policy search
   */
  private createEnterpriseSearchFilters(): IEnterprisePolicyFilterModel {
    const filterModel: IEnterprisePolicyFilterModel = {};
    if (this.searchPayload.policyName) {
      filterModel.policyName = {
        filterType: FILTER_TYPE.EQUAL,
        value: this.searchPayload.policyName,
        valueTo: '',
        values: []
      };
    }
    if (this.searchPayload.policyTemplateId) {
      filterModel.emPolicyTemplateId = {
        filterType: FILTER_TYPE.EQUAL,
        value: this.searchPayload.policyTemplateId,
        valueTo: '',
        values: []
      };
    }
    if (this.searchPayload.status) {
      filterModel.status = {
        filterType: FILTER_TYPE.INNERSET,
        value: this.searchPayload.status,
        valueTo: '',
        values: []
      };
    }
    if (this.searchPayload.startDate || this.searchPayload.endDate) {
      const startDate = this.searchPayload.startDate ?? '';
      const endDate = this.searchPayload.endDate ?? '';
      filterModel.dateRange = {
        filterType: FILTER_TYPE.INNERSET,
        value: `${startDate}/${endDate}`,
        valueTo: '',
        values: []
      };
    }
    if (this.searchPayload.policyLevel !== undefined && this.searchPayload.policyLevel.length > 0) {
      if (this.searchPayload.policyLevel[0] === ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES) {
        filterModel.policyDistribution = {
          filterType: FILTER_TYPE.EQUAL,
          value: ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES,
          valueTo: '',
          values: this.searchPayload.chainCategories ?? []
        };
      } else if (this.searchPayload.policyLevel[0] === ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS) {
        filterModel.policyDistribution = {
          filterType: FILTER_TYPE.EQUAL,
          value: ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS,
          valueTo: '',
          values: this.searchPayload.ratePlan ?? []
        };
      } else if (this.searchPayload.policyLevel[0] === ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES) {
        filterModel.policyDistribution = {
          filterType: FILTER_TYPE.EQUAL,
          value: ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES,
          valueTo: '',
          values: this.searchPayload.rateCategory ?? []
        };
      } else if (this.searchPayload.policyLevel[0] === ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN) {
        filterModel.policyDistribution = {
          filterType: FILTER_TYPE.EQUAL,
          value: ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN,
          valueTo: '',
          values: []
        };
      }
    }
    return filterModel;
  }

  /**
   * Returns the sorting parameter for enterprise search
   */
  private createEnterpriseSortModel(): Array<IEnterprisePolicySortModel> {
    if (this.searchPayload.sortBy === SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE_ASCENDING) {
      return [{
        fieldName: MODIFIED_DATE,
        sortType: SORT_DIRECTION.Ascending
      }];
    } else if (this.searchPayload.sortBy === SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE_DESCENDING) {
      return [{
        fieldName: MODIFIED_DATE,
        sortType: SORT_DIRECTION.Descending
      }];
    }
    return null;
  }

  /**
   * Set pagination on enterprise policy search filter
   */
  private setEnterprisePageSearch(searchFilter: IEnterprisePolicySearchFilter) {
    if (this.searchPayload.pageSize && this.searchPayload.pageIndex) {
      searchFilter.maxEntries = this.searchPayload.pageSize;
      searchFilter.offset = this.searchPayload.pageIndex - 1;
    };
  }

  /**
   * Creates Enterprise search payload for policies and returns it.
   */
  getEnterprisePolicySearchPayload(ruleIds?: Array<string>, policyLevel?: string): IEnterprisePolicySearchRequestModel {
    const ruleTypeID = this.rulesMetaDataService.getRuleTypeIdByRuleTypeDisplay(this.contextService.policyType);
    const ruleCriteria = this.rulesMetaDataService.getRuleCriteriaMemberDataByRuleTypeId(ruleTypeID);

    const searchParams = this.createEMSearchRequestParam(ruleTypeID, ruleIds, policyLevel);
    const dowRuleCriteriaID = this.getDowRuleCriteriaID(ruleCriteria);
    const dateRangeRuleCriteriaID = this.getDateRangeRuleCriteriaID(ruleCriteria);
    const policyTemplateRuleDecisionTypeID = this.rulesMetaDataService.getRuleDecisionTypeIdByRuleTypeId(ruleTypeID).toString();
    const policyTypeRuleDecisionTypeModifierID = this.getRuleDecisionTypeModifier(ruleTypeID);

    const filterModel = this.createEnterpriseSearchFilters();
    const sortModel = this.createEnterpriseSortModel();
    const searchFilters: IEnterprisePolicySearchFilter = {
      filterModel,
      sortModel
    };
    this.setEnterprisePageSearch(searchFilters);

    const enterprisePolicySearchRequest: IEnterprisePolicySearchRequestModel = {
      dateRangeRuleCriteriaID,
      dowRuleCriteriaID,
      policyTemplateRuleDecisionTypeID,
      policyTypeRuleDecisionTypeModifierID,
      search: {
        searchRequest: {
          searchParameters: searchParams
        }
      },
      searchFilters
    };
    return enterprisePolicySearchRequest;
  }
}
