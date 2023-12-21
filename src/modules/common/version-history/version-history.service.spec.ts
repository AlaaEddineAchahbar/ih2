import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { VersionHistoryService } from './version-history.service';
import { SharedDataService } from '../../core/shared.data.service';
import { APP_CONSTANT } from '../../../app/app.constant';
import { ContextService } from '../../core/context.service';
import { PolicyMgmtUtilityService } from '../../core/utility.service';
import { IHTTPResponse, IHttpErrorResponse, IHotelInfo, IChainInfo } from '../../core/common.model';
import { of } from 'rxjs';
import { HTTPService } from '../../core/http.service';
import { CONFIG_TYPE, POLICY_TYPE, POLICY_LEVEL } from '../../core/constants';
import { IHistoryRecord } from './version-history.model';
import { RulesMataDataService } from '../../core/rules-meta-data.service';
import { ENTERPRISE_POLICY_METADATA_TYPE, POLICY_METADATA_TYPE } from '../../core/rules.constant';

/**
 * AoT requires an exported function for factories
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

const errorObject: IHttpErrorResponse = {
    status: 404,
    statusText: 'OK',
    error: 'Error'
};
const metaData = {
    acceptedTender: {
        guarantee: [
            { id: 17, name: 'Accept All' },
            { id: 14, name: 'Corporate ID' },
            { id: 16, name: 'Credit Card' },
            { id: 20, name: 'Hotel Billing (Call Center Only)' },
            { id: 9, name: 'IATA' },
            { id: 18, name: 'Rate Access Code' }
        ],
        deposit: [
            { id: 8, name: 'Credit Card, Alternate Payments' },
            { id: 1, name: 'IATA' }
        ]
    }
};

const ratePlanList = [
    {
        name: 'RACK',
        id: '1231',
        list: [
            {name: 'rate plan item 1', id: '1'},
            {name: 'rate plan item 2', id: '2'},
            {name: 'rate plan item 3', id: '3'},
            {name: 'rate plan item 4', id: '4'},
            {name: 'rate plan item 5', id: '5'}
    ]},
    {
        name: 'PROMOTIONAL',
        id: '1232',
        list: [
            {name: 'rate plan item 11', id: '11'},
            {name: 'rate plan item 12', id: '12'},
            {name: 'rate plan item 13', id: '13'},
            {name: 'rate plan item 14', id: '14'},
            {name: 'rate plan item 15', id: '15'}
    ]},
    {
        name: 'DISCOUNT',
        id: '1233',
        list: [
            {name: 'rate plan item 21', id: '21'},
            {name: 'rate plan item 22', id: '22'},
            {name: 'rate plan item 23', id: '23'},
            {name: 'rate plan item 24', id: '24'},
            {name: 'rate plan item 25', id: '25'}
    ]}
];

const rateCategoryList = [
    {name: 'RACK', id: '12341'},
    {name: 'PROMOTIONAL', id: '12342'},
    {name: 'DISCOUNT', id: '12343'},
    {name: 'PACKAGE', id: '12345'}
];

const ratePlansArray = [
    {name: 'rate plan item 1', id: '1'},
    {name: 'rate plan item 2', id: '2'},
    {name: 'rate plan item 3', id: '3'},
    {name: 'rate plan item 4', id: '4'},
    {name: 'rate plan item 5', id: '5'}
];

const chainCategoryList = [
    {
        name: 'Chain cat 1',
        id: '1',
        list: [
            {name: 'chain cat item 1', id: '1'},
            {name: 'chain cat item 2', id: '2'},
            {name: 'chain cat item 3', id: '3'},
            {name: 'chain cat item 4', id: '4'},
            {name: 'chain cat item 5', id: '5'}
        ]
    },
    {
        name: 'Chain cat 2',
        id: '2',
        list: [
            {name: 'chain cat 2 item 1', id: '1'},
            {name: 'chain cat 2 item 2', id: '2'},
            {name: 'chain cat 2 item 3', id: '3'},
            {name: 'chain cat 2 item 4', id: '4'},
            {name: 'chain cat 2 item 5', id: '5'}
        ]
    },
];

const hotelInfo: IHotelInfo = require('../../../assets-policy-mgmt/data/hotel-info.json');
const chainInfo: IChainInfo = require('../../../assets-policy-mgmt/data/chain-info.json');
const cancelTemplateHistory = require('../../../assets-policy-mgmt/data/policy-template/version-history/cancellation.json');
const guaranteeTemplateHistory = require('../../../assets-policy-mgmt/data/policy-template/version-history/guarantee.json');
const depositTemplateHistory = require('../../../assets-policy-mgmt/data/policy-template/version-history/deposit.json');
const cancellationPolicyHistory = require('../../../assets-policy-mgmt/data/policy/version-history/cancellation.json');
const guaranteePolicyHistory = require('../../../assets-policy-mgmt/data/policy/version-history/guarantee.json');
const depositPolicyHistory = require('../../../assets-policy-mgmt/data/policy/version-history/deposit.json');


/**
 * Mock SharedDataService
 */
