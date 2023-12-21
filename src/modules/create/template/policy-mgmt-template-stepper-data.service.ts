import { SharedDataService } from './../../core/shared.data.service';
import { Injectable } from '@angular/core';
import {
    ITemplateDetailsParams, ITemplateResponseModel, TemplateResponseModel, ITemplateDetailsRulesData,
    IDistributionMsgRulesData, IDistributionMsgParams, ILanguageText, ITextList, IPolicyTemplateRequestChainInfo,
    IPolicyTemplateRequestChainHotel
} from './policy-mgmt-create-template.model';
import { IChainInfo, IChainHotel } from '../../core/common.model';
import { CREATE_TEMPLATE_STEPS } from '../template/policy-mgmt-create-template.constant';
import { ContextService } from '../../core/context.service';
import { RulesConfigurationService } from '../../core/rules-config.service';
import {
    CANCELLATION_OPTIONS, OTA_CANCELLATION_CHARGE_OPTIONS, DISTRIBUTION_MESSAGES, STATUS_LIST, DISTRIBUTION_MESSAGES_GET
} from '../../core/rules-config.constant';
import { POLICY_TYPE, DEFAULT_VALUES, POLICY_LEVEL } from '../../core/constants';

@Injectable()
export class PolicyMgmtTemplateStepperDataService {
    templateReponseModel: ITemplateResponseModel;
    constructor(
        private contextService: ContextService,
        private rulesConfigService: RulesConfigurationService,
        private sharedDataService: SharedDataService
    ) { }

    createTemplateResponseModel() {
        this.templateReponseModel = new TemplateResponseModel();
        this.setDefaultDataForCreateTemplateModel(this.templateReponseModel);
    }

    /**
     * Set templateReponseModel API response only called in EDIT flow
     */
    setTemplateResponseModel(data: ITemplateResponseModel) {
        this.templateReponseModel = data;
    }

    /**
     * Return templateResponseModel, API request format
     */
    getTemplateResponseModel(): ITemplateResponseModel {
        return this.templateReponseModel;
    }

    /**
     * GET template details step data
     */
    getTemplateDetailData(): ITemplateDetailsRulesData {
        const rulesData: ITemplateDetailsRulesData = this.rulesConfigService.getTemplateDetailsConfigData(
            this.contextService.policyLevel,
            this.contextService.policyType,
            CREATE_TEMPLATE_STEPS.TEMPLATE_DETAILS
        );
        const ruleFields = rulesData.fields;

        ruleFields.policyTemplateName = this.templateReponseModel.name;
        ruleFields.policyTemplateCode = this.templateReponseModel.policyCode;

        const policySetting = this.templateReponseModel.policySetting;
        if (ruleFields.hasOwnProperty('cancellationNotice')) {
            ruleFields.cancellationNotice = policySetting.cancellationRule.chargeType;
            if (ruleFields.cancellationNotice === CANCELLATION_OPTIONS.SAME_DAY) {
                ruleFields.sameDayNoticeTime = policySetting.cancellationRule.priorHours;
            } else if (ruleFields.cancellationNotice === CANCELLATION_OPTIONS.ADVANCE_NOTICE) {
                ruleFields.advanceNotice.days = policySetting.cancellationRule.priorDays;
                ruleFields.advanceNotice.hours = policySetting.cancellationRule.priorHours;
                ruleFields.sameDayNoticeTime = null;
            } else if (ruleFields.cancellationNotice === CANCELLATION_OPTIONS.NON_REFUNDABLE) {
                ruleFields.sameDayNoticeTime = null;
            }
        }
        if (ruleFields.hasOwnProperty('otaCancellationChargeNotification')) {

            if (policySetting.otaSetting.otaChargeNights) {
                ruleFields.otaCancellationChargeNotification = OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX;
            } else if (policySetting.otaSetting.otaChargeAmount) {
                ruleFields.otaCancellationChargeNotification = OTA_CANCELLATION_CHARGE_OPTIONS.FLAT;
            } else if (policySetting.otaSetting.otaChargePercentage) {
                ruleFields.otaCancellationChargeNotification = OTA_CANCELLATION_CHARGE_OPTIONS.PERCENTAGE;
            }

            if (ruleFields.otaCancellationChargeNotification === OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX) {
                ruleFields.otaNightRoomNTaxAmt = policySetting.otaSetting.otaChargeNights;
                ruleFields.otaFlatAmt = null;
                ruleFields.otaPercentageAmt = null;
            } else if (ruleFields.otaCancellationChargeNotification === OTA_CANCELLATION_CHARGE_OPTIONS.FLAT) {
                ruleFields.otaFlatAmt = policySetting.otaSetting.otaChargeAmount;
                ruleFields.otaNightRoomNTaxAmt = null;
                ruleFields.otaPercentageAmt = null;
            } else if (ruleFields.otaCancellationChargeNotification === OTA_CANCELLATION_CHARGE_OPTIONS.PERCENTAGE) {
                ruleFields.otaPercentageAmt = policySetting.otaSetting.otaChargePercentage;
                ruleFields.otaNightRoomNTaxAmt = null;
                ruleFields.otaFlatAmt = null;
            }
        }
        if (ruleFields.hasOwnProperty('acceptedTender')) {
            ruleFields.acceptedTender = policySetting.acceptedTender;
        }
        if (ruleFields.hasOwnProperty('lateArrivalTime')) {
            ruleFields.lateArrivalTime = policySetting.holdTime;
        }
        if (ruleFields.hasOwnProperty('depositRule')) {
            ruleFields.depositRule = policySetting.depositRuleId;
            ruleFields.viewDepositRule = false;
        }
        if (ruleFields.hasOwnProperty('isFreeCancellation')) {
            ruleFields.isFreeCancellation = policySetting.isFreeCancellation;
        }
        if (ruleFields.hasOwnProperty('isInstallmentEnabled')) {
            ruleFields.isInstallmentEnabled = policySetting.isInstallmentEnabled;
        }
        return rulesData;
    }

