import { ITemplateResponseModel, ITextList, IpolicySetting } from '../create/template/policy-mgmt-create-template.model';
import { IRules } from '../core/rules-metadata.model';
import { IChainInfo } from '../core/common.model';

/**
 * Data model that will be emitted out of filter component for filtering
 */
export interface ISearchPolicyParams {
    policyName?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    ratePlan?: Array<string>;
    rateCategory?: Array<string>;
    chainCategories?: Array<string>;
    policyTemplateId?: string;
    policyLevel?: Array<string>;
}
export interface ISearchTemplateParams {
    policyTemplateName?: string;
    cancellationNotice?: string;
    isFreeCancellation?: number;
    isInstallmentEnabled?: any;
    acceptedTender?: number;
}
export interface ISearchDepositConfigurationParams {
    depositConfigurationName?: string;
}

export interface IListSearchParams extends ISearchPolicyParams, ISearchTemplateParams, ISearchDepositConfigurationParams {
    status?: string;
    level?: string;
    sortBy?: string;
    pageIndex?: number;
    pageSize?: number;
    sortOrder?: string;
}

/**
 * Search Enterprise Policy Templates API request model
 */
export interface ISearchEMTemplateColumnFilter {
    filterType?: string;
    value?: string;
    valueTo?: string;
    values?: Array<string>;
}

export interface IStatusFilter extends ISearchEMTemplateColumnFilter { }
export interface IEMPolicyTemplateNameFilter extends ISearchEMTemplateColumnFilter { }
export interface ICancellationNoticeFilter extends ISearchEMTemplateColumnFilter { }
export interface IAcceptedTenderFilter extends ISearchEMTemplateColumnFilter { }
export interface IIsInstallmentEnabledFilter extends ISearchEMTemplateColumnFilter { }

export interface ISearchEMTemplateSortModel {
    fieldName?: string;
    sortType?: string;
}

export interface IEMPolicyTemplateFilterModel {
    status?: IStatusFilter;
    emPolicyTemplateName?: IEMPolicyTemplateNameFilter;
    cancellationNotice?: ICancellationNoticeFilter;
    acceptedTender?: IAcceptedTenderFilter;
    isInstallmentEnabled?: IIsInstallmentEnabledFilter;
}

export interface ISearchEMTemplateParams {
    offSet?: number;
    maxEntries?: number;
    filterModel?: IEMPolicyTemplateFilterModel;
    sortModel?: Array<ISearchEMTemplateSortModel>;
}

/**
 * Enterprise Policy Template search API response model
 */
export interface IJobInfo {
    status: string,
    total_hotels_count: number,
    failed_hotels_count: number,
    pending_hotels_count: number,
    success_hotels_count: number
}

export interface IEMTemplateResponseModel {
    name: string;
    policyCode: string;
    emPolicyTemplateId?: number;
    status: string;
    policyLevel: string,
    chainInfo: Array<IChainInfo>,
    jobId: string,
    jobInfo: IJobInfo,
    creationDateTime: string,
    creationBy: string,
    lastUpdateDateTime: string,
    lastUpdateBy: string
    policySetting: IpolicySetting;
    textList: Array<ITextList>;
}

export interface ISearchEMResponse {
    emPolicyTemplates?: Array<IEMTemplateResponseModel>;
    totalCount?: number;
    nextIndex?: number;
}

export interface IUxRateCategoryId {
  rateCatalogId: string;
  rateCatalogName: string;
}

/**
 * Search Rules API response model
 */
export interface IPolicySearchRepsonseModel {
    uxGroupName: string;
    uxpolicyTemplateName: string;
    uxRateCatalogs: Array<IUxRateCategoryId>;
    uxpolicyTemplateCode: string;
    uxPolicyType: string;
    uxPolicyDateRange: string;
    uxPolicyStatus: string;
    uxPolicyLevel: string;
    uxRatePlanIds: Array<string>;
    uxRateCategoryIds: Array<string>;
    uxPolicyTemplateId: string;
    uxDOW: string;
    uxRank: string;
    rules: Array<IRules>;
}

