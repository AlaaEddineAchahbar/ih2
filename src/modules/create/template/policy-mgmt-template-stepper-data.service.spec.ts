import { TestBed, async } from '@angular/core/testing';
import { PolicyMgmtTemplateStepperDataService } from './policy-mgmt-template-stepper-data.service';
import { ContextService } from '../../core/context.service';
import { RulesConfigurationService } from '../../core/rules-config.service';
import {
    ITemplateResponseModel, ITemplateDetailsParams, IDistributionMsgParams, TemplateResponseModel
} from './policy-mgmt-create-template.model';
import { TEMPLATE_CONFIG } from './policy-mgmt-create-template.constant';
import { CANCELLATION_OPTIONS, OTA_CANCELLATION_CHARGE_OPTIONS } from '../../core/rules-config.constant';
import { SharedDataService } from 'src/modules/core/shared.data.service';

const chainInfoRes = require('../../../assets-policy-mgmt/data/chain-info.json');
const chainInfoMappedRes = require('../../../assets-policy-mgmt/data/chain-info-mappedRQ.json');

describe('Stepper Data Service', () => {
    let instance: PolicyMgmtTemplateStepperDataService;
    let contextService: ContextService;

    const spySharedDataService = jasmine.createSpyObj('SharedDataService', ['getChainInfo']);
    const spyRulesConfigService = jasmine.createSpyObj('RulesConfigurationService',
        ['getTemplateDetailsConfigData', 'getDistributionMsgConfigData', 'getSameDayHoursList']);
    const data: ITemplateResponseModel = {
        hotelCode: 6098,
        name: 'Test Policy',
        policyCode: '123',
        policySetting: {},
        status: 'ACTIVE',
        textList: [],
        type: 'DEPOSIT'
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                PolicyMgmtTemplateStepperDataService,
                ContextService,
                {
                    provide: RulesConfigurationService,
                    useValue: spyRulesConfigService
                },
                {
                    provide: SharedDataService,
                    useValue: spySharedDataService
                }
            ]
        }).compileComponents()
            .then(() => {
                instance = TestBed.get(PolicyMgmtTemplateStepperDataService);
                contextService = TestBed.inject(ContextService);
            });
    }));

    it('should initialize stepper data service', () => {
        expect(instance).toBeTruthy();
        expect(instance).toBeDefined();
    });

    it('should set and return template response model - getter|setter functions', () => {
        instance.setTemplateResponseModel(data);
        expect(instance.templateReponseModel).toBeDefined();
        expect(instance.templateReponseModel).toEqual(data);
        const requestData = instance.getTemplateResponseModel();
        expect(requestData).toEqual(data);
    });

    describe('step-1 Template details - for Guarantee policy', () => {
        const rulesData = { ...TEMPLATE_CONFIG['property']['guarantee']['template_details'] };
        const guaranteeResponseData: ITemplateResponseModel = {
            hotelCode: 6098,
            name: 'Test Policy',
            policyCode: '123',
            policySetting: {
                acceptedTender: 10,
                holdTime: 15
            },
            status: 'ACTIVE',
            textList: [],
            type: 'GUARANTEE'
        };
        const guaranteeRulesData: ITemplateDetailsParams = {
            acceptedTender: 10,
            policyTemplateName: 'Test Policy',
            policyTemplateCode: '123',
            lateArrivalTime: 15
        };

        beforeEach(() => {
            instance.setTemplateResponseModel(guaranteeResponseData);
        });

        it('should return template details rules data', () => {
            // Arrange
            spyRulesConfigService.getTemplateDetailsConfigData.and.returnValue(rulesData);

            // Act and Assert
            expect(instance.getTemplateDetailData().fields.acceptedTender).toBe(10);
            expect(instance.getTemplateDetailData().fields.lateArrivalTime).toBe(15);
        });

        it('should set template details response data from rules Data', () => {
            // Act
            instance.setTemplateDetailData(guaranteeRulesData);
            
            // Assert
            expect(instance.templateReponseModel.policySetting.acceptedTender).toEqual(guaranteeRulesData.acceptedTender);
            expect(instance.templateReponseModel.policySetting.holdTime).toEqual(guaranteeRulesData.lateArrivalTime);
            expect(instance.templateReponseModel.name).toEqual(guaranteeRulesData.policyTemplateName);
            expect(instance.templateReponseModel.policyCode).toEqual(guaranteeRulesData.policyTemplateCode);
        });

        it('should create default template response model', () => {
            // Assert
            expect(instance.templateReponseModel.policySetting.acceptedTender).toBeDefined();
            expect(instance.templateReponseModel.policySetting.holdTime).toBeDefined();
            expect(instance.templateReponseModel.name).toBeDefined();
            expect(instance.templateReponseModel.policyCode).toBeDefined();
        });

        it('should map correctly chain info data for request', () => {
            // Arrange
            contextService.setPolicyLevel('enterprise');
            spySharedDataService.getChainInfo.and.returnValue(chainInfoRes);
            
            // Act
            instance.setTemplateDetailData(guaranteeRulesData);

            // Assert
            expect(instance.templateReponseModel.chainInfo).toEqual(chainInfoMappedRes);
        });
    });

    describe('step-1 Template details - for Deposit policy', () => {
        const rulesData = { ...TEMPLATE_CONFIG['property']['deposit']['template_details'] };
        const depositResponseData: ITemplateResponseModel = {
            hotelCode: 6098,
            name: 'Test Policy',
            policyCode: '123',
            policySetting: {
                acceptedTender: 12,
                depositRuleId: 33
            },
            status: 'ACTIVE',
            textList: [],
            type: 'DEPOSIT'
        };
        const depositRulesData: ITemplateDetailsParams = {
            acceptedTender: 12,
            policyTemplateName: 'Test Policy',
            policyTemplateCode: '123',
            depositRule: 33,
            viewDepositRule: false
        };

        beforeEach(() => {
            instance.setTemplateResponseModel(depositResponseData);
        });

        it('should return template details rules data', () => {
            // Arrange
            spyRulesConfigService.getTemplateDetailsConfigData.and.returnValue(rulesData);
            
            // Act and Assert
            expect(instance.getTemplateDetailData().fields.acceptedTender).toBe(12);
            expect(instance.getTemplateDetailData().fields.depositRule).toBe(33);
        });

        it('should set template details response data from rules Data', () => {
            // Act
            instance.setTemplateDetailData(depositRulesData);

            // Assert
            expect(instance.templateReponseModel.policySetting.acceptedTender).toEqual(depositRulesData.acceptedTender);
            expect(instance.templateReponseModel.policySetting.depositRuleId).toEqual(Number(depositRulesData.depositRule));
        });

        it('should create default template response model', () => {
            // Assert
            expect(instance.templateReponseModel.policySetting.acceptedTender).toBeDefined();
            expect(instance.templateReponseModel.policySetting.depositRuleId).toBeDefined();
        });
    });

    describe('step-1 Template details - for Cancellation policy for cancellation notice as Same day and ota charge as nights and room tax',
        () => {
            const rulesData = { ...TEMPLATE_CONFIG['property']['cancellation']['template_details'] };
            const cancellationResponseData: ITemplateResponseModel = {
                hotelCode: 6098,
                name: 'Test Policy',
                policyCode: '123',
                policySetting: {
                    cancellationRule: {
                        chargeType: CANCELLATION_OPTIONS.SAME_DAY,
                        priorHours: 10
                    },
                    otaSetting: {
                        otaChargeType: OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX,
                        otaChargeNights: 10
                    }
                },
                status: 'ACTIVE',
                textList: [],
                type: 'CANCEL'
            };
            const cancellationRulesData: ITemplateDetailsParams = {
                policyTemplateName: 'Test Policy',
                policyTemplateCode: '123',
                cancellationNotice: CANCELLATION_OPTIONS.SAME_DAY,
                sameDayNoticeTime: 10,
                otaCancellationChargeNotification: OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX,
                otaNightRoomNTaxAmt: 10,
                advanceNotice: { days: 0, hours: 0 },
                otaFlatAmt: null,
                otaPercentageAmt: null
            };

            beforeEach(() => {
                instance.setTemplateResponseModel(cancellationResponseData);
            });

            it('should return template details rules data', () => {
                // Arrange
                spyRulesConfigService.getTemplateDetailsConfigData.and.returnValue(rulesData);
                
                // Act and Assert
                expect(instance.getTemplateDetailData().fields.otaCancellationChargeNotification)
                .toBe(OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX);
                expect(instance.getTemplateDetailData().fields.cancellationNotice).toBe(CANCELLATION_OPTIONS.SAME_DAY);
                expect(instance.getTemplateDetailData().fields.sameDayNoticeTime).toBe(10);
            });

            it('should set template details response data from rules Data', () => {
                // Act
                instance.setTemplateDetailData(cancellationRulesData);

                // Assert
                expect(instance.templateReponseModel.policySetting.cancellationRule.chargeType)
                    .toEqual(cancellationRulesData.cancellationNotice);
                expect(instance.templateReponseModel.policySetting.cancellationRule.priorHours)
                    .toEqual(cancellationRulesData.sameDayNoticeTime);

                expect(instance.templateReponseModel.policySetting.otaSetting.otaChargeType)
                    .toEqual(cancellationRulesData.otaCancellationChargeNotification);
                expect(instance.templateReponseModel.policySetting.otaSetting.otaChargeNights)
                    .toEqual(cancellationRulesData.otaNightRoomNTaxAmt);
            });

            it('should create default template response model', () => {
                // Assert
                expect(instance.templateReponseModel.policySetting.cancellationRule.chargeType).toBeDefined();
                expect(instance.templateReponseModel.policySetting.otaSetting.otaChargeType).toBeDefined();
            });
        });

    describe('step-1 Template details - for Cancellation policy for cancellation notice as Advance notice and ota charge as percentage',
        () => {
            const rulesData = { ...TEMPLATE_CONFIG['property']['cancellation']['template_details'] };
            const cancellationResponseData: ITemplateResponseModel = {
                hotelCode: 6098,
                name: 'Test Policy',
                policyCode: '123',
                policySetting: {
                    cancellationRule: {
                        chargeType: CANCELLATION_OPTIONS.ADVANCE_NOTICE,
                        priorHours: 12,
                        priorDays: 3
                    },
                    otaSetting: {
                        otaChargeType: OTA_CANCELLATION_CHARGE_OPTIONS.PERCENTAGE,
                        otaChargePercentage: 50
                    }
                },
                status: 'ACTIVE',
                textList: [],
                type: 'CANCEL'
            };
            const cancellationRulesData: ITemplateDetailsParams = {
                policyTemplateName: 'Test Policy',
                policyTemplateCode: '123',
                cancellationNotice: CANCELLATION_OPTIONS.ADVANCE_NOTICE,
                sameDayNoticeTime: null,
                otaCancellationChargeNotification: OTA_CANCELLATION_CHARGE_OPTIONS.PERCENTAGE,
                otaNightRoomNTaxAmt: null,
                advanceNotice: { days: 3, hours: 12 },
                otaFlatAmt: null,
                otaPercentageAmt: 50
            };

            beforeEach(() => {
                instance.setTemplateResponseModel(cancellationResponseData);
            });

            afterAll(() => {
                instance.createTemplateResponseModel();
            });

            it('should return template details rules data', () => {
                // Arrange
                spyRulesConfigService.getTemplateDetailsConfigData.and.returnValue(rulesData);

                // Act and Assert
                expect(instance.getTemplateDetailData().fields.otaCancellationChargeNotification)
                .toBe(OTA_CANCELLATION_CHARGE_OPTIONS.PERCENTAGE);
                expect(instance.getTemplateDetailData().fields.cancellationNotice).toBe(CANCELLATION_OPTIONS.ADVANCE_NOTICE);
                expect(instance.getTemplateDetailData().fields.advanceNotice.days).toBe(3);
                expect(instance.getTemplateDetailData().fields.advanceNotice.hours).toBe(12);
            });

            it('should set template details response data from rules Data', () => {
                // Act
                instance.setTemplateDetailData(cancellationRulesData);
                
                // Assert
                expect(instance.templateReponseModel.policySetting.cancellationRule.chargeType)
                    .toEqual(cancellationRulesData.cancellationNotice);
                expect(instance.templateReponseModel.policySetting.cancellationRule.priorHours)
                    .toEqual(cancellationRulesData.advanceNotice.hours);
                expect(instance.templateReponseModel.policySetting.cancellationRule.priorDays)
                    .toEqual(cancellationRulesData.advanceNotice.days);

                expect(instance.templateReponseModel.policySetting.otaSetting.otaChargeType)
                    .toEqual(cancellationRulesData.otaCancellationChargeNotification);
                expect(instance.templateReponseModel.policySetting.otaSetting.otaChargePercentage)
                    .toEqual(cancellationRulesData.otaPercentageAmt);
            });

            it('should create default template response model', () => {
                // Assert
                expect(instance.templateReponseModel.policySetting.cancellationRule.chargeType).toBeDefined();
                expect(instance.templateReponseModel.policySetting.otaSetting.otaChargeType).toBeDefined();
            });
        });

    describe('step-2 distribution message details - for Guarantee|Cancellation Policy', () => {
        const rulesData = { ...TEMPLATE_CONFIG['property']['guarantee']['distribution_message'] };
        const guaranteeResponseData: ITemplateResponseModel = {
            hotelCode: 6098,
            name: 'Test Policy',
            policyCode: '123',
            policySetting: {},
            status: 'ACTIVE',
            textList: [
                {
                    textType: 'ONLINE_CALL_CENTER_MESSAGE',
                    languageTexts: [
                        {
                            languageId: 1,
                            text: 'Online CC message'
                        }
                    ]
                },
                {
                    textType: 'POLICY_GDSLINE1_MSG',
                    languageTexts: [
                        {
                            languageId: 1,
                            text: 'GDS line1 message'
                        }
                    ]
                },
                {
                    textType: 'POLICY_GDSLINE2_MSG',
                    languageTexts: [
                        {
                            languageId: 1,
                            text: 'GDS line2 message'
                        }
                    ]
                },
            ],
            type: 'GUARANTEE'
        };
        const guaranteeRulesData: IDistributionMsgParams = {
            messageLanguage: 1,
            textList: {
                gdsMessage: {
                    gdsLine1: {
                        1: 'GDS line1 message'
                    },
                    gdsLine2: {
                        1: 'GDS line2 message'
                    }
                },
                onlineCCMessage: {
                    1: 'Online CC message'
                }
            }
        };

        beforeEach(() => {
            instance.setTemplateResponseModel(guaranteeResponseData);
        });

        it('should return distribution message details rules data', () => {
            // Arrange
            spyRulesConfigService.getDistributionMsgConfigData.and.returnValue(rulesData);

            // Act and Assert
            expect(instance.getDistributionMsgData().fields.textList.onlineCCMessage[1]).toEqual('Online CC message');
        });

        it('should set template details response data from rules Data', () => {
            // Act
            instance.setDistributionMsgData(guaranteeRulesData);
            const ccMessage = instance.templateReponseModel.textList.find(item => item.textType === 'ONLINE_CALL_CENTER_MESSAGE')
                .languageTexts[0].text;

            // Assert
            expect(ccMessage).toEqual(guaranteeRulesData.textList.onlineCCMessage[1]);
        });
    });

    describe('step-2 distribution message details - for Deposit Policy', () => {
        const rulesData = { ...TEMPLATE_CONFIG['property']['deposit']['distribution_message'] };
        const guaranteeResponseData: ITemplateResponseModel = {
            hotelCode: 6098,
            name: 'Test Policy',
            policyCode: '123',
            policySetting: {
            },
            status: 'ACTIVE',
            textList: [
                {
                    textType: 'ONLINE_CALL_CENTER_MESSAGE',
                    languageTexts: [
                        {
                            languageId: 1,
                            text: 'Online CC message'
                        }
                    ]
                },
                {
                    textType: 'POLICY_GDSLINE1_MSG',
                    languageTexts: [
                        {
                            languageId: 1,
                            text: 'GDS line1 message'
                        }
                    ]
                },
                {
                    textType: 'POLICY_GDSLINE2_MSG',
                    languageTexts: [
                        {
                            languageId: 1,
                            text: 'GDS line2 message'
                        }
                    ]
                },
            ],
            type: 'DEPOSIT'
        };
        const guaranteeRulesData: IDistributionMsgParams = {
            messageLanguage: 1,
            textList: {
                gdsMessage: {
                    gdsLine1: {
                        1: 'GDS line1 message'
                    },
                    gdsLine2: {
                        1: 'GDS line2 message'
                    }
                },
                onlineCCMessage: {
                    1: 'Online CC message'
                }
            },
            gdsRateNotification: true
        };

        beforeEach(() => {
            instance.setTemplateResponseModel(guaranteeResponseData);
        });

        it('should return distribution message details rules data', () => {
            // Arrange
            spyRulesConfigService.getDistributionMsgConfigData.and.returnValue(rulesData);

            // Act and Assert
            expect(instance.getDistributionMsgData().fields.textList.onlineCCMessage[1]).toEqual('Online CC message');
        });

        it('should set template details response data from rules Data', () => {
            // Act
            instance.setDistributionMsgData(guaranteeRulesData);
            const ccMessage = instance.templateReponseModel.textList.find(item => item.textType === 'ONLINE_CALL_CENTER_MESSAGE')
                .languageTexts[0].text;

            // Assert
            expect(ccMessage).toEqual(guaranteeRulesData.textList.onlineCCMessage[1]);
        });
    });

});
