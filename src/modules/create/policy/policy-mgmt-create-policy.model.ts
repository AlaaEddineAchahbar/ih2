import { IDropDownItem, IErrorMessage } from '../../core/common.model';
import { IPolicyMetadata, IRules } from '../../core/rules-metadata.model';

export enum POLICY_STEPS {
    POLICY_LEVEL = 1,
    POLICY_DETAILS = 2
}

export interface IPolicyStepContinueEvent {
    stepNumber: POLICY_STEPS;
    eventType: string;
}

export interface IPolicyLevelParams {
    policyLevel: string;
    rateCategories: Array<IPolicyMetadata>;
    ratePlans: Array<IPolicyMetadata>;
    chainCategories: Array<IPolicyMetadata>;
}

export interface IPolicyLevelDataFields {
    policyLevelList: Array<string>;
    rateCategoryList?: Array<IPolicyMetadata>;
    ratePlanList?: Array<IPolicyMetadata>;
    chainCategoryList?: Array<IPolicyMetadata>;
}

export interface IPolicyLevelRulesData {
    fields: IPolicyLevelParams;
    data?: IPolicyLevelDataFields;
}

export interface IPolicyDetailsDataFields {
    policyTemplateList: Array<IPolicyMetadata>;
    dayofWeek: Array<IDropDownItem>;
    policyType: Array<string>;
}

export interface IPolicyLevelErrorModel {
    policyLevelErrorMessage: IErrorMessage;
}

export interface IPolicyResponseModel {
    groupname: string;
    level: string;
    operation: string;
    policyTemplateName: string;
    rules: Array<IRules>;
    rateCatalogIds?: Array<string>;
    emRateCategoryIds?: Array<string>;
    chainCategoryIds?: Array<string>;
}

export class PolicyResponseModel {
    groupname: string;
    level: string;
    operation: string;
    policyTemplateName: string;
    rules: Array<IRules>;

    constructor() {
        this.groupname = '';
        this.level = '';
        this.operation = '';
        this.policyTemplateName = '';
        this.rules = [];
    }
}

export interface IRuleStepperModel {
    id: number;
    ruleId?: number;
    status?: string;
    isPresentInEdit?: boolean;
}

/**
 * DayOfWeek Model
 */
export class DaysOfWeek {
    MON?: boolean;
    TUE?: boolean;
    WED?: boolean;
    THU?: boolean;
    FRI?: boolean;
    SAT?: boolean;
    SUN?: boolean;

    constructor(data: DaysOfWeek = {}) {
        this.MON = data.MON ? data.MON : true;
        this.TUE = data.TUE ? data.TUE : true;
        this.WED = data.WED ? data.WED : true;
        this.THU = data.THU ? data.THU : true;
        this.FRI = data.FRI ? data.FRI : true;
        this.SAT = data.SAT ? data.SAT : true;
        this.SUN = data.SUN ? data.SUN : true;
    }
}

/**
 * DateRange Model
 */
export interface IDateRange {
    startDate: Date | string;
    endDate?: Date | string;
    maxSelectableDate?: Date | string;
    minSelectableDate?: Date | string;
    noEndDateCheckedFlag?: boolean;
}

export interface IPolicyDetailsParams {
    policyName: string;
    policyTemplate: string;
    policyType: string;
    dateRange: Array<IDateRange>;
    ruleStartDate: string | Date;
    dayOfWeek: DaysOfWeek;
    overridePolicies: boolean;
    canBeDefaultPolicy?: boolean;
    auxId: number;
    auxType: string;
}


export interface IPolicyDetailsRulesData {
    fields: IPolicyDetailsParams;
    data?: IPolicyDetailsDataFields;
}

/**
 * DateRange and DayOfWeek holder model
 */
export interface IDateSelector {
    dateRanges: Array<IDateRange>;
    dows: DaysOfWeek;
}

export const ShortDays = [
    'MON',
    'TUE',
    'WED',
    'THU',
    'FRI',
    'SAT',
    'SUN'
];

export interface IPolicyDetailsErrorModel {
    policyNameErrorMessage: IErrorMessage;
    policyTemplateErrorMessage: IErrorMessage;
    startDateErrorMessage: IErrorMessage;
    endDateErrorMessage: IErrorMessage;
    dowErrorMessage: IErrorMessage;
    dateRangeErrorMessage: IErrorMessage;
}

export interface IPolicyRouteParams {
    policyName?: string;
    policyRuleIds?: Array<string>;
    policyCreationLevel?: string;
}

export interface IPolicyCreateResponseModel {
    savedRules: Array<{
        ruleID: string,
        ruleName?: string;
        version?: string;
    }>;
    errors?: Array<any>;
    success?: boolean;
}

export interface ITemplateListItemResponseModel {
    policyStatus: string;
    res: {
        id: string,
        name: string,
        emPolicyTemplateId: number
    };
}

export interface ITemplateListItemModel {
    id?: string;
    name?: string;
    status?: string;
}
