import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IOverlapPolicyInfo } from './policy-overlap.model';
import { API_CONTEXT_PATH, API_RESPONSE_CODE, FILTER_TYPE, GLOBAL_CONFIG, POLICY_TYPE_FOR_API } from '../../../core/constants';
import {
    IEMPolicySearchResponseModel,
    IEnterprisePolicyFilterModel,
    IEnterprisePolicySearchFilter,
    IEnterprisePolicySearchParameter,
    IEnterprisePolicySearchRequestModel,
    ISearchResponse
} from '../../../search/policy-mgmt-search.model';
import { IChainCategoryGroup, IChainInfo, IHTTPResponse } from '../../../core/common.model';
import { IPolicyResponseModel } from '../policy-mgmt-create-policy.model';
import { PolicyMgmtSearchPayloadService } from '../../../core/search-payload.service';
import { RulesMataDataService } from '../../../core/rules-meta-data.service';
import { ContextService } from '../../../core/context.service';
import { ENTERPRISE_POLICY_CREATION_LEVEL, ENTERPRISE_POLICY_LEVEL_FILTERS } from '../../../core/rules-config.constant';
import { SharedDataService } from '../../../core/shared.data.service';
import { HTTPService } from '../../../core/http.service';
import { HttpResponse } from '@angular/common/http';
import { IPolicyMetadata, IPolicyMetadataRequest } from '../../../core/rules-metadata.model';
import { PolicyMgmtService } from '../../../policy-mgmt.service';
import { DEFAULT_DATED_POLICY_TYPE, ENTERPRISE_POLICY_METADATA_TYPE, RULE_CRITERIA_MEMBER_NAMES } from '../../../core/rules.constant';
import { TcTranslateService } from 'tc-angular-services';
import { TranslationMap } from 'src/modules/core/translation.constant';

@Injectable()
export class PolicyOverlapService {

    constructor(private rulesMetaDataService: RulesMataDataService,
        private contextService: ContextService,
        private sharedDataService: SharedDataService,
        private policyMgmtSearchPayloadService: PolicyMgmtSearchPayloadService,
        private policyMgmtService: PolicyMgmtService,
        private httpService: HTTPService,
        private translate: TcTranslateService) {
    }

    /**
     * Method to call search enterprise policies api
     *
     * @param policyResponseModel
     * @returns
     */
    searchOverlapPolicies(policyResponseModel: IPolicyResponseModel): Observable<any> {
        let httpOperationResult: Observable<HttpResponse<Object>>;
        let payload: IEnterprisePolicySearchRequestModel =
            this.getEnterpriseOverlapPolicySearchPayload(policyResponseModel);

        if (GLOBAL_CONFIG.PRODUCTION) {
            const url = `enterprise/${this.contextService.chainCode}/policy/` +
                POLICY_TYPE_FOR_API[this.contextService.policyType] + `/search`;
            httpOperationResult = this.httpService.post(url, payload, API_CONTEXT_PATH.POLICY_MGMT);
        } else {
            const url = 'policy/search/' + POLICY_TYPE_FOR_API[this.contextService.policyType] + '.json';
            httpOperationResult = this.httpService.get(url, '');
        }

        return httpOperationResult.pipe(map((this.mapSearchOverlapPoliciesData)));
    }

    /**
     * Method to map response of search policies to overlap policies info
     *
     * @param response HTTP Response interface to retrieve data
     * @returns mapped list of overlap policies info
     */
    mapSearchOverlapPoliciesData = (response: IHTTPResponse) => {
        if (response.status === API_RESPONSE_CODE.GET_SUCCESS) {
            const searchResponse = response.body as ISearchResponse;
            return this.fetchOverlapPoliciesInfo(searchResponse);
        } else {
            return [];
        }
    };

