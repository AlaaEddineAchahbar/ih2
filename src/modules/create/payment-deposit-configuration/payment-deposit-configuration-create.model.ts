import { IErrorMessage } from '../../core/common.model';
import {
    IPaymentDepositRuleDetails,
    IPaymentDepositRulesChainInfo,
    IEmPaymentDepositRulesResponseModel
} from '../../search/policy-mgmt-search.model';

export enum DEPOSIT_CONFIGURATION_STEPS {
    DEPOSIT_CONFIGURATION_NAME = 1,
    DEPOSIT_CONFIGURATION_DETAILS = 2
}

export enum CHARGE_TYPES {
    ARRIVAL_DAY_CHARGE = 'ARRIVAL_DAY_CHARGE',
    FLAT = 'FLAT',
    PERCENTAGE = 'PERCENTAGE'
}

export enum DEPOSIT_CONFIGURATION_STATUS {
    ADD = 'add',
    UPDATE = 'update'
}

export interface IDepositConfigurationDefaultPropertyCurrencies {
    currency: string;
    properties: Array<string>;
}

export interface IDepositConfigurationStepContinueEvent {
    stepNumber: DEPOSIT_CONFIGURATION_STEPS;
    eventType: string;
}

export interface IPaymentDepositConfigurationDetailData {
    paymentDepositConfigurationName: string;
}

export interface IPaymentDepositConfigurationRuleDetailDataFields {
    chargeType?: Array<string>;
}

export interface IPaymentDepositConfigurationRuleChargeAmount {
    amount?: number;
    currency?: string;
}

export interface IPaymentDepositConfigurationRuleDetailParams {
    chargeType?: string;
    chargeAmounts?: IPaymentDepositConfigurationRuleChargeAmount[];
    chargePercentage?: number;
    percentOnEnhancement?: number;
}

export interface IPaymentDepositConfigurationRulesData {
    rules: IPaymentDepositConfigurationRuleDetailParams[];
    data?: IPaymentDepositConfigurationRuleDetailDataFields;
}

export interface IPaymentDepositConfigurationData {
    depositConfigurationDetail: IPaymentDepositConfigurationDetailData;
    depositConfigurationRules: IPaymentDepositConfigurationRulesData;
}

export interface IEmPaymentDepositRulesCreateUpdateResponseModel {
    emPaymentDepositRule: IEmPaymentDepositRulesResponseModel;
}

export interface IPaymentDepositConfigurationNameErrorModel {
    depositConfigurationNameErrorMessage: IErrorMessage;
}

export interface IPaymentDepositConfigurationRulesErrorModel {
    selectCurrencyErrorMessage: IErrorMessage;
    selectAllCurrenciesErrorMessage: IErrorMessage;
    emptyAmountErrorMessage: IErrorMessage;
    emptyPercentageErrorMessage: IErrorMessage;
    emptyPercentOnEnhancementErrorMessage: IErrorMessage;
}

export class EmPaymentDepositRulesResponseModel {
    emPaymentDepositRuleTemplateId: number;
    emPaymentDepositRuleTemplateName: string;
    chainInfo: IPaymentDepositRulesChainInfo;
    paymentDepositRule: IPaymentDepositRuleDetails;
    constructor() {
        this.emPaymentDepositRuleTemplateId = null;
        this.emPaymentDepositRuleTemplateName = '';
        this.chainInfo = {
            chainCode: '',
            chainHotels: []
        };
        this.paymentDepositRule = {
            status: '',
            ruleName: '',
            rules: []
        };
    }
}

/**
 * Property Payment Deposit Rule Models
 */

export interface IPropertyPaymentDepositConfigurationRuleDetailParams {
    chargeType?: string;
    chargeDate?: number;
    chargeAmount?: number;
    chargePercentage?: number;
    percentOnEnhancement?: number;
}

export interface IPropertyPaymentDepositConfigurationRulesData {
    rules: IPropertyPaymentDepositConfigurationRuleDetailParams[];
    data?: IPaymentDepositConfigurationRuleDetailDataFields;
}

export interface IPropertyPaymentDepositRuleDetail {
    chargeType: string;
    chargeDate: number;
    percentOnEnhancement: number;
    chargeAmount: number;
    chargePercentage: number;
}
export class PropertyPaymentDepositRulesResponseModel {
    paymentDepositRuleId?: number;
    hotelId: number;
    paymentDepositRuleName: string;
    ownerType: string;
    status: string;
    active: number;
    rules: Array<IPropertyPaymentDepositRuleDetail>;

    constructor() {
        this.hotelId = 0;
        this.paymentDepositRuleName = '';
        this.ownerType = '';
        this.status = '';
        this.active = 1;
        this.rules = [];
    }
}

export interface IPropertyPaymentDepositRulesResponseModel {
    paymentDepositRuleId?: number;
    hotelId: number;
    paymentDepositRuleName: string;
    ownerType: string;
    status: string;
    active: number;
    rules: Array<IPropertyPaymentDepositRuleDetail>;
}

export interface IPropertyPaymentDepositConfigurationRulesErrorModel {
    emptyChargeAmountErrorMessage: IErrorMessage;
    emptyChargePercentageErrorMessage: IErrorMessage;
    emptyPercentOnEnhancementErrorMessage: IErrorMessage;
}