export interface IEMPolicySearchResponseModel {
    groupName: string;
    policyTemplateId: string;
    policyTemplateName?: string;
    policyTemplateCode: string;
    policyType: string;
    policyDateRange: string;
    policyStatus: string;
    policyLevel: string;
    rateCatalogIds: Array<string>;
    emRateCategoryIds: Array<string>;
    chainCategoryIds: Array<string>;
    dow: string;
    rules: Array<IRules>;
}

export interface ISearchResponse {
    policyTemplates?: Array<ITemplateResponseModel>;
    policies?: Array<IPolicySearchRepsonseModel> | Array<IEMPolicySearchResponseModel>;
    totalRecordCount?: number;
}

export interface IPolicySearchParamsList {
    searchParameters: Array<any>;
}

export interface IPolicySearchData {
    searchRequest: IPolicySearchParamsList;
}

/**
 * Policy Search Response Model format
 */
export interface IPolicySearchRequestModel {
    search: IPolicySearchData;
    uxDowRuleCriteriaID: string;
    uxDateRangeRuleCriteriaID: string;
    uxPolicyTemplateRuleDecisionTypeID: string;
    uxPolicyTypeRuleDecisionTypeModifierID: string;
}

/**
 * In case of property level rule, we pass hotelId as uniqueId
 * In case of rateplan/ratecategory rule, we pass uniqueId as uniqueId
 */
export interface IPolicySearchParams {
    uniqueTypeID: string;
    uniqueID?: number;
    hotelID?: string;
    ruleTypeID: number;
    ids?: Array<string>;
}

export interface IEnterprisePolicyRuleCriteriaParameter {
    exactMatch: string;
    operatorID: string;
    ruleCriteriaID: string;
    ruleCriteriaMemberID: string;
    ruleCriteriaParameterID: string;
    ruleCriteriaParameterValue: string;
}

export interface IEnterprisePolicyCriteriaSearch {
    ruleCriteriaParameter: Array<IEnterprisePolicyRuleCriteriaParameter>;
}

export interface IEnterprisePolicyDecisionModifier {
    exactMatch: string;
    modifierValue: string;
    ruleDecisionID: string;
    ruleDecisionTypeModifierID: string;
    uniqueIdentifier: string;
}

export interface IEnterprisePolicyRuleDecision {
    exactMatch: string;
    ruleDecisionID: string;
    ruleDecisionModifiers: Array<IEnterprisePolicyDecisionModifier>
    ruleDecisionOrder: string;
    ruleDecisionTypeID: string;
    ruleDecisionValue: string;
}

export interface IEnterprisePolicyDecisionSearch {
    ruleDecisions: Array<IEnterprisePolicyRuleDecision>;
}

export interface IEnterprisePolicySearchParameter {
    chainID?: number;
    criteriaSearch?: IEnterprisePolicyCriteriaSearch;
    decisionSearch?: IEnterprisePolicyDecisionSearch;
    hotelID?: string;
    ids?: Array<string>
    name?: string;
    ruleTypeID: number;
    uniqueID?: string;
    uniqueTypeID: string;
}

export interface IEnterprisePolicySearchParamsList {
    searchParameters: Array<IEnterprisePolicySearchParameter>;
}

export interface IEnterprisePolicySearchData {
    searchRequest: IEnterprisePolicySearchParamsList;
}

export interface IEnterprisePolicySortModel {
    fieldName: string;
    sortType: string;
}

export interface IEnterprisePolicyFilter {
    filterType: string;
    value: string;
    valueTo: string;
    values: Array<string>;
}

export interface IPaymentDepositRuleName {
    filterType: string;
    value: string;
    valueTo: string;
    values: Array<string>;
}

export interface IFilterModel {
    paymentDepositRuleName: IPaymentDepositRuleName;
}

export interface ISortModel {
    fieldName: string;
    sortType: string;
}

export interface IDepositConfigurationSearchRequestModel {
    offSet: number;
    maxEntries: number;
    filterModel: IFilterModel;
    sortModel: Array<ISortModel>;
}