    /**
     * Method to retrieve overlap policies info by policy level
     *
     * @param response enterprise policy search response model
     * @returns list of overlap policies info
     */
    fetchOverlapPoliciesInfo(response: ISearchResponse): Array<IOverlapPolicyInfo> {
        let overlapPolicies: Array<IOverlapPolicyInfo> = [];
        const policies = response.policies as Array<IEMPolicySearchResponseModel>;
        policies.forEach((policy: IEMPolicySearchResponseModel) => {
            if (policy.chainCategoryIds && policy.chainCategoryIds.length > 0) {
                const policiesByChainCategory =
                    this.getOverlapPoliciesInfoByLevel(policy.chainCategoryIds, policy, ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES);
                overlapPolicies = [...overlapPolicies, ...policiesByChainCategory];
            } else if (policy.rateCatalogIds && policy.rateCatalogIds.length > 0) {
                const policiesByRateCatalog =
                    this.getOverlapPoliciesInfoByLevel(policy.rateCatalogIds, policy, ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS);
                overlapPolicies = [...overlapPolicies, ...policiesByRateCatalog];
            } else if (policy.emRateCategoryIds && policy.emRateCategoryIds.length > 0) {
                const policiesByRateCategory =
                    this.getOverlapPoliciesInfoByLevel(policy.emRateCategoryIds, policy, ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES);
                overlapPolicies = [...overlapPolicies, ...policiesByRateCategory];
            } else {
                const policiesByChain =
                    this.getOverlapPoliciesInfoByLevel([], policy, ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN);
                overlapPolicies = [...overlapPolicies, ...policiesByChain];
            }
        });
        return overlapPolicies;
    }

    /**
     * Method to get overlap policies info by policy level assignement
     *
     * @param Ids list of chain category Ids|rate catalog Ids|rate category Ids
     * @param policy enterprise policy search response model
     * @param policyLevelFilter policy level filter
     * @returns list of overlap policies info
     */
    getOverlapPoliciesInfoByLevel(Ids: string[], policy: IEMPolicySearchResponseModel, policyLevelFilter: string):
        Array<IOverlapPolicyInfo> {
        let overlapPolicies: Array<IOverlapPolicyInfo> = [];

        const chainData: IChainInfo = this.sharedDataService.getChainInfo();
        const rateCategoryList: Array<IPolicyMetadata> =
            this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.rateCategories);
        const rateCatalogList: Array<IPolicyMetadata> = this.getRateCatalogsPolicyMetadata(chainData);
        const categoryGroupNameList: Array<IChainCategoryGroup> = this.getCategoryGroupNamesByIds(chainData);

