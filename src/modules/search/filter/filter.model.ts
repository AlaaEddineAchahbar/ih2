
import { IDropDownItem, IErrorMessage } from '../../core/common.model';
import { IPolicyMetadata } from '../../core/rules-metadata.model';

/**
 * rule data that will hold up data for binding in UI
 */
export interface IFilterDataFieldsForTemplate {
    cancellationNotice?: Array<string>;
    acceptedTender?: Array<IDropDownItem>;
    installmentsList?: Array<string>;
}
export interface IFilterDataFieldsForPolicy {
    ratePlans?: Array<IPolicyMetadata>;
    rateCategories?: Array<IPolicyMetadata>;
    chainCategories?: Array<IPolicyMetadata>;
    policyAssignmentLevel?: Array<string>;
    policyTemplateList?: Array<IPolicyMetadata>;
}
export interface IFilterDataFields extends IFilterDataFieldsForPolicy, IFilterDataFieldsForTemplate {
    statusList: Array<string>;
}

/**
 * API is using Policy Assignmenet Level in Upper Case
 */
export interface IFilterPolicyLevel {
    PROPERTY?: boolean;
    RATECATEGORY?: boolean;
    RATEPLAN?: boolean;
}

export interface IFilterEnterprisePolicyLevel {
    CHAIN?: boolean;
    CHAIN_CATEGORIES?: boolean;
    RATE_PLANS?: boolean;
    RATE_CATEGORIES?: boolean;
}

export interface IFilterDateRange {
    startDate: Date | string;
    endDate?: Date | string;
}

/**
 * rule fields that will actaully holds binded data
 */
export interface IFilterPolicyParams {
    policyName?: string;
    policyTemplateId?: string;
    ratePlan?: Array<string>;
    rateCategory?: Array<string>;
    chainCategory?: Array<string>;
    policyLevel?: IFilterPolicyLevel;
    enterprisePolicyLevel?: IFilterEnterprisePolicyLevel;
    dateRange?: IFilterDateRange;
}

export interface IFilterTemplateParams {
    policyTemplateName?: string;
    cancellationNotice?: string;
    isFreeCancellation?: number;
    installments?: string;
    acceptedTender?: number;
}

export interface IFilterDepositConfigurationParams {
    depositConfigurationName?: string;
}

export interface IFilterSearchParams extends IFilterPolicyParams,
    IFilterTemplateParams,
    IFilterDepositConfigurationParams {
    status?: string;
    owner: string;
}

export interface IFilterRulesData {
    fields: IFilterSearchParams;
    data?: IFilterDataFields;
}

export interface IFilterErrorModel {
    policyAssignmentLevelErrorMessage: IErrorMessage;
}