export interface IPaymentDepositRulesChainHotel {
    hotelId: number;
    hotelName: string;
    status: string;
}

export interface IPaymentDepositRulesChainInfo {
    chainCode: string;
    chainHotels: Array<IPaymentDepositRulesChainHotel>;
}

export interface IChargeAmount {
    chargeAmount: number;
    currency: Array<string>;
    properties: Array<string>;
}

export interface IPaymentDepositRule {
    status: string;
    percentOnEnhancement: number;
    chargeType: string;
    chargePercentage: number;
}

export interface IEmPaymentDepositRule extends IPaymentDepositRule {
    chargeAmounts: Array<IChargeAmount>;
}

export interface IPropertyPaymentDepositRule extends IPaymentDepositRule {
    chargeAmount: number;
    chargeDate: string;
}

export interface IPaymentDepositRuleDetails {
    status: string;
    ruleName: string;
    rules: Array<IEmPaymentDepositRule>;
}

export interface IEmPaymentDepositRulesResponseModel {
    emPaymentDepositRuleTemplateId?: number;
    emPaymentDepositRuleTemplateName: string;
    chainInfo: IPaymentDepositRulesChainInfo;
    paymentDepositRule: IPaymentDepositRuleDetails;
}

export interface IPaymentDepositRulesResponseModel {
    depositRuleId: number;
    name: string;
    ownerType: string;
    ownerId: string;
    ruleInfo: Array<IPropertyPaymentDepositRule>;
}

export interface IDepositConfigurationSearchResponseModel {
    totalCount: number;
    nextIndex: number;
    emPaymentDepositRules: Array<IEmPaymentDepositRulesResponseModel>;
    paymentDepositRules: Array<IPaymentDepositRulesResponseModel>
}

export interface IEnterprisePolicyFilterModel {
    dateRange?: IEnterprisePolicyFilter;
    emPolicyTemplateId?: IEnterprisePolicyFilter;
    policyDistribution?: IEnterprisePolicyFilter;
    policyName?: IEnterprisePolicyFilter;
    status?: IEnterprisePolicyFilter;
}

export interface IEnterprisePolicySearchFilter {
    filterModel?: IEnterprisePolicyFilterModel;
    maxEntries?: number;
    offset?: number;
    sortModel?: Array<IEnterprisePolicySortModel>;
}

/**
 * Enterprise Policy Search Response Model format
 */
export interface IEnterprisePolicySearchRequestModel {
    dateRangeRuleCriteriaID: string;
    dowRuleCriteriaID: string;
    policyTemplateRuleDecisionTypeID: string;
    policyTypeRuleDecisionTypeModifierID: string;
    search: IEnterprisePolicySearchData;
    searchFilters?: IEnterprisePolicySearchFilter;
}

export interface ILinkedPolicyTemplatesErrorEnterpriseData {
    name: string;
    id: number;
}

export interface ILinkedPolicyTemplatesErrorPropertyData {
  name: string;
  hotelCode: number;
  hotelName: string;
  id: number;
}

export interface ILinkedPolicyTemplatesErrorResponseData {
    enterprise: Array<ILinkedPolicyTemplatesErrorEnterpriseData>;
    property: Array<ILinkedPolicyTemplatesErrorPropertyData>;
}

export interface ILinkedPolicyTemplatesErrorInfo {
  templateName: string;
  hotelName?: string;
  hotelCode?: string;
  context?: string;
}

/**
 * Enterprise Depsoit Configuration CSV model for exporting
 * Field Keys are from translation.constant and used as column headers
 */
export interface IEnterpriseDepositConfigurationCsvModel {
    DEPOSIT_CONFIGURATION_NAME: string;
    CHARGE_DATE: string;
    PERCENT_ON_ENHANCEMENTS: string;
    PERCENTAGE_AMOUNT: string;
    FLAT_AMOUNT: string;
    ARRIVAL_DAY: string;
}

