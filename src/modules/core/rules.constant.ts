/**
 * const for RuleTypeDisplayName (RuleTypeId)
 */
export const RULE_TYPE_DISPLAY_NAME = {
    cancellation: 'Cancellation Policy',
    deposit: 'Deposit Policy',
    guarantee: 'Guarantee Policy'
};

/**
 * Policy Metadata Types (Dropdown API calls)
 */
export const POLICY_METADATA_TYPE = {
    ratePlan: 'RatePlanCategory',
    rateCategory: 'RateCategoryByOwnerReference',
    template: 'PolicyTemplate'
};

export const ENTERPRISE_POLICY_METADATA_TYPE = {
    rateCatalogs: 'RateTypeCatalogs',
    rateCategories: 'RateCategory',
    chainCategories: 'ChainCategories',
    templates: 'EnterprisePolicyTemplate'
};

/**
 * Const for policy type : Default/Dated
 */
export const DEFAULT_DATED_POLICY_TYPE = {
    default: 'DEFAULT',
    dated: 'DATED'
};

/**
 * Const for Rule Decision Types
 * 1. template id type: property/enterprise
 * 2. isDefaultPolicy type(boolean): isDefault or not(dated)
 */
export const RULE_DECISION_TYPE_MODIFIER = {
    propertyOREnterprise: 'POLICYTEMPLATEIDTYPE',
    isDefaultPolicy: 'ISDEFAULTPOLICY'
};

/**
 * Const for Rule priority
 */
export const RULE_PRIORITY = {
    overridePolicy: 1,
    defaultPolicy: 999,
    normalPolicy: 99
};

/**
 * Const for Unique Type Id (policy level)
 * i.e. Property/Rateplan/RateCategory
 */
export const UNIQUE_TYPE_ID = {
    PROPERTY: 'Hotel-based rules',
    ENTERPRISE: 'Chain Id',
    RATEPLAN: 'Rate Plan Id',
    RATECATALOG: 'Rate Catalog Id',
    RATECATEGORY: 'Rate Plan Category Id',
    EMRATECATEGORY: 'Chain Rate Category Synthetic Id'
};

/**
 * Policy Operation Types:
 * 1. create(create new policy)
 * 2. update(edit policy)
 */
export const OPERATION_TYPES = {
    create: 'CREATE',
    update: 'UPDATE'
};

/**
 * Rule Criterias
 * 1. DayOfWeek criteria
 * 2. DateRange criteria
 */
export const RULE_CRITERIA_MEMBER_NAMES = {
    dayOfWeek: 'NIGHT DOW',
    dateRange: 'STAYDATESYYYYMMDD',
    hotelIds: 'HOTELID',
    chainCategories: 'CHAINATTRIBUTEVALUE'
};

/**
 * Const For Rule Operators
 * 1. 'dow any in': any day in week
 */
export const RULE_OPERATORS = {
    anyDayOfWeek: 'dow any in'
};

/**
 * Const for Rule Logic
 */
export const RULE_LOGIC = {
    ALL: 'ALL'
};

/**
 * Const for Policy(Rule) status
 */
export enum RULE_STATUS {
    ACTIVE = 'Active',
    INACTIVE = 'Unpublished',
    DELETE = 'Inactive'
}

/**
 * Policy Associated Meta Data types
 */
export const POLICY_ASSOCIATED_METADATA_TYPE = {
    templates: 'PolicyTemplates',
    ratePlans: 'RatePlans',
    rateCategories: 'RateCategories'
};

