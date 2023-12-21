/**
 * Rules CREATE/EDIT request-response Structure model
 */
export interface IRuleDecisionModifier {
    ruleDecisionTypeModifierID: number;
    modifierValue: any;
}
export interface IRuleDecision {
    ruleDecisionModifiers: Array<IRuleDecisionModifier>;
    ruleDecisionOrder: number;
    ruleDecisionTypeID: number;
    ruleDecisionValue: number;
}


export interface IRuleCriteriaParam {
    multipleCriteriaMembers?: boolean;
    ruleCriteriaID: number;
    ruleCriteriaMemberID: number;
    ruleCriteriaParameterValue: string;
    operatorID: number;
}

export interface IRules {
    activeStatus: string;
    ruleLogic: string;
    rulePriority: number;
    uniqueTypeID: number;
    ruleTypeID: number;
    ruleDecisions: Array<IRuleDecision>;
    ruleCriteriaParameters: Array<IRuleCriteriaParam>;
    ruleEndDate: string | Date;
    ruleName: string;
    ruleStartDate: string | Date;
    uniqueID: number;
    ruleID?: number;
    auxId: number;
    auxType: string;
}

/**
 * Rules Metadata Model
 */
export interface IRuleType {
    ruleTypeID: number;
    ruleTypeDisplay: string;
}

export interface IRuleDecisionTypeModifier {
    categoryID: number;
    operatorTypeID: number;
    ruleDecisionTypeModifierDisplay: string;
    ruleDecisionTypeModifierID: number;
    ruleDecisionTypeModifierName: string;
}

export interface IRuleIdType {
    identifierTypeID: number;
    identifierTypeDescription: string;
}

export interface IRuleDecisionTypeRuleTypeMapping {
    groupBitmap?: number;
    ruleDecisionTypeID: number;
    ruleTypeID: number;
}

export interface IRuleDecisionType {
    ruleDecisionTypeID: number;
    categoryID: number;
}

export interface IRuleCriteriaRuleTypeMapping {
    ruleTypeID: number;
    ruleCriteriaID: number;
}

export interface IRuleCriteriaMember {
    ruleCriteriaID: number;
    ruleCriteriaMemberID: number;
    operatorTypeID: number;
    operatorID?: number;
    criteriaMemberNames?: string;
}

export interface IRuleCriteriaMemberOperatorOverride {
    operatorID: string;
    ruleCriteriaMemberID: string;
}

export interface IRuleOperation {
    operatorID: number;
    operatorTypeID: number;
    ruleTypeOperationID: number;
}

export interface IRuleOperator {
    operatorID: number;
    operatorName: string;
    operatorDisplay: string;
}

export interface IRulesMetaData {
    success?: string;
    errors?: string;
    ruleTypes: Array<IRuleType>;
    ruleDecisionTypeModifiers: Array<IRuleDecisionTypeModifier>;
    ruleIdTypes: Array<IRuleIdType>;
    ruleDecisionTypeRuleTypeMappings: Array<IRuleDecisionTypeRuleTypeMapping>;
    ruleDecisionTypes: Array<IRuleDecisionType>;
    ruleCriteriaRuleTypeMappings: Array<IRuleCriteriaRuleTypeMapping>;
    ruleCriteriaMembers: Array<IRuleCriteriaMember>;
    ruleCriteriaMemberOperatorOverrides: Array<IRuleCriteriaMemberOperatorOverride>;
    ruleOperations: Array<IRuleOperation>;
    ruleOperators: Array<IRuleOperator>;
}

/**
 * Policy MetaData (Dropdown APIs) types
 * (includes types: RatePlan / RateCategory / Template)
 */
export interface IPolicyMetaDataTypes {
    RatePlanCategory?: Array<any>;
    RateCategoryByOwnerReference?: Array<any>;
    PolicyTemplate?: Array<any>;
    PolicyAssociatedTemplates?: Array<any>;
    PolicyAssociatedRatePlans?: Array<any>;
    PolicyAssociatedRateCategories?: Array<any>;
    EnterprisePolicyTemplate?: Array<any>;
}

export interface IPolicyMetadata {
    id?: string;
    referenceId?: string;
    displayName?: string;
    name?: string;
    ratePlans?: Array<IPolicyMetadata>;
    list?: Array<IPolicyMetadata>;
    selected?: boolean;
    visible?: boolean;
    expanded?: boolean;
    status?: string;
}

export interface IPolicyMetadataResponseDataSet {
    categories?: Array<IPolicyMetadata>;
    uiData?: Array<IPolicyMetadata>;
}

/*  Policy Metadata : Dropdown API calls (Rate plan ,Rate category, Policy Template)  */

/**
 * Policy Metadata (dropdowns APIs) response Model
 */
 export interface IPolicyMetaDataAPIResponse {
    hotelID: string;
    selectType: string;
    type: string;
    uidataSet: IPolicyMetadataResponseDataSet;
}

export interface IPolicyMetadataRequest {
    chainID?: string;
    hotelID?: string;
    ruleTypeID: string;
    type: string;
    owner?: string;
    /**
     * Determines if rate plans should be fetched from DB or cache
     * (Should only be used for rate plans for now)
     */
    Database?: boolean;
}

