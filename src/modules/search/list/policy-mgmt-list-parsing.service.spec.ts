import { async, TestBed } from '@angular/core/testing';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ContextService } from '../../core/context.service';
import { SharedDataService } from '../../core/shared.data.service';
import { IDropDownItem } from '../../core/common.model';
import { PolicyMgmtListParsingService } from './policy-mgmt-list-parsing.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
    ISearchResponse,
    IPolicySearchRepsonseModel,
    IEMPolicySearchResponseModel,
    ISearchEMResponse,
    IEMTemplateResponseModel,
    IPaymentDepositRulesResponseModel,
    IDepositConfigurationSearchResponseModel
} from '../../search/policy-mgmt-search.model';
import { IDepositConfigurationListModel, IEMTemplateSearchListModel, ITemplateSearchListModel } from './policy-mgmt-list.model';
import { ITemplateResponseModel } from '../../create/template/policy-mgmt-create-template.model';
import {
    CANCELLATION_OPTIONS, PROPERTY_POLICY_CREATION_LEVEL, STATUS_LIST,
    OTA_CANCELLATION_CHARGE_OPTIONS,
    ENTERPRISE_POLICY_LEVEL_FILTERS,
    ENTERPRISE_POLICY_CREATION_LEVEL,
    DEPOSIT_CONFIGURATION_CHARGE_TYPE
} from '../../core/rules-config.constant';
import { POLICY_TYPE } from '../../core/constants';
import { PolicyMgmtUtilityService } from '../../core/utility.service';
import { IPolicyMetadata } from '../../core/rules-metadata.model';
import { ENTERPRISE_POLICY_METADATA_TYPE, POLICY_METADATA_TYPE } from '../../core/rules.constant';


/**
 *  AoT requires an exported function for factories
 */
export function HttpLoaderFactory(http: HttpClient) {
    /**
     * Update i18nUrl and set it for loading translations
     */

    let langApiUrl;
    langApiUrl = window['CONFIG']['apiUrl']
        .replace('{{api_module_context_path}}', 'i18n/v1')
        + 'apps/ent-policy-ui/locales/';
    return new TcTranslateService().loadTranslation(http, langApiUrl);
}

const MetaData = {
    acceptedTender: {
        deposit: [
            { id: 8, name: 'Credit Card, Alternate Payments' },
            { id: 1, name: 'IATA' }
        ],
        guarantee: [
            { id: 17, name: 'Accept All' },
            { id: 14, name: 'Corporate ID' },
            { id: 16, name: 'Credit Card' },
            { id: 20, name: 'Hotel Billing (Call Center Only)' },
            { id: 9, name: 'IATA' },
            { id: 18, name: 'Rate Access Code' }
        ]
    }
};

const emTemplateList: ISearchEMResponse =
    require('../../../assets-policy-mgmt/data/enterprise-policy-templates/search/searchEMCancellationList.json');
const PolicySearchList: ISearchResponse = require('../../../assets-policy-mgmt/data/policy/search/cancellation.json');
const rateCategoryJson = require('../../../assets-policy-mgmt/data/formatted-ratecategory-dropdown.json');
const ratePlanJson = require('../../../assets-policy-mgmt/data/formatted-rateplan-dropdown.json');
const depositConfiguration: IDepositConfigurationSearchResponseModel =
    require('../../../assets-policy-mgmt/data/payment-deposit-rule/search/searchProperty.json');

class MockSharedDataService {
    depositRuleList: Array<IDropDownItem>;

    getPolicyMetadata(type) {
        let policyMetaData: Array<IPolicyMetadata>;
        if (type === POLICY_METADATA_TYPE.ratePlan) {
            policyMetaData = ratePlanJson;
        } else if (type === ENTERPRISE_POLICY_METADATA_TYPE.chainCategories) {
            const policyMetadata: IPolicyMetadata = {
                list: []
            };
            policyMetaData = [policyMetadata];
        } else {
            policyMetaData = rateCategoryJson;
        }
        return policyMetaData;
    }

    getHotelInfo() {
        const hotelInfo = require('../../../assets-policy-mgmt/data/hotel-info.json');
        return hotelInfo;
    }

    getMetaData() {
        return MetaData;
    }

    setDepositRulesList(data: Array<IDropDownItem>) {
        this.depositRuleList = data;
    }

    getDepositRulesList() {
        return this.depositRuleList;
    }
}

