import { IChainInfo, IDropDownItem, IErrorMessage } from '../../core/common.model';
import { STATUS_LIST, CANCELLATION_OPTIONS } from '../../core/rules-config.constant';

export enum TEMPLATE_STEPS {
    TEMPLATE_DETAILS = 1,
    DISTRIBUTION_MESSAGE = 2
}

export interface ILanguageList {
    id: number;
    name: string;
    code?: string;
}

export interface IDistributionMsgDataFields {
    messageLanguage?: Array<ILanguageList>;
}

export interface IGdsMessage {
    gdsLine1: object;
    gdsLine2: object;
}

export interface IStepContinueEvent {
    stepNumber: TEMPLATE_STEPS;
    eventType: string;
}

export interface IDistributionMsgtextList {
    onlineCCMessage: object;
    gdsMessage: IGdsMessage;
}

export interface IDistributionMsgParams {
    messageLanguage: number;
    gdsRateNotification?: boolean;
    textList: IDistributionMsgtextList;
}

export interface IDistributionMsgRulesData {
    fields: IDistributionMsgParams;
    data?: IDistributionMsgDataFields;
}

export interface IAdvanceNotice {
    days?: number;
    hours?: number;
}

export interface ITemplateDetailsParams {
    policyTemplateName: string;
    policyTemplateCode: string;
    cancellationNotice?: string;
    sameDayNoticeTime?: number;
    advanceNotice?: IAdvanceNotice;
    otaCancellationChargeNotification?: string;
    otaNightRoomNTaxAmt?: number;
    otaPercentageAmt?: number;
    otaFlatAmt?: number;
    acceptedTender?: number | string;
    lateArrivalTime?: number;
    depositRule?: number | string;
    viewDepositRule?: boolean;
    isFreeCancellation?: boolean;
    isInstallmentEnabled?: boolean;
}

export interface ITemplateDetailsDataFields {
    cancellationNotice?: Array<string>;
    sameDayNoticeList?: Array<IDropDownItem>;
    otaCancellationChargeNotification?: Array<string>;
    acceptedTender?: Array<IDropDownItem>;
    lateArrivalTime?: Array<IDropDownItem>;
    depositRule?: Array<IDropDownItem>;
    isInstallmentEnabled?: boolean;
}

export interface ITemplateDetailsRulesData {
    fields: ITemplateDetailsParams;
    data?: ITemplateDetailsDataFields;
}

export interface IPolicyTemplateRouteParams {
    isTemplateAtEnterpriseLevel?: boolean;
}

export interface ILanguageText {
    languageId: number;
    languageName?: string;
    text: string;
}



export interface ITextList {
    textType: string;
    languageTexts: Array<ILanguageText>;
}

export interface ICancellationRule {
    chargeType: string;     // CANCELLATION_OPTIONS
    priorHours: number;
    priorDays?: number;
}

export interface IOtaSetting {
    otaChargeType: string;
    otaChargeNights?: number;
    otaChargeAmount?: number;
    otaChargePercentage?: number;
}

export interface IpolicySetting {
    otaSetting?: IOtaSetting;
    cancellationRule?: ICancellationRule;
    depositRuleId?: number;
    depositRuleName?: string;
    acceptedTender?: number | string;
    isInstallmentEnabled?: boolean;
    holdTime?: number;
    isFreeCancellation?: boolean;
}

export interface IPolicyTemplateRequestChainHotel {
    hotelId: number;
    hotelName: string;
    status?: string;
}

export interface IPolicyTemplateRequestChainInfo {
    chainCode: string;
    chainHotels: Array<IPolicyTemplateRequestChainHotel>;
}

/**
 * API response model
 */
export interface ITemplateResponseModel {
    hotelCode?: number;
    id?: number;
    lastModified?: string;
    type?: string;
    name: string;
    status: string;
    isEnterpriseLevel?: boolean;
    isInstallmentEnabled?: boolean;
    policyCode: string;
    chainInfo?: IPolicyTemplateRequestChainInfo;
    policySetting: IpolicySetting;
    textList: Array<ITextList>;
}



export class PolicySetting {
    otaSetting?: IOtaSetting;
    cancellationRule?: ICancellationRule;
    depositRuleId?: number;
    acceptedTender?: number | string;
    holdTime?: number;
    isFreeCancellation?: boolean;

    constructor() {
        this.otaSetting = {
            otaChargeType: '',
            otaChargeNights: null,
            otaChargeAmount: null,
            otaChargePercentage: null
        };
        this.cancellationRule = {
            chargeType: '',
            priorHours: null,
            priorDays: null

        };
        this.depositRuleId = null;
        this.acceptedTender = null;
        this.holdTime = null;
        this.isFreeCancellation = false;
    }
}

export class TemplateResponseModel {
    hotelCode?: number;
    id?: number;
    lastModified?: string;
    type?: string;
    name: string;
    status: string;     // STATUS_LIST
    policyCode: string;
    policySetting: IpolicySetting;
    textList: Array<ITextList>;
    constructor() {
        this.name = '';
        this.policyCode = '';
        this.status = STATUS_LIST.ACTIVE;
        this.policySetting = {};
        this.textList = [];
    }
}

export enum TEMPLATE_DETAILS_FIELDS {
    POLICY_TEMPLATE_NAME = 'policyTemplateName',
    POLICY_TEMPLATE_CODE = 'policyTemplateCode',
    CANCELLATION_NOTICE = 'cancellationNotice',
    SAME_DAY_NOTICE_TIME = 'sameDayNoticeTime',
    ADVANCE_NOTICE = 'advanceNotice',
    OTA_CANCELLATION_CHARGE_NOTICE = 'otaCancellationChargeNotification',
    CANCELLATION_AMOUNT = 'cancellationAmount',
    ACCEPTED_TENDER = 'acceptedTender',
    LATE_ARRIVAL_HOLD_UNTIL = 'lateArrivalHoldUntil',
    DEPOSIT_RULE = 'depositRule',
    VIEW_DEPOSIT_RULE = 'viewDepositRule',
}

export enum DISTRIBUTION_MESSAGE_FIELDS {
    MESSAGE_LANGUAGE = 'messageLanguage',
    GDS_RATE_NOTIFICATION = 'gdsRateNotification',
    TEXT_LIST = 'textList',
    ONLINE_CC_MESSAGE = 'onlineCCMessage',
    GDS_MESSAGE = 'gdsMessage',
    ONLINE_CC_PENALTY_MESSAGE = 'onlineCCPenaltyMessage',
    GDS_PENALTY_MESSAGE = 'gdsPenaltyMessage',
}

export interface IPolicyTemplateErrorModel {
    templateNameErrorMessage: IErrorMessage;
    lateArrivalErrorMessage: IErrorMessage;
    cancellationNoticeErrorMessage: IErrorMessage;

}

export interface IDepositRuleInfoModel {
    action: string;
    chargeAmount: string;
    chargeDate: string;
    chargePercentage: string;
    chargeType: string;
    percentOnEnhancement: string;
    status: string;
}

export interface IDepositRuleDetailsModel {
    depositRuleId: string;
    hotelId: string;
    name: string;
    ruleInfo: Array<IDepositRuleInfoModel>;
}

export interface IEntDepositConfigurationDetailsModel {
    name: string;
    ruleInfo: Array<IDepositRuleInfoModel>;
}
