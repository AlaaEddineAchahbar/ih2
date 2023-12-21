/****** Template Version History API Response ******/
export interface ITemplateHistoryMetadata {
    modifiedByUserId: string;
    modifiedByUsername: string;
    policyTemplateHistoryId: string;
    version: number;
    versionDate: string;
}

export interface ITemplateRevisions {
    field: string;
    newValue: string;
    oldValue: string;
    operation: string;
}

export interface ITemplateHistoryData {
    operation: string;
    revisions: Array<ITemplateRevisions>;
}

export interface ITemplateHistoryVersionData {
    metadata: ITemplateHistoryMetadata;
    policyTemplate: ITemplateHistoryData;
}

export interface ITemplateHistoryVersionEnterpriseData {
  metadata: ITemplateHistoryMetadata;
  revisionHistory: ITemplateHistoryData;
}


export interface ITemplateVersionHistoryResponse {
    policyTemplateHistory: Array<ITemplateHistoryVersionData>;
    policyTemplateId: string;
}

export interface ITemplateVersionHistoryEnterpriseResponse {
  versionHistory: Array<ITemplateHistoryVersionEnterpriseData>;
  policyTemplateId: string;
}

/********** Policy Version History API response *********/
export interface IPolicyRevisions {
    field: string;
    newValue: string;
    oldValue: string;
    operation: string;
}
export interface IPolicyHistoryData {
    operation: string;
    revisions: Array<IPolicyRevisions>;
}

export interface IPolicyHistoryMetadata {
    modifiedByUserId: string;
    modifiedByUsername: string;
    policyTemplateHistoryId: string;
    versionDate: string;
    version: number;
}
export interface IPolicyVersionHistoryData {
    metadata: IPolicyHistoryMetadata;
    revisionHistory: IPolicyHistoryData;
}
export interface IPolicyVersionHistoryResponse {
    versionHistory: Array<IPolicyVersionHistoryData>;
    id: string;
}

export interface IRatePlanList {
    id?: string;
    name?: string;
}

export interface IRateCategoryList {
    id?: string;
    name?: string;
}

export interface IChainCategoryList {
    id?: string;
    name?: string;
}
/********** History response in UI format **************/
export interface IHistoryRecord {
    id?: string;
    userName?: string;
    date?: string;
    field?: string;
    newValue?: Array<string>;
    oldValue?: Array<string>;
}

export interface RatePlansHistoryModel {
    id: string;
    name: string;
}

/********* Version History Fields TO Translate *********/
export const TRANSLATE_VERSION_HISTORY = {
    template: {
        name: 'POLICY_TEMPLATE_NAME',
        policyCode: 'POLICY_TEMPLATE_CODE',
        cancellationNotice: 'CANCELLATION_NOTICE',
        freeCancellation: 'FREE_CANCELLATION',
        otaChargeNotification: 'OTA_CANCEL_CHARGE',
        status: 'POLICY_TEMPLATE_STATUS',
        online_call_center_message: 'ONLINE_CC_MESSAGE',
        gds_message: 'GDS_MESSAGE',
        isFreeCancellation: 'FREE_CANCELLATION',
        ADVANCE_NOTICE: 'ADVANCE_NOTICE',
        SAME_DAY: 'SAME_DAY',
        NON_REFUNDABLE: 'NON_REFUNDABLE',
        DAYS_PLUS: 'DAYS_PLUS',
        HOURS: 'HOURS',
        NIGHTS_ROOM_TAX: 'VARIABLE_NIGHTS_ROOM_TAX',        // to handle Incorrect API response added this line
        NUMBER_OF_NIGHTS: 'VARIABLE_NIGHTS_ROOM_TAX',
        FLAT: 'FLAT',
        PERCENTAGE: 'PERCENTAGE',
        NOT_SELECTED: 'NOT_SELECTED',
        SELECTED: 'SELECTED',
        ACTIVE: 'ACTIVE',
        INACTIVE: 'INACTIVE',
        MERCHANDISING_TEXT: 'MERCHANDISING_TEXT',
        acceptedTender: 'ACCEPTED_TENDER',
        isPrePay: 'GDS_RATE_NOTIFICATION',
        depositRuleId: 'DEPOSIT_RULE',
        installmentEnabled: 'ENABLED_INSTALLMENTS',
        cancellationRule: 'CANCELLATION_NOTICE',
        POLICY_GDSLINE1_MSG: 'POLICY_GDS_MESSAGE_LINE_1_ENGLISH_ONLY',
        POLICY_GDSLINE2_MSG: 'POLICY_GDS_MESSAGE_LINE_2_ENGLISH_ONLY'
    },
    policy: {
        POLICYNAME: 'POLICY_NAME',
        STARTDATE: 'START_DATE',
        ENDDATE: 'END_DATE',
        LEVEL: 'LEVEL',
        PROPERTY: 'PROPERTY',
        ENTERPRISE: 'ENTERPRISE',
        RATECATALOG: 'RATEPLAN',
        CHAIN_CATEGORY: 'CHAIN_CATEGORIES',
        EMRATECATEGORY: 'RATECATEGORY',
        RATECATEGORY: 'RATECATEGORY',
        RATEPLAN: 'RATEPLAN',
        RATEPLANS: 'RATEPLAN',
        POLICYTEMPLATENAME: 'POLICY_TEMPLATE_NAME',
        POLICYSTATUS: 'POLICY_STATUS',
        ACTIVE: 'ACTIVE',
        INACTIVE: 'INACTIVE',
        EXPIRED: 'EXPIRED',
        POLICYTYPE: 'POLICY_TYPE',
        DEFAULT: 'DEFAULT',
        DATED: 'DATED',
        DOW: 'DAY_OF_WEEK',
        NOT_SELECTED: 'NOT_SELECTED',
        SELECTED: 'SELECTED',
        RULEOVERRIDE: 'OVERRIDE_OTHER_POLICIES',
        CHAIN: 'CHAIN'
    }
};

/**
 * DayOfWeek constants - Number to Day mapping
 */
export const DAY_OF_WEEK = {
    1: 'SUN',
    2: 'MON',
    3: 'TUE',
    4: 'WED',
    5: 'THU',
    6: 'FRI',
    7: 'SAT'
};

/********* This Holds fields whoes value needs to be modified to display on UI  ***********/
export enum HistoryFieldsModified {
    otaCancelCharge = 'otaChargeNotification',
    cancelNotice = 'cancellationNotice',
    freeCancellation = 'isFreeCancellation',
    templateStatus = 'status',
    onlineCCMessage = 'online_call_center_message',
    acceptedTender = 'acceptedTender',
    isPrePay = 'isPrePay',
    depositRule = 'depositRuleId',
    startDate = 'StartDate',
    endDate = 'EndDate',
    level = 'level',
    ratePlan = 'RatePlans',
    rateCategory = 'RateCategory',
    multiEndDate = 'MultiEndDate',
    multiStartDate = 'MultiStartDate',
    policyStatus = 'PolicyStatus',
    policyDateRange = 'PolicyDateRange',
    policyTemplateName = 'PolicyTemplateName',
    policyTemplateId = 'PolicyTemplateId',
    ruleOverride = 'RuleOverride',
    policyType = 'PolicyType',
    dow = 'DOW',
    installmentEnabled = 'installmentEnabled',
    chainCategory = 'ChainCategories',
    gdsMessage = 'POLICY_GDSLINE'
}