class MockSharedDataService {
    getHotelInfo() {
        const hotelInfoResponse = Object.assign({}, hotelInfo);
        hotelInfoResponse.languageList = [
            { id: 38, code: 'BG_BG', name: 'Bulgarian' },
            { id: 1, code: 'EN_US', name: 'English (US)' },
            { id: 2, code: 'ES_ES', name: 'Spanish' }
        ];
        return hotelInfoResponse;
    }

    getChainInfo() {
        const chainInfoResponse = Object.assign({}, chainInfo);
        return chainInfoResponse;
    }

    getMetaData() {
        return metaData;
    }

    getDepositRulesList() {
        return [];
    }

    getPolicyMetadata(type): any {
        if (type === POLICY_METADATA_TYPE.ratePlan) {
            return ratePlanList;
        }
        if (type === POLICY_METADATA_TYPE.rateCategory) {
            return rateCategoryList;
        }
        if (type === ENTERPRISE_POLICY_METADATA_TYPE.rateCatalogs) {
            return ratePlansArray;
        }
        if (type === ENTERPRISE_POLICY_METADATA_TYPE.rateCategories) {
            return rateCategoryList;
        }
        if (type === ENTERPRISE_POLICY_METADATA_TYPE.chainCategories) {
            return chainCategoryList;
        }
    }
}

class MockHttpService {
    response: IHTTPResponse;
    get(urlPath) {
        if (urlPath === 'hotels/1098/policy-template/CANCEL/history/1229120') {
            this.response = {
                status: 200,
                body: cancelTemplateHistory
            };
        } else if (urlPath === 'hotels/1098/policy-template/GUARANTEE/history/1229117') {
            this.response = {
                status: 200,
                body: guaranteeTemplateHistory
            };
        } else if (urlPath === 'hotels/1098/policy-template/DEPOSIT/history/1229118') {
            this.response = {
                status: 200,
                body: depositTemplateHistory
            };
        } else if (urlPath === 'hotels/1098/policy/CANCEL/history/1229328') {
            this.response = {
                status: 200,
                body: cancellationPolicyHistory
            };
        } else if (urlPath === 'hotels/1098/policy/GUARANTEE/history/1229329') {
            this.response = {
                status: 200,
                body: guaranteePolicyHistory
            };
        } else if (urlPath === 'hotels/1098/policy/DEPOSIT/history/1229330') {
            this.response = {
                status: 200,
                body: depositPolicyHistory
            };
        } else if (urlPath === 'enterprise/AAM/policy/CANCEL/history/1229328') {
            this.response = {
                status: 200,
                body: cancellationPolicyHistory
            };
        } else {
            this.response = {
                status: 404,
                body: errorObject
            };
        }
        return of(this.response);
    }
}

class MockRulesMetaDataService {
    getTemplateNameById(id: number) {
        return 'Test policy template';
    }
}