        if (policyLevelFilter === ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN) {
            let overlapPolicy: IOverlapPolicyInfo = {
                id: '',
                name: '',
                policyName: '',
                policyDateRange: '',
                issue: ''
            };
            policy.rules.forEach((rule) => {
                overlapPolicy.policyName = rule.ruleName;
                overlapPolicy.ruleStartDate = rule.ruleStartDate;
                overlapPolicy.ruleEndDate = rule.ruleEndDate;
                if (policy.policyType === DEFAULT_DATED_POLICY_TYPE.default) {
                    overlapPolicy.policyDateRange = this.transformDateRanges(rule.ruleStartDate + '/');
                    overlapPolicy.issue = this.translate.translateService.instant(TranslationMap['OVERLAP_DEFAULT_POLICY']);
                }
            });
            overlapPolicy.id = chainData.chainId.toString();
            overlapPolicy.name = chainData.chainName;
            if (policy.policyType === DEFAULT_DATED_POLICY_TYPE.dated) {
                overlapPolicy.policyDateRange = this.transformDateRanges(policy.policyDateRange);
                overlapPolicy.issue = this.translate.translateService.instant(TranslationMap['OVERLAP_DATED_POLICY']);
            }
            overlapPolicy.policyLevel = policyLevelFilter;
            overlapPolicies.push(overlapPolicy);
        } else {
            Ids.forEach((id) => {
                let overlapPolicy: IOverlapPolicyInfo = {
                    id: '',
                    name: '',
                    policyName: '',
                    policyDateRange: '',
                    issue: ''
                };
                policy.rules.forEach((rule) => {
                    overlapPolicy.policyName = rule.ruleName;
                    overlapPolicy.ruleStartDate = rule.ruleStartDate;
                    overlapPolicy.ruleEndDate = rule.ruleEndDate;
                });
                overlapPolicy.id = id;
                overlapPolicy.policyDateRange = policy.policyDateRange ? this.transformDateRanges(policy.policyDateRange) : '';
                overlapPolicy.issue = this.translate.translateService.instant(TranslationMap['OVERLAP_DATED_POLICY']);
                overlapPolicy.policyLevel = policyLevelFilter;

                if (policyLevelFilter === ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES) {
                    overlapPolicy.name = categoryGroupNameList.find(x => String(x.categoryGroupId) === id)?.categoryGroupName;
                } else if (policyLevelFilter === ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES) {
                    overlapPolicy.name = rateCategoryList.find(x => String(x.id) === id)?.name;
                } else if (policyLevelFilter === ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS) {
                    overlapPolicy.name = rateCatalogList.find(x => String(x.id) === id)?.name;
                }

                overlapPolicies.push(overlapPolicy);
            });
        }
        return overlapPolicies;
    }

    /**
     * Method to get policy meta data for rateCatalogs type
     *
     * @param chainData Chain info returned by chain management API
     * @returns list of policy meta data
     */
    getRateCatalogsPolicyMetadata(chainData: IChainInfo): Array<IPolicyMetadata> {
        let policyMetadataList: Array<IPolicyMetadata> = [];
        let policyMetadataRequest: IPolicyMetadataRequest = {
            chainID: chainData.chainId.toString(),
            ruleTypeID: this.rulesMetaDataService.getRuleTypeIdByRuleTypeDisplay(this.contextService.policyType).toString(),
            type: ENTERPRISE_POLICY_METADATA_TYPE.rateCatalogs
        };
        this.policyMgmtService.getPolicyMetadata(policyMetadataRequest).subscribe((response: any) => {
            response.forEach((rateCatalog) => {
                let policyMetadata: IPolicyMetadata = {
                    id: rateCatalog.id,
                    name: rateCatalog.name
                };
                policyMetadataList.push(policyMetadata);
            });
        });
        return policyMetadataList;
    }

    /**
     * Medthod to get id and name of category groups
     *
     * @param chainData
     * @returns chain category group model
     */
    getCategoryGroupNamesByIds(chainData: IChainInfo): Array<IChainCategoryGroup> {
        const chainCategoryGroups: IChainCategoryGroup[] = [];
        for (const category of chainData.categories) {
            for (const categoryGroup of category.categoryGroups) {
                chainCategoryGroups.push({
                    categoryGroupId: categoryGroup.categoryGroupId,
                    categoryGroupName: categoryGroup.categoryGroupName
                });
            }
        }
        return chainCategoryGroups;
    }

    /**
     * Method to build enterprise policy search request model according to policy response model
     * @param policyResponseModel policy response model
     * @returns @IEnterprisePolicySearchRequestModel enterprise policy search request model
     */
    getEnterpriseOverlapPolicySearchPayload(policyResponseModel: IPolicyResponseModel): IEnterprisePolicySearchRequestModel {
        const searchParams: Array<IEnterprisePolicySearchParameter> = [];
        const policyCreationLevel = [];
        const filterModel: IEnterprisePolicyFilterModel = {};
        let startDate: string;
        let endDate: string;

        const chainData: IChainInfo = this.sharedDataService.getChainInfo();
        const ruleTypeID = this.rulesMetaDataService.getRuleTypeIdByRuleTypeDisplay(this.contextService.policyType);
        const ruleCriteria = this.rulesMetaDataService.getRuleCriteriaMemberDataByRuleTypeId(ruleTypeID);

        Object.keys(ENTERPRISE_POLICY_CREATION_LEVEL).forEach(level => {
            policyCreationLevel.push(ENTERPRISE_POLICY_CREATION_LEVEL[level]);
        });

        policyCreationLevel.forEach(level => {
            const uniqueTypeID = this.rulesMetaDataService.getUniqueTypeIdByPolicyLevel(level).toString();
            const searchParam: IEnterprisePolicySearchParameter = { uniqueTypeID, ruleTypeID };
            if (level === ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE) {
                searchParam.uniqueID = chainData.chainId.toString();
            } else {
                searchParam.chainID = chainData.chainId;
            }
            searchParams.push(searchParam);
        });

        const dowRuleCriteriaID: string = this.policyMgmtSearchPayloadService.getDowRuleCriteriaID(ruleCriteria);
        let dateRangeRuleCriteriaID: string;
        ruleCriteria.forEach(criteria => {
            if (criteria.criteriaMemberNames === RULE_CRITERIA_MEMBER_NAMES.dateRange) {
                dateRangeRuleCriteriaID = criteria.ruleCriteriaID.toString();
            }
        });

        const policyTemplateRuleDecisionTypeID: string = this.rulesMetaDataService.getRuleDecisionTypeIdByRuleTypeId(ruleTypeID).toString();
        const policyTypeRuleDecisionTypeModifierID: string = this.policyMgmtSearchPayloadService.getRuleDecisionTypeModifier(ruleTypeID);

        // set dateRange Filter
        const [rule] = policyResponseModel.rules;

        let dateRangeString: string = '';
        if (rule.ruleCriteriaParameters && rule.ruleCriteriaParameters.length > 0) {
            dateRangeString = rule.ruleCriteriaParameters.find(param => param.operatorID === 1004)?.ruleCriteriaParameterValue;
        } else {
            dateRangeString = rule.ruleStartDate + '/';
        }

        const dateRanges: string[] = dateRangeString.split(',');
        dateRanges.forEach(dateRange => {
            const dates = dateRange.split('/').map(dateString => dateString.trim());
            if (dates.length === 1) {
                if (!startDate || dates[0] < startDate) { startDate = dates[0]; }
                if (!endDate || dates[0] > endDate) { endDate = dates[0]; }
            } else if (dates.length === 2) {
                if (!startDate || dates[0] < startDate) { startDate = dates[0]; }
                if (!endDate || dates[1] > endDate) { endDate = dates[1]; }
            }
        });
        filterModel.dateRange = {
            filterType: FILTER_TYPE.INNERSET,
            value: `${startDate}/${endDate}`,
            valueTo: '',
            values: []
        };

        // set status Filter
        filterModel.status = {
            filterType: FILTER_TYPE.INNERSET,
            value: 'ACTIVE',
            valueTo: '',
            values: []
        };

        if (policyResponseModel.level === ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG) {
            filterModel.policyDistribution = {
                filterType: FILTER_TYPE.EQUAL,
                value: ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS,
                valueTo: '',
                values: policyResponseModel.rateCatalogIds ?? []
            };
        } else if (policyResponseModel.level === ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY) {
            filterModel.policyDistribution = {
                filterType: FILTER_TYPE.EQUAL,
                value: ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES,
                valueTo: '',
                values: policyResponseModel.emRateCategoryIds ?? []
            };
        } else if (policyResponseModel.chainCategoryIds && policyResponseModel.chainCategoryIds.length > 0) {
            filterModel.policyDistribution = {
                filterType: FILTER_TYPE.EQUAL,
                value: ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES,
                valueTo: '',
                values: policyResponseModel.chainCategoryIds ?? []
            };
        } else {
            filterModel.policyDistribution = {
                filterType: FILTER_TYPE.EQUAL,
                value: ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN,
                valueTo: '',
                values: []
            };
        }

        const searchFilters: IEnterprisePolicySearchFilter = { filterModel };
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

    /**
     * Method to trasnform containing date ranges into a formatted output
     * @param dateRangesString input string with date range
     * @returns formatted date ranges
     */
    transformDateRanges(dateRangesString: string): string {
        const dateRanges = dateRangesString.split(',').map((range) => range.trim());
        const transformedRanges = dateRanges.map((dateRange) => {
            const [start, end = 'No EndDate'] = dateRange.split('/');
            const formattedStart = start.replace(/-/g, '/');
            const formattedEnd = end === '' ?
                this.translate.translateService.instant(TranslationMap['NO_END_DATE']) : end.replace(/-/g, '/');
            return `${formattedStart} - ${formattedEnd}`;
        });
        return transformedRanges.join(' <br> ');
    }
}