const cancellationResponse: ISearchResponse = require('../../../assets-policy-mgmt/data/policy-template/search/cancellation.json');
const guaranteeResponse: ISearchResponse = require('../../../assets-policy-mgmt/data/policy-template/search/guarantee.json');
const depositResponse: ISearchResponse = require('../../../assets-policy-mgmt/data/policy-template/search/deposit.json');

describe('SearchList Parsing service', () => {

    let listParsingService: PolicyMgmtListParsingService;
    let contextService: ContextService;
    let sharedDataService: SharedDataService;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: HttpLoaderFactory,
                        deps: [HttpClient]
                    }
                })
            ],
            providers: [
                TcTranslateService,
                TranslateService,
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                },
                ContextService,
                PolicyMgmtListParsingService,
                PolicyMgmtUtilityService
            ]
        });
        listParsingService = TestBed.get(PolicyMgmtListParsingService);
        contextService = TestBed.get(ContextService);
        sharedDataService = TestBed.get(SharedDataService);

        tcTranslateService = TestBed.get(TcTranslateService);
        translateService = TestBed.get(TranslateService);
        tcTranslateService.initTranslation(translateService);
    }));

    it('should Initialize List Service', () => {
        expect(listParsingService).toBeDefined();
        expect(listParsingService).toBeTruthy();
    });

    describe('should parse List - for - Cancellation', () => {
        let cancelListData: Array<ITemplateResponseModel>;
        beforeEach(() => {
            cancelListData = cancellationResponse.policyTemplates;
        });

        it('parse Search Response in List Format', () => {
            cancelListData[0].name = 'Test Data';
            cancelListData[0].policyCode = 'Template';
            cancelListData[0].id = 1000;
            const cancellationRule = cancelListData[0].policySetting.cancellationRule;
            cancellationRule.chargeType = CANCELLATION_OPTIONS.SAME_DAY;
            cancellationRule.priorHours = 10;
            cancellationRule.priorDays = null;

            const otaSetting = cancelListData[0].policySetting.otaSetting;
            if (!cancelListData[0].policySetting.otaSetting) {
                cancelListData[0].policySetting.otaSetting = {
                    otaChargeType: OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX,
                    otaChargeNights: 3
                };
            } else {
                otaSetting['otaChargeNights'] = 3;
                otaSetting['otaChargePercentage'] = otaSetting['otaChargeAmount'] = 0;
            }

            const output: ITemplateSearchListModel = {
                cancellationRule: 'Same Day - 10:00',
                name: 'Test Data (Template)',
                otaSetting: '3 Night(s)',
                isCreatedAtEnterpriseLevel: false,
                status: 'ACTIVE',
                id: 1000
            };
            const parseList = listParsingService.parseTemplateListData(cancelListData);

            expect(parseList[0]).toEqual(output);
        });
    });

    describe('should parse List - for - Guarantee', () => {
        let listData: Array<ITemplateResponseModel>;
        beforeEach(() => {
            listData = guaranteeResponse.policyTemplates;
        });

        it('parse Search Response in List Format', () => {
            listData[0].policySetting.acceptedTender = 17;
            listData[0].policySetting.holdTime = 20;
            listData[0].name = 'Test Data';
            listData[0].policyCode = 'Template';
            listData[0].id = 2000;
            contextService.setPolicyType(POLICY_TYPE.GUARANTEE);

            const output: ITemplateSearchListModel = {
                acceptedTender: 'Accept All',
                name: 'Test Data (Template)',
                arrivalTime: 'global_HoldUtil-LblHoldUtil 20:00 without payment',
                status: 'ACTIVE',
                isCreatedAtEnterpriseLevel: false,
                id: 2000
            };
            const parseList = listParsingService.parseTemplateListData(listData);
            expect(parseList[0]).toEqual(output);
        });
    });

    describe('should parse List - for - Deposit', () => {
        let listData: Array<ITemplateResponseModel>;
        beforeEach(() => {
            listData = depositResponse.policyTemplates;
        });

        it('parse Search Response in List Format', () => {
            listData[0].policySetting.acceptedTender = 8;
            listData[0].policySetting.depositRuleId = 124;
            listData[0].name = 'Test Data';
            listData[0].policyCode = 'Template';
            listData[0].policySetting.isInstallmentEnabled = true;
            listData[0].policySetting.depositRuleName = 'deposit rule';
            listData[0].id = 3000;
            contextService.setPolicyType(POLICY_TYPE.DEPOSIT);

            const output: ITemplateSearchListModel = {
                acceptedTender: 'Credit Card, Alternate Payments',
                name: 'Test Data (Template)',
                depositeRule: 'deposit rule',
                isInstallmentEnabled: 'global_active_lbl-LblActive',
                status: 'ACTIVE',
                isCreatedAtEnterpriseLevel: false,
                id: 3000
            };
            const parseList = listParsingService.parseTemplateListData(listData);
            expect(parseList[0]).toEqual(output);
        });
    });

    describe('Should return Property Policy Parsed Search List Data', () => {
        let listData: Array<IPolicySearchRepsonseModel>;
        beforeEach(() => {
            listData = PolicySearchList.policies as Array<IPolicySearchRepsonseModel>;
        });

        it('should return parsed policy list data', () => {
            listData[0].uxGroupName = 'Test Cancel Policy';
            listData[0].uxPolicyLevel = PROPERTY_POLICY_CREATION_LEVEL.PROPERTY;
            listData[0].uxPolicyStatus = STATUS_LIST.ACTIVE;
            listData[0].uxDOW = '2,3,4,5';

            const parsedData = listParsingService.parsePropertyPolicyListData(listData);

            expect(parsedData[0].name).toEqual('Test Cancel Policy');
            expect(parsedData[0].level).toEqual(PROPERTY_POLICY_CREATION_LEVEL.PROPERTY);
            expect(parsedData[0].status).toEqual(STATUS_LIST.ACTIVE);
            expect(parsedData[0].dow).toEqual('Mon, Tue, Wed, Thu');
        });
    });

    describe('Should return Enterprise Policy Parsed Search List Data', () => {
        let listData: Array<IEMPolicySearchResponseModel>;
        beforeEach(() => {
            listData = PolicySearchList.policies as Array<IEMPolicySearchResponseModel>;
        });

        it('should return parsed policy list data', () => {
            listData[0].groupName = 'Test Cancel Policy';
            listData[0].policyLevel = PROPERTY_POLICY_CREATION_LEVEL.PROPERTY;
            listData[0].policyStatus = STATUS_LIST.ACTIVE;
            listData[0].dow = '2,3,4,5';
            listData[0].rules[0].ruleID = 12345;
            listData[0].rules[1].ruleID = 67890;

            const parsedData = listParsingService.parseEMPolicyListData(listData);

            expect(parsedData[0].name).toEqual('Test Cancel Policy');
            expect(parsedData[0].level).toEqual(PROPERTY_POLICY_CREATION_LEVEL.PROPERTY);
            expect(parsedData[0].status).toEqual(STATUS_LIST.ACTIVE);
            expect(parsedData[0].dow).toEqual('Mon, Tue, Wed, Thu');
            expect(parsedData[0].id).toEqual('12345');
            expect(parsedData[0].ids).toEqual(['12345', '67890']);
        });

        it('should return parsed policy list data with level CHAIN when no chain categories', () => {
            listData[0].groupName = 'Test Cancel Policy';
            listData[0].policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
            listData[0].policyStatus = STATUS_LIST.ACTIVE;
            listData[0].dow = '2,3,4,5';

            const parsedData = listParsingService.parseEMPolicyListData(listData);

            expect(parsedData[0].name).toEqual('Test Cancel Policy');
            expect(parsedData[0].level).toEqual(ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN);
            expect(parsedData[0].status).toEqual(STATUS_LIST.ACTIVE);
            expect(parsedData[0].dow).toEqual('Mon, Tue, Wed, Thu');
        });

        it('should return parsed policy list data with level ENTERPRISE when chain categories filled', () => {
            listData[0].groupName = 'Test Cancel Policy';
            listData[0].policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
            listData[0].policyStatus = STATUS_LIST.ACTIVE;
            listData[0].dow = '2,3,4,5';
            listData[0].chainCategoryIds = ['1234'];

            const parsedData = listParsingService.parseEMPolicyListData(listData);

            expect(parsedData[0].name).toEqual('Test Cancel Policy');
            expect(parsedData[0].level).toEqual(ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE);
            expect(parsedData[0].status).toEqual(STATUS_LIST.ACTIVE);
            expect(parsedData[0].dow).toEqual('Mon, Tue, Wed, Thu');
        });
    });

    describe('Should return Enterprise Policy Templates Parsed Search List Data', () => {
        let listData: Array<IEMTemplateResponseModel>;
        beforeEach(() => {
            listData = emTemplateList.emPolicyTemplates;
        });

        it('should return parsed enterprise policy template list data', () => {
            // Arrange
            listData[0].name = 'Test ENT PT Parse';
            listData[0].policyCode = 'ENT';
            listData[0].emPolicyTemplateId = 56789;
            const cancellationRule = listData[0].policySetting.cancellationRule;
            cancellationRule.chargeType = CANCELLATION_OPTIONS.SAME_DAY;
            cancellationRule.priorHours = 10;
            cancellationRule.priorDays = null;

            const otaSetting = listData[0].policySetting.otaSetting;
            if (!listData[0].policySetting.otaSetting) {
                listData[0].policySetting.otaSetting = {
                    otaChargeType: OTA_CANCELLATION_CHARGE_OPTIONS.NIGHTS_ROOM_TAX,
                    otaChargeNights: 3
                };
            } else {
                otaSetting['otaChargeNights'] = 7;
                otaSetting['otaChargePercentage'] = otaSetting['otaChargeAmount'] = 0;
            }

            const output: IEMTemplateSearchListModel = {
                name: 'Test ENT PT Parse (ENT)',
                id: 56789,
                status: 'ACTIVE',
                cancellationRule: 'Same Day - 10:00',
                otaSetting: '7 Night(s)',
                isFreeCancellation: 'Not Selected',
                isInstallmentEnabled: 'global_inactive_lbl-LblInactive',
                jobId: 'ovOcQYoBnrYhsPpqeE2-',
                failed_hotels_count: 0,
                total_hotels_count: 24

            };

            // Act
            const parseList = listParsingService.parseEMTemplateListData(listData);

            // Assert
            expect(parseList[0]).toEqual(output);
        });
    });

    describe('Should return Property Deposit config Parsed Search List Data', () => {
        let listData: Array<IPaymentDepositRulesResponseModel>;
        beforeEach(() => {
            listData = depositConfiguration.paymentDepositRules;
        });

        it('should return parsed property deposit config list data for flat', () => {
            // Arrange
            listData[0].name = 'Test ENT Depo Parse';
            listData[0].depositRuleId = 56789;
            listData[0].ruleInfo[0].chargeType = '1';
            listData[0].ruleInfo[0].chargePercentage = 0;
            listData[0].ruleInfo[0].chargeAmount = 20;

            const output: IDepositConfigurationListModel = {
                name: 'Test ENT Depo Parse',
                id: 56789,
                numberOfConfigurations: '# of deposit configurations in this grouping: 1',
                isCreatedAtEnterpriseLevel: false,
                chargeAmount: 'Configuration 1 - Flat Amount: 20'
            };

            // Act
            const parseList = listParsingService.parseDepositConfigurationListData(listData);

            // Assert
            expect(parseList[0]).toEqual(output);
        });

        it('should return parsed property deposit config list data for percentage', () => {
            // Arrange
            listData[0].name = 'Test ENT Depo Parse';
            listData[0].depositRuleId = 56789;
            listData[0].ruleInfo[0].chargeType = '1';
            listData[0].ruleInfo[0].chargePercentage = 20;
            listData[0].ruleInfo[0].chargeAmount = 0;

            const output: IDepositConfigurationListModel = {
                name: 'Test ENT Depo Parse',
                id: 56789,
                numberOfConfigurations: '# of deposit configurations in this grouping: 1',
                isCreatedAtEnterpriseLevel: false,
                chargeAmount: 'Configuration 1 - Percentage Amount: 20'
            };

            // Act
            const parseList = listParsingService.parseDepositConfigurationListData(listData);

            // Assert
            expect(parseList[0]).toEqual(output);
        });

        it('should return parsed property deposit config list data for arrival day charge', () => {
            // Arrange
            listData[0].name = 'Test ENT Depo Parse';
            listData[0].depositRuleId = 56789;
            listData[0].ruleInfo[0].chargeType = DEPOSIT_CONFIGURATION_CHARGE_TYPE.ARRIVAL_DAY;

            const output: IDepositConfigurationListModel = {
                name: 'Test ENT Depo Parse',
                id: 56789,
                numberOfConfigurations: '# of deposit configurations in this grouping: 1',
                isCreatedAtEnterpriseLevel: false,
                chargeAmount: 'Configuration 1 - Arrival Day Charge',
            };

            // Act
            const parseList = listParsingService.parseDepositConfigurationListData(listData);

            // Assert
            expect(parseList[0]).toEqual(output);
        });
    });
});