describe('Version History Service', () => {
    let versionHistoryService: VersionHistoryService;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;
    let sharedDataService: SharedDataService;
    let contextService: ContextService;

    window['CONFIG'] = {
        tokenDecodedData: APP_CONSTANT.config.tokenDecodedData,
        apiUrl: APP_CONSTANT.config.apiUrl
    };

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
                {
                    provide: HTTPService,
                    useClass: MockHttpService
                },
                {
                    provide: RulesMataDataService,
                    useClass: MockRulesMetaDataService
                },
                VersionHistoryService,
                ContextService,
                PolicyMgmtUtilityService
            ]
        });
        versionHistoryService = TestBed.get(VersionHistoryService);
        tcTranslateService = TestBed.get(TcTranslateService);
        translateService = TestBed.get(TranslateService);
        sharedDataService = TestBed.get(SharedDataService);
        contextService = TestBed.get(ContextService);
        tcTranslateService.initTranslation(translateService);
        versionHistoryService.dropdownList = {
            ratePlanList: [],
            rateCategoryList: [],
            chainCategories: []
        };
    }));

    it('Version History Service should be Initialized', () => {
        expect(versionHistoryService).toBeTruthy();
    });

    it('Should return Version History response in UI format - cancellation Template', () => {
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        versionHistoryService.getVersionHistoryData(1229120).subscribe((data: Array<IHistoryRecord>) => {
            expect(data[0].field).toEqual('Policy Template Code (Optional)');
        });
    });

    it('Should return Version History response in UI format - Guarantee Template', () => {
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        versionHistoryService.getVersionHistoryData(1229117).subscribe((data: Array<IHistoryRecord>) => {
            expect(data[0].field).toEqual('Accepted Tender');
        });
    });

    it('Should return Version History response in UI format - Deposit Template', () => {
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        versionHistoryService.getVersionHistoryData(1229118).subscribe((data: Array<IHistoryRecord>) => {
            expect(data[0].field).toEqual('Accepted Tender');
        });
    });

    it('Should return Version History response in UI format - Cancellation policy', async(() => {
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        versionHistoryService.getVersionHistoryData(1229328).subscribe((data: Array<IHistoryRecord>) => {
            expect(data[0].field).toEqual('Day of Week');
        });
    }));

    it('Should return Version History response in UI format - Guarantee Policy', async(() => {
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        versionHistoryService.getVersionHistoryData(1229329).subscribe((data: Array<IHistoryRecord>) => {
            expect(data[2].field).toEqual('Policy Status');
        });
    }));

    it('Should return Version History response in UI format - Deposit Policy', async(() => {
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        versionHistoryService.getVersionHistoryData(1229330).subscribe((data: Array<IHistoryRecord>) => {
            expect(data[0].newValue[0]).toEqual('Mon');
        });
    }));

    it('Should return Array fo days', () => {
        const inputValue = '1=2=3=4=5=6=7';
        const outputArray = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let daysArray = [];
        daysArray = versionHistoryService.setDow(inputValue);
        expect(daysArray[1]).toEqual(outputArray[1]);
    });

    it('Should return template name', () => {
        let templateName;
        templateName = versionHistoryService.getTemplateNameById('1228298');
        expect(templateName).toEqual('Test policy template');
    });

    it('Should split string', () => {
        const inputString = '1234=4567=7891';
        const outputArr = versionHistoryService.splitValues(inputString);
        expect(outputArr[0]).toEqual('1234');
    });

    it('Should return rateplan by Id', () => {
        versionHistoryService.ratePlans = ratePlansArray;
        const inputIds = ['1', '2', '3'];
        const outputArr = versionHistoryService.getRatePlanNameById(inputIds);
        expect(outputArr[0]).toEqual('rate plan item 1');
    });

    it('Should return rate category by Id', () => {
        versionHistoryService.rateCategories = rateCategoryList;
        const id = ['12341'];
        const rateCategory = versionHistoryService.getRateCategoryById(id);
        expect(rateCategory[0]).toEqual('RACK');
    });

    it('Should return Version History response in UI format - Cancellation policy Enterprise level', () => {
        versionHistoryService.chainCategories = chainCategoryList;
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        versionHistoryService.getVersionHistoryData(1229328).subscribe((data: Array<IHistoryRecord>) => {
            expect(data[0].field).toEqual('Day of Week');
        });
    });
});