    /**
     * Set template details step data
     */
    setTemplateDetailData(templateDetails: ITemplateDetailsParams) {
        console.log('Template Details', templateDetails);
        this.templateReponseModel.name = templateDetails.policyTemplateName;
        this.templateReponseModel.policyCode = templateDetails.policyTemplateCode;
        if (templateDetails.cancellationNotice) {
            this.templateReponseModel.policySetting.cancellationRule.chargeType = templateDetails.cancellationNotice;
            if (templateDetails.cancellationNotice === CANCELLATION_OPTIONS.SAME_DAY) {
                this.templateReponseModel.policySetting.cancellationRule.priorHours = Number(templateDetails.sameDayNoticeTime);
                this.templateReponseModel.policySetting.cancellationRule.priorDays = templateDetails.advanceNotice.days;
            } else if (templateDetails.cancellationNotice === CANCELLATION_OPTIONS.ADVANCE_NOTICE
                || templateDetails.cancellationNotice === CANCELLATION_OPTIONS.NON_REFUNDABLE) {
                this.templateReponseModel.policySetting.cancellationRule.priorHours = Number(templateDetails.advanceNotice.hours);
                this.templateReponseModel.policySetting.cancellationRule.priorDays = Number(templateDetails.advanceNotice.days);
            }
        }
        if (templateDetails.otaCancellationChargeNotification) {
            this.templateReponseModel.policySetting.otaSetting.otaChargeType = templateDetails.otaCancellationChargeNotification;
            this.templateReponseModel.policySetting.otaSetting.otaChargeNights = templateDetails.otaNightRoomNTaxAmt;
            this.templateReponseModel.policySetting.otaSetting.otaChargeAmount = templateDetails.otaFlatAmt;
            this.templateReponseModel.policySetting.otaSetting.otaChargePercentage = templateDetails.otaPercentageAmt;
        }
        if (templateDetails.acceptedTender) {
            this.templateReponseModel.policySetting.acceptedTender = templateDetails.acceptedTender;
        }
        if (templateDetails.hasOwnProperty('lateArrivalTime')) {
            this.templateReponseModel.policySetting.holdTime = templateDetails.lateArrivalTime;
        }
        if (templateDetails.hasOwnProperty('depositRule')) {
            this.templateReponseModel.policySetting.depositRuleId = templateDetails.depositRule
                ? Number(templateDetails.depositRule)
                : null;
        }
        if (templateDetails.hasOwnProperty('isFreeCancellation')) {
            this.templateReponseModel.policySetting.isFreeCancellation = templateDetails.isFreeCancellation;
        }
        if (templateDetails.hasOwnProperty('isInstallmentEnabled')) {
            this.templateReponseModel.policySetting.isInstallmentEnabled = templateDetails.isInstallmentEnabled;
        }
        if(this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
            this.templateReponseModel.chainInfo = this.mapPolicyTemplateRequestChainInfo(this.sharedDataService.getChainInfo());
        }
    }

    mapPolicyTemplateRequestChainInfo(iChainInfo: IChainInfo): IPolicyTemplateRequestChainInfo {
        const policyTemplateRequestChainInfo : IPolicyTemplateRequestChainInfo = {
            chainCode: iChainInfo.chainCode,
            chainHotels: this.mapPolicyTemplateRequestChainHotels(iChainInfo.chainHotels)
        };
        return policyTemplateRequestChainInfo;
    }

    mapPolicyTemplateRequestChainHotels(chainHotels: Array<IChainHotel>): Array<IPolicyTemplateRequestChainHotel> {
        const policyTemplateRequestChainHotelList : Array<IPolicyTemplateRequestChainHotel> = [];
        chainHotels.forEach(x => {
            policyTemplateRequestChainHotelList.push({
                hotelId: x.hotelCode,
                hotelName: x.hotelName
            });
        });
        return policyTemplateRequestChainHotelList;
    }