/**
 * Property Depsoit Configuration CSV model for exporting
 * Field Keys are from translation.constant and used as column headers
 */
export interface IPropertyDepositConfigurationCsvModel {
    DEPOSIT_CONFIGURATION_NAME: string;
    OWNER_TYPE: string;
    OWNER_CODE: string;
    PERCENT_ON_ENHANCEMENTS: string;
    PERCENTAGE_AMOUNT: string;
    ARRIVAL_DAY: string;
    FLAT_AMOUNT: string;
}

/**
 * Cancellation template (enterprise level) CSV model for exporting
 * Field Keys are from translation.constant and used as column headers
 */
export interface IEnterprisePolicyTemplateCancellationCsvModel {
    POLICY_TEMPLATE_NAME: string;
    POLICY_TEMPLATE_STATUS: string;
    CANCELLATION_NOTICE: string;
    CANCELLATION_NOTICE_VALUE: string;
    FREE_CANCELLATION: string;
    POLICY_TEMPLATE_CODE: string;
    ONLINE_CC_MESSAGE: string;
    GDS_MESSAGE: string;
}

/**
 * Cancellation template (property level) CSV model for exporting
 * Field Keys are from translation.constant and used as column headers
 */
export interface IPropertyPolicyTemplateCancellationCsvModel {
    POLICY_TEMPLATE_NAME: string;
    POLICY_TEMPLATE_STATUS: string;
    OWNER_TYPE: string;
    OWNER_CODE: string;
    CANCELLATION_NOTICE: string;
    CANCELLATION_NOTICE_VALUE: string;
    FREE_CANCELLATION: string;
}

/**
 * Guarantee template (enterprise level) CSV model for exporting
 * Field Keys are from translation.constant and used as column headers
 */
export interface IEnterprisePolicyTemplateGuaranteeCsvModel {
    POLICY_TEMPLATE_NAME: string;
    POLICY_TEMPLATE_STATUS: string;
    POLICY_TEMPLATE_CODE: string;
    ACCEPTED_TENDER: string;
    LATE_ARRIVAL: string;
    ONLINE_CC_MESSAGE: string;
    GDS_MESSAGE: string;
}

export interface IPropertyPolicyTemplateGuaranteeCsvModel {
    POLICY_TEMPLATE_NAME: string;
    POLICY_TEMPLATE_STATUS: string;
    OWNER_TYPE: string;
    OWNER_CODE: string;
    ACCEPTED_TENDER: string;
    LATE_ARRIVAL: string;
}

/**
 * Deposit template CSV model for exporting
 * Field Keys are from translation.constant and used as column headers
 */
export interface IEnterprisePolicyTemplateDepositCsvModel {
    POLICY_TEMPLATE_NAME: string;
    POLICY_TEMPLATE_STATUS: string;
    POLICY_TEMPLATE_CODE: string;
    ACCEPTED_TENDER: string;
    DEPOSIT_CONFIGURATION_LABEL: string;
    ENABLED_INSTALLMENTS: string;
    ONLINE_CC_MESSAGE: string;
    GDS_MESSAGE: string;
}

export interface IPropertyPolicyTemplateDepositCsvModel {
    POLICY_TEMPLATE_NAME: string;
    POLICY_TEMPLATE_STATUS: string;
    OWNER_TYPE: string;
    OWNER_CODE: string;
    ACCEPTED_TENDER: string;
    DEPOSIT_CONFIGURATION_LABEL: string;
    ENABLED_INSTALLMENTS: string;
}

/**
 * Policy CSV model for exporting
 * Field Keys are from translation.constant and used as column headers
 */
export interface IPolicyCsvModel {
    POLICY_NAME: string;
    POLICY_STATUS: string;
    POLICY_DISTRIBUTION: string;
    POLICY_DISTRIBUTION_DETAILS: string;
    POLICY_TEMPLATE_NAME: string;
    POLICY_TYPE: string;
    START_DATE: string;
    END_DATE: string;
    DAY_OF_WEEK: string;
    OVERRIDE_OTHER_POLICIES: string;
}