    /**
     * Sets RulesData required for step2 with:
     * 1. initial default template response model OR
     * 2. selected template response model (Edit flow)
     */
    getDistributionMsgData(): IDistributionMsgRulesData {
        const rulesData = this.rulesConfigService.getDistributionMsgConfigData(
            this.contextService.policyLevel,
            this.contextService.policyType,
            CREATE_TEMPLATE_STEPS.DISTRIBUTION_MESSAGE
        );
        const rulesTextList = rulesData.fields.textList;
        const responseTextList = this.templateReponseModel.textList;

        rulesData.fields.messageLanguage = responseTextList.length
            ? responseTextList[0].languageTexts.length ? responseTextList[0].languageTexts[0].languageId
                : null : null;


        responseTextList.forEach((textMsgData: ITextList) => {
            if (textMsgData.textType === DISTRIBUTION_MESSAGES.gdsLine1
                || textMsgData.textType === DISTRIBUTION_MESSAGES.gdsLine2
            ) {
                if (textMsgData.languageTexts.length) {
                    const key = textMsgData.languageTexts[0].languageId;
                    const value = textMsgData.languageTexts[0].text;
                    rulesTextList.gdsMessage[DISTRIBUTION_MESSAGES_GET[textMsgData.textType]][key] = value;
                }

            } else {
                textMsgData.languageTexts.forEach((languageText: ILanguageText) => {
                    const key = languageText.languageId;
                    const value = languageText.text;
                    rulesTextList[DISTRIBUTION_MESSAGES_GET[textMsgData.textType]][key] = value;
                });
            }
        });
        return rulesData;
    }

    /**
     * Sets template response model for step2 with rulesData from component
     * @param distMsgData: RulesData with input values
     */
    setDistributionMsgData(distMsgData: IDistributionMsgParams) {

        // set textlist data
        if (distMsgData.textList) {
            const MessagetextList: Array<ITextList> = [];
            for (const msgType in distMsgData.textList) {
                if (msgType === 'gdsMessage') {
                    const gdsLineMsgs = distMsgData.textList.gdsMessage;
                    for (const gdsLineMsg in gdsLineMsgs) {
                        if (gdsLineMsg) {
                            const languageMsg = gdsLineMsgs[gdsLineMsg];
                            const languageTextList: Array<ILanguageText> = [];
                            // tslint:disable-next-line:forin
                            for (const langId in languageMsg) {
                                languageTextList.push({
                                    languageId: Number(langId),
                                    text: languageMsg[langId]
                                });
                            }
                            MessagetextList.push({
                                textType: DISTRIBUTION_MESSAGES[gdsLineMsg],
                                languageTexts: languageTextList
                            });
                        }
                    }
                } else {
                    const languageTextList: Array<ILanguageText> = [];
                    // tslint:disable-next-line:forin
                    for (const langId in distMsgData.textList[msgType]) {
                        languageTextList.push({
                            languageId: Number(langId),
                            text: distMsgData.textList[msgType][langId]
                        });
                    }
                    MessagetextList.push({
                        textType: DISTRIBUTION_MESSAGES[msgType],
                        languageTexts: languageTextList
                    });
                }
            }
            this.templateReponseModel.textList = MessagetextList;
        }
    }

    /**
     * Sets default values required to create template response model
     * @param templateResponseModel: Template response model
     */
    setDefaultDataForCreateTemplateModel(templateResponseModel: ITemplateResponseModel) {
        templateResponseModel.textList = [
            {
                textType: DISTRIBUTION_MESSAGES.onlineCCMessage,
                languageTexts: []
            },
            {
                textType: DISTRIBUTION_MESSAGES.gdsLine1,
                languageTexts: []
            },
            {
                textType: DISTRIBUTION_MESSAGES.gdsLine2,
                languageTexts: []
            }
        ];

        if (this.contextService.policyType === POLICY_TYPE.GUARANTEE) {
            templateResponseModel.policySetting = {
                acceptedTender: DEFAULT_VALUES.acceptedTenderDropdown.defaultGuaranteeId,
                holdTime: null
            };
        }

        if (this.contextService.policyType === POLICY_TYPE.CANCELLATION) {
            templateResponseModel.policySetting = {
                cancellationRule: {
                    chargeType: '',
                    priorHours: 0,
                    priorDays: 0
                },
                otaSetting: {
                    otaChargeType: '',
                    otaChargeAmount: null,
                    otaChargeNights: null,
                    otaChargePercentage: null
                }
            };
        }

        if (this.contextService.policyType === POLICY_TYPE.DEPOSIT) {
            templateResponseModel.policySetting = {
                acceptedTender: DEFAULT_VALUES.acceptedTenderDropdown.defaultDepositId,
                depositRuleId: null
            };
        }
    }
}
