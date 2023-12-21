/**
 * Core angular modules
 */
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { HttpClientModule, HttpClient, HttpResponse } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TcTranslateService, TcHttpHandler } from 'tc-angular-services';
import { ListComponent } from './list.component';
import { ContextService } from '../../core/context.service';
import { RulesConfigurationService } from '../../core/rules-config.service';
import { PolicyMgmtListParsingService } from './policy-mgmt-list-parsing.service';
import { APP_CONSTANT } from '../../../app/app.constant';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedDataService } from '../../core/shared.data.service';
import { POLICY_TYPE, CONFIG_TYPE, POLICY_LEVEL, DEFAULT_VALUES } from '../../core/constants';
import { LIST_CONFIG } from './policy-mgmt-list.constant';
import { SimpleChange } from '@angular/core';
import { PolicyMgmtSearchService } from '../policy-mgmt-search.service';
import { HTTPService } from '../../core/http.service';
import { PolicyMgmtSearchPayloadService } from '../../core/search-payload.service';
import { RouteStateService } from '../../core/route.state.service';
import { Router, RouterEvent, ActivatedRoute } from '@angular/router';
import { ReplaySubject, from, Observable, of } from 'rxjs';
import { STATUS_LIST, PROPERTY_POLICY_CREATION_LEVEL, ENTERPRISE_POLICY_CREATION_LEVEL } from '../../core/rules-config.constant';
import { IHTTPResponse, IHttpErrorResponse } from '../../core/common.model';
import { PolicyMgmtListDetailsModalComponent } from './list-details-modal/policy-mgmt-list-details-modal.component';
import { PolicyMgmtUtilityService } from '../../core/utility.service';
import { IEMTemplateSearchListModel, IPolicySearchListModel, ITemplateSearchListModel } from './policy-mgmt-list.model';
import { SharedModule } from '../../common/shared.module';
import { PolicyMgmtCreatePolicyService } from '../../create/policy/policy-mgmt-create-policy.service';
import { PolicyMgmtCreateTemplateService } from '../../create/template/policy-mgmt-create-template.service';
import { PolicyMgmtSearchPolicyService } from '../policy-mgmt-search-policies.service';
import { PolicyMgmtErrorService } from '../../core/error.service';
import { RulesMataDataService } from '../../core/rules-meta-data.service';
import { IDepositConfigurationSearchResponseModel } from '../policy-mgmt-search.model';

const searchCancellationList = require('../../../assets-policy-mgmt/data/policy-template/search/cancellation.json');
const searchGuaranteeList = require('../../../assets-policy-mgmt/data/policy-template/search/guarantee.json');
const searchDepositList = require('../../../assets-policy-mgmt/data/policy-template/search/deposit.json');
const searchDepositConfigurationList = require('../../../assets-policy-mgmt/data/payment-deposit-rule/search/search.json');
const searchPropertyDepositConfigurationList = require('../../../assets-policy-mgmt/data/payment-deposit-rule/search/searchProperty.json');

const searchEMCancellationList = require('../../../assets-policy-mgmt/data/enterprise-policy-templates/search/searchEMCancellationList.json');
const searchEMGuaranteeList = require('../../../assets-policy-mgmt/data/enterprise-policy-templates/search//searchEMGuaranteeList.json');
const searchEMDepositList = require('../../../assets-policy-mgmt/data/enterprise-policy-templates/search//searchEMDepositList.json');
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

class MockSharedDataService {
    getHotelInfo() {
        const hotelInfo = require('../../../assets-policy-mgmt/data/hotel-info.json');
        return hotelInfo;
    }

    getMetaData() {
        return MetaData;
    }

    getChainInfo() {
        return {
            chainCode: 'AAM',
            chainId: 12,
            chainName: 'AAM',
            status: 'ACTIVE',
            creationDateTime: '01-01-2001',
            creationBy: 'ihUser',
            lastUpdateDateTime: '01-01-2001',
            lastUpdateBy: 'ihUser',
            timezone: '',
            categories: [],
            chainHotels: [],
            adminUsers: []
        };
    }
}

const errorObject: IHttpErrorResponse = {
    status: 404,
    statusText: 'OK',
    error: 'Error'
};
class MockPolicyMgmtSearchService {
    response: IHTTPResponse;
    updateStatus(id: number, status: string) {
        if (id && status === STATUS_LIST.INACTIVE) {
            this.response = {
                status: 204,
                body: ''
            };
        } else if (id && status === STATUS_LIST.ACTIVE) {
            this.response = {
                status: 204,
                body: ''
            };
        } else {
            this.response = {
                status: 404,
                body: errorObject
            };
        }
        return of(this.response);
    }
    setEnableInstallment() { }
}

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

const eventSubject = new ReplaySubject<RouterEvent>();
const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    events: eventSubject.asObservable(),
    url: '/policy-mgmt/property/search/policy'
};

describe('List Component', () => {
    let fixture: ComponentFixture<ListComponent>;
    let instance: ListComponent;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;
    let contextService: ContextService;
    let listParsingService: PolicyMgmtListParsingService;
    let createPolicyTemplateService: PolicyMgmtCreateTemplateService;
    let errorService: PolicyMgmtErrorService;
    window['CONFIG'] = {
        tokenDecodedData: APP_CONSTANT.config.tokenDecodedData,
        apiUrl: APP_CONSTANT.config.apiUrl
    };
    beforeEach((done) => {
        TestBed.configureTestingModule({
            declarations: [
                ListComponent,
                PolicyMgmtListDetailsModalComponent
            ],
            imports: [
                NgbModule,
                SharedModule,
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
                ContextService,
                RulesConfigurationService,
                PolicyMgmtListParsingService,
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                },
                {
                    provide: PolicyMgmtSearchService,
                    useClass: MockPolicyMgmtSearchService
                },
                HTTPService,
                PolicyMgmtSearchPayloadService,
                PolicyMgmtUtilityService,
                RouteStateService,
                {
                    provide: Router,
                    useValue: mockRouter
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: from([{ policyType: POLICY_TYPE.CANCELLATION }]),
                        queryParams: from([{ ratePlanId: null }])
                    }
                },
                PolicyMgmtCreatePolicyService,
                PolicyMgmtSearchPolicyService,
                PolicyMgmtErrorService,
                RulesMataDataService,
                PolicyMgmtCreateTemplateService
            ]
        }).compileComponents()
            .then(() => {
                tcTranslateService = TestBed.inject(TcTranslateService);
                translateService = TestBed.inject(TranslateService);
                tcTranslateService.initTranslation(translateService);
                contextService = TestBed.inject(ContextService);
                listParsingService = TestBed.inject(PolicyMgmtListParsingService);
                createPolicyTemplateService = TestBed.inject(PolicyMgmtCreateTemplateService);
                errorService = TestBed.inject(PolicyMgmtErrorService);
                done();
            });
    });

    describe('List for Cancellation', () => {
        beforeEach((done) => {
            contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
            contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
            contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
            fixture = TestBed.createComponent(ListComponent);
            instance = fixture.componentInstance;
            done();
        });

        it('expect List Instance to be Defined', () => {
            expect(instance).toBeTruthy();
        });

        it('Should Check data for ListRules', () => {
            const ruleData = { ...LIST_CONFIG['property']['template']['cancellation'] };
            fixture.detectChanges();
            expect(instance.listRules).toEqual(ruleData.fields);
        });

        it('Should Check listData on ngOnChanges', () => {
            const cancelSearchListData = searchCancellationList.policyTemplates;
            const totalCount = searchCancellationList.totalRecordCount;
            cancelSearchListData[0].name = 'Test Data';
            cancelSearchListData[0].policyCode = 'Test12';
            cancelSearchListData[0].status = 'ACTIVE';
            cancelSearchListData[0].id = 100;

            const cancellationRule = cancelSearchListData[0].policySetting.cancellationRule;
            cancellationRule.chargeType = 'SAME_DAY';
            cancellationRule.priorHours = 21;

            const data = {
                cancellationRule: 'page_SameDay-LblSameDay - 21:00',
                name: 'Test Data (Test12)',
                status: 'ACTIVE',
                id: 100
            };
            instance.searchListData = cancelSearchListData;
            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const currentPage = DEFAULT_VALUES.searchScreen.pagination.page;
            const startindex = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
            const endindex = Math.min(startindex + pagesize - 1, totalCount);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            instance.paginationConfig = paginationObj;
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, cancelSearchListData, false),
                paginationConfig: new SimpleChange(null, totalCount, false)
            });
            fixture.detectChanges();
            expect(instance.listData.length).not.toEqual(0);
            expect(instance.listData[0].name).toEqual(data.name);
            expect(instance.paginationConfig.pageSize).toEqual(DEFAULT_VALUES.searchScreen.pagination.pageSize);
            expect(instance.paginationConfig.collectionSize).not.toEqual(0);
            expect(instance.paginationConfig.page).toEqual(DEFAULT_VALUES.searchScreen.pagination.page);
            expect(instance.paginationConfig.startIndex).toEqual(DEFAULT_VALUES.searchScreen.pagination.startPageIndex);
            expect(instance.paginationConfig.endIndex).not.toEqual(0);
        });

        it('Should call parsePropertyPolicyListData when policy level is property', () => {
            spyOn(listParsingService, 'parsePropertyPolicyListData');
            contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
            contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
            const cancelSearchListData = searchCancellationList.policyTemplates;
            const totalCount = searchCancellationList.totalRecordCount;
            instance.listData = cancelSearchListData;
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, cancelSearchListData, false),
                paginationConfig: new SimpleChange(null, totalCount, false)
            });
            expect(listParsingService.parsePropertyPolicyListData).toHaveBeenCalled();
        });

        it('Should call parseEMPolicyListData when policy level is enterprise', () => {
            spyOn(listParsingService, 'parseEMPolicyListData');
            contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
            contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
            const cancelSearchListData = searchCancellationList.policyTemplates;
            const totalCount = searchCancellationList.totalRecordCount;
            instance.listData = cancelSearchListData;
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, cancelSearchListData, false),
                paginationConfig: new SimpleChange(null, totalCount, false)
            });
            expect(listParsingService.parseEMPolicyListData).toHaveBeenCalled();
        });

        it('Should Check listData on loadPage', () => {
            const cancelSearchListData = searchCancellationList.policyTemplates;
            const totalCount = searchCancellationList.totalRecordCount;
            const data = {
                cancellationRule: 'page_SameDay-LblSameDay - 21:00',
                name: 'Test Data (Test12)',
                status: 'ACTIVE',
                isCreatedAtEnterpriseLevel: false,
                id: 100
            };
            const currentPage = 2;
            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const startindex = ((currentPage - 1) * pagesize) + 1;
            const pageCollectionSize = totalCount;
            const endindex = Math.min(startindex + pagesize - 1, pageCollectionSize);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            cancelSearchListData[startindex].name = 'Test Data';
            cancelSearchListData[startindex].policyCode = 'Test12';
            cancelSearchListData[startindex].status = 'ACTIVE';
            cancelSearchListData[startindex].id = 100;

            const cancellationRule = cancelSearchListData[startindex].policySetting.cancellationRule;
            cancellationRule.chargeType = 'SAME_DAY';
            cancellationRule.priorHours = 21;

            instance.searchListData = cancelSearchListData.slice(startindex, endindex);
            instance.paginationConfig = paginationObj;
            instance.loadPage(2);
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, cancelSearchListData, false),
                paginationConfig: new SimpleChange(null, totalCount, false)
            });
            fixture.detectChanges();
            expect(instance.listData.length).not.toEqual(0);
            expect(instance.listData[0]).toEqual(data);
            expect(instance.paginationConfig.pageSize).toEqual(DEFAULT_VALUES.searchScreen.pagination.pageSize);
            expect(instance.paginationConfig.collectionSize).not.toEqual(0);
            expect(instance.paginationConfig.page).toEqual(2);
            expect(instance.paginationConfig.startIndex).toEqual(startindex);
            expect(instance.paginationConfig.endIndex).not.toEqual(0);
        });


        it('should set navigation to sepcified route', () => {
            contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
            contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
            const data: ITemplateSearchListModel = {
                id: 200
            };
            instance.editItem(data);
            expect(mockRouter.navigate).toHaveBeenCalled();
        });

        it('should call makeActiveInactive method with ACTIVE status', () => {
            const cancelSearchListData = searchCancellationList.policyTemplates;
            const totalCount = searchCancellationList.totalRecordCount;
            const data = {
                cancellationRule: 'page_SameDay-LblSameDay - 21:00',
                name: 'Test Data (Test12)',
                status: 'ACTIVE',
                id: 100
            };
            instance.searchListData = cancelSearchListData;
            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const currentPage = DEFAULT_VALUES.searchScreen.pagination.page;
            const startindex = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
            const endindex = Math.min(startindex + pagesize - 1, totalCount);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            instance.paginationConfig = paginationObj;
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, cancelSearchListData, false),
                paginationConfig: new SimpleChange(null, totalCount, false)
            });
            const rowObj = {
                id: 100,
                status: STATUS_LIST.INACTIVE
            };
            instance.makeActiveInactive(rowObj);
            cancelSearchListData[0].name = 'Test Data';
            cancelSearchListData[0].policyCode = 'Test12';
            cancelSearchListData[0].status = 'ACTIVE';
            cancelSearchListData[0].id = 100;

            const cancellationRule = cancelSearchListData[0].policySetting.cancellationRule;
            cancellationRule.chargeType = 'SAME_DAY';
            cancellationRule.priorHours = 21;
            instance.searchListData = cancelSearchListData;
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, cancelSearchListData, false),
                paginationConfig: new SimpleChange(null, cancelSearchListData.length, false)
            });
            expect(instance.listData.length).not.toEqual(0);
            expect(instance.listData[0].name).toEqual(data.name);
        });

        it('should call makeActiveInactive method with INACTIVE status on Page 1', () => {
            const cancelSearchListData = searchCancellationList.policyTemplates;
            const totalCount = searchCancellationList.totalRecordCount;
            cancelSearchListData[1].name = 'Test Data';
            cancelSearchListData[1].policyCode = 'Test12';
            cancelSearchListData[1].status = 'ACTIVE';
            cancelSearchListData[1].id = 100;

            const cancellationRule = cancelSearchListData[1].policySetting.cancellationRule;
            cancellationRule.chargeType = 'SAME_DAY';
            cancellationRule.priorHours = 21;

            const data = {
                cancellationRule: 'page_SameDay-LblSameDay - 21:00',
                name: 'Test Data (Test12)',
                status: 'ACTIVE',
                isCreatedAtEnterpriseLevel: false,
                id: 100
            };
            instance.searchListData = cancelSearchListData;
            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const currentPage = DEFAULT_VALUES.searchScreen.pagination.page;
            const startindex = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
            const endindex = Math.min(startindex + pagesize - 1, totalCount);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            instance.paginationConfig = paginationObj;
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, cancelSearchListData, false),
                paginationConfig: new SimpleChange(null, totalCount, false)
            });
            const rowObj = {
                id: 100,
                status: STATUS_LIST.ACTIVE
            };
            instance.makeActiveInactive(rowObj);
            cancelSearchListData.shift();
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, cancelSearchListData, false),
                paginationConfig: new SimpleChange(null, cancelSearchListData.length, false)
            });
            expect(instance.listData.length).not.toEqual(0);
            expect(instance.listData[0]).toEqual(data);
        });

        it('should call makeActiveInactive method with INACTIVE status on Page 2', () => {
            const cancelSearchListData = searchCancellationList.policyTemplates;
            const totalCount = searchCancellationList.totalRecordCount;
            const data = {
                cancellationRule: 'page_SameDay-LblSameDay - 21:00',
                name: 'Test Data (Test12)',
                status: 'ACTIVE',
                id: 100
            };
            const currentPage = 2;
            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const startindex = ((currentPage - 1) * pagesize) + 1;
            const pageCollectionSize = totalCount;
            const endindex = Math.min(startindex + pagesize - 1, pageCollectionSize);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            cancelSearchListData[startindex].name = 'Test Data';
            cancelSearchListData[startindex].policyCode = 'Test12';
            cancelSearchListData[startindex].status = 'ACTIVE';
            cancelSearchListData[startindex].id = 100;

            const cancellationRule = cancelSearchListData[startindex].policySetting.cancellationRule;
            cancellationRule.chargeType = 'SAME_DAY';
            cancellationRule.priorHours = 21;

            instance.searchListData = cancelSearchListData.slice(startindex, endindex - 3);
            instance.paginationConfig = paginationObj;
            instance.loadPage(2);
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, cancelSearchListData, false),
                paginationConfig: new SimpleChange(null, cancelSearchListData.length, false)
            });
            const rowObj = {
                id: 100,
                status: STATUS_LIST.ACTIVE
            };
            instance.makeActiveInactive(rowObj);
            cancelSearchListData[0].name = 'Test Data';
            cancelSearchListData[0].policyCode = 'Test12';
            cancelSearchListData[0].status = 'ACTIVE';
            cancelSearchListData[0].id = 100;

            const cancellationRule2 = cancelSearchListData[0].policySetting.cancellationRule;
            cancellationRule2.chargeType = 'SAME_DAY';
            cancellationRule2.priorHours = 21;
            // tslint:disable-next-line: max-line-length
            /*eslint max-len: ["error", { "code": 180 }]*/
            instance.searchListData = cancelSearchListData.slice(DEFAULT_VALUES.searchScreen.pagination.startPageIndex - 1, DEFAULT_VALUES.searchScreen.pagination.pageSize);
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, instance.searchListData, false),
                paginationConfig: new SimpleChange(null, cancelSearchListData.length, false)
            });
            expect(instance.listData.length).not.toEqual(0);
            expect(instance.listData[0].name).toEqual(data.name);
        });

        it('should set navigation to policies screen', () => {
            contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
            contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
            instance.managePolicy();
            expect(mockRouter.navigate).toHaveBeenCalled();
        });

    });

    describe('List for Guarantee', () => {
        beforeEach((done) => {
            contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
            contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
            contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
            fixture = TestBed.createComponent(ListComponent);
            instance = fixture.componentInstance;
            done();
        });

        it('expect List Instance to be Defined', () => {
            expect(instance).toBeTruthy();
        });

        it('Should Check data for ListRules', () => {
            const ruleData = { ...LIST_CONFIG['property']['template']['guarantee'] };
            fixture.detectChanges();
            expect(instance.listRules).toEqual(ruleData.fields);
        });

        it('Should Check listData on ngOnChanges', () => {
            const guaranteeSearchListData = searchGuaranteeList.policyTemplates;
            const totalCount = searchGuaranteeList.totalRecordCount;
            guaranteeSearchListData[0].name = 'Test Data';
            guaranteeSearchListData[0].policyCode = 'Test12';
            guaranteeSearchListData[0].status = 'ACTIVE';
            guaranteeSearchListData[0].id = 200;

            guaranteeSearchListData[0].policySetting.acceptedTender = 17;
            guaranteeSearchListData[0].policySetting.holdTime = 13;

            const data = {
                acceptedTender: 'Accept All',
                arrivalTime: 'global_HoldUtil-LblHoldUtil 13global_00WithoutPayment-Lbl00WithoutPayment',
                name: 'Test Data (Test12)',
                status: 'ACTIVE',
                isCreatedAtEnterpriseLevel: false,
                id: 200
            };
            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const currentPage = DEFAULT_VALUES.searchScreen.pagination.page;
            const startindex = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
            const endindex = Math.min(startindex + pagesize - 1, totalCount);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            instance.paginationConfig = paginationObj;
            instance.searchListData = guaranteeSearchListData;
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, guaranteeSearchListData, false),
            });
            fixture.detectChanges();
            expect(instance.listData.length).not.toEqual(0);
            expect(instance.listData[0]).toEqual(data);
        });
    });

    describe('List for Deposit', () => {
        beforeEach((done) => {
            contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
            contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
            contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
            fixture = TestBed.createComponent(ListComponent);
            instance = fixture.componentInstance;
            done();
        });

        it('expect List Instance to be Defined', () => {
            expect(instance).toBeTruthy();
        });

        it('Should Check data for ListRules', () => {
            const ruleData = { ...LIST_CONFIG['property']['template']['deposit'] };
            fixture.detectChanges();
            expect(instance.listRules).toEqual(ruleData.fields);
        });

        it('Should Check listData on ngOnChanges', () => {
            const depositSearchListData = searchDepositList.policyTemplates;
            const totalCount = searchDepositList.totalRecordCount;
            depositSearchListData[0].policySetting.acceptedTender = 8;
            depositSearchListData[0].policySetting.depositRuleId = 124;
            depositSearchListData[0].name = 'Test Data';
            depositSearchListData[0].policyCode = 'Template';
            depositSearchListData[0].policySetting.depositRuleName = 'deposit rule';
            depositSearchListData[0].id = 300;
            const data = {
                acceptedTender: 'Credit Card, Alternate Payments',
                depositeRule: 'deposit rule',
                name: 'Test Data (Template)',
                isCreatedAtEnterpriseLevel: false,
                status: 'ACTIVE',
                id: 300
            };
            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const currentPage = DEFAULT_VALUES.searchScreen.pagination.page;
            const startindex = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
            const endindex = Math.min(startindex + pagesize - 1, totalCount);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            instance.paginationConfig = paginationObj;
            instance.searchListData = depositSearchListData;
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, depositSearchListData, false),
            });
            fixture.detectChanges();
            expect(instance.listData.length).not.toEqual(0);
            expect(instance.listData[0]).toEqual(data);
        });

        xit('should call List Details modal open() with list and label as param', () => {
            const list: IPolicySearchListModel = {
                level: PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN,
                linkedMetaDataList: ['RATE PLAN 1', 'RATE PLAN 2']
            };
            const label = 'level';
            instance.viewDetails(list, label);
            expect(instance.listDetailsModal.modalHeading).toBeTruthy();
            expect(instance.listDetailsModal.listData).toBeTruthy();
            instance.listDetailsModal.close();
        });

        it('should return policy level label', () => {
            let level: string;
            let label: string;

            level = PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN;
            label = instance.getPolicyLevelLabel(level);
            expect(label).toEqual('global_ViewRatePlans-LblViewRatePlans');

            level = PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY;
            label = instance.getPolicyLevelLabel(level);
            expect(label).toEqual('global_ViewRateCategories-LblViewRateCategories');

            level = ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG;
            label = instance.getPolicyLevelLabel(level);
            expect(label).toEqual('global_ViewRatePlans-LblViewRatePlans');

            level = ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY;
            label = instance.getPolicyLevelLabel(level);
            expect(label).toEqual('global_ViewRateCategories-LblViewRateCategories');

            level = ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
            label = instance.getPolicyLevelLabel(level);
            expect(label).toEqual('global_ViewChainCategories-LblViewChainCategories');
        });
    });

    describe('List for Enterprise Payment Deposit Rules', () => {
        beforeEach((done) => {
            contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
            contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
            fixture = TestBed.createComponent(ListComponent);
            instance = fixture.componentInstance;
            done();
        });

        it('expect List Instance to be Defined', () => {
            expect(instance).toBeTruthy();
        });

        it('Should Check data for ListRules', () => {
            const ruleData = { ...LIST_CONFIG['enterprise']['payment-deposit-rule'] };
            fixture.detectChanges();
            expect(instance.listRules).toEqual(ruleData.fields);
        });

        it('Should Check listData on ngOnChanges', () => {
            const depositConfigurationSearchListData = searchDepositConfigurationList;
            const totalCount = searchDepositConfigurationList.totalCount;
            depositConfigurationSearchListData.emPaymentDepositRules[0].emPaymentDepositRuleTemplateId = 111;
            depositConfigurationSearchListData.emPaymentDepositRules[0].emPaymentDepositRuleTemplateName = 'Rule 1';
            depositConfigurationSearchListData.emPaymentDepositRules[0].jobId = 1;

            const paymentDepositRule = depositConfigurationSearchListData.emPaymentDepositRules[0].paymentDepositRule;
            paymentDepositRule.status = 'add';
            paymentDepositRule.rules[0].chargeType = 'flat';

            const data = {
                emPaymentDepositRuleTemplateId: 111,
                emPaymentDepositRuleTemplateName: 'Rule 1',
                jobId: 1
            };
            instance.searchListData = depositConfigurationSearchListData.emPaymentDepositRules;
            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const currentPage = DEFAULT_VALUES.searchScreen.pagination.page;
            const startindex = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
            const endindex = Math.min(startindex + pagesize - 1, totalCount);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            instance.paginationConfig = paginationObj;
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, depositConfigurationSearchListData.emPaymentDepositRules, false),
                paginationConfig: new SimpleChange(null, totalCount, false)
            });
            fixture.detectChanges();
            expect(instance.listData.length).not.toEqual(0);
            expect(instance.listData[0].name).toEqual(data.emPaymentDepositRuleTemplateName);
            expect(instance.paginationConfig.pageSize).toEqual(DEFAULT_VALUES.searchScreen.pagination.pageSize);
            expect(instance.paginationConfig.collectionSize).not.toEqual(0);
            expect(instance.paginationConfig.page).toEqual(DEFAULT_VALUES.searchScreen.pagination.page);
            expect(instance.paginationConfig.startIndex).toEqual(DEFAULT_VALUES.searchScreen.pagination.startPageIndex);
            expect(instance.paginationConfig.endIndex).not.toEqual(0);
        });

        it('should set navigation to specified route', () => {
            contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
            contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
            const data: ITemplateSearchListModel = {
                id: 200
            };
            instance.editItem(data);
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
    });

    describe('List for Property Payment Deposit Rules', () => {
        beforeEach((done) => {
            contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
            contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
            fixture = TestBed.createComponent(ListComponent);
            instance = fixture.componentInstance;
            done();
        });

        it('expect List Instance to be Defined', () => {
            expect(instance).toBeTruthy();
        });

        it('Should Check data for ListRules', () => {
            const ruleData = { ...LIST_CONFIG['property']['payment-deposit-rule'] };
            fixture.detectChanges();
            expect(instance.listRules).toEqual(ruleData.fields);
        });

        it('Should Check listData on ngOnChanges', () => {
            //Arrange
            const depositConfigurationSearchListData = searchPropertyDepositConfigurationList as IDepositConfigurationSearchResponseModel;
            const totalCount = searchDepositConfigurationList.totalCount;
            depositConfigurationSearchListData.paymentDepositRules[0].depositRuleId = 111;
            depositConfigurationSearchListData.paymentDepositRules[0].name = 'Rule 1';

            const paymentDepositRule = depositConfigurationSearchListData.paymentDepositRules[0].ruleInfo[0];
            paymentDepositRule.status = 'add';
            paymentDepositRule.chargeType = 'flat';

            const data = {
                depositRuleId: 111,
                name: 'Rule 1'
            };
            instance.searchListData = depositConfigurationSearchListData.paymentDepositRules;
            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const currentPage = DEFAULT_VALUES.searchScreen.pagination.page;
            const startindex = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
            const endindex = Math.min(startindex + pagesize - 1, totalCount);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            instance.paginationConfig = paginationObj;

            //Act
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, depositConfigurationSearchListData.paymentDepositRules, false),
                paginationConfig: new SimpleChange(null, totalCount, false)
            });
            fixture.detectChanges();

            //Assert
            expect(instance.listData.length).not.toEqual(0);
            expect(instance.listData[0].name).toEqual(data.name);
            expect(instance.paginationConfig.pageSize).toEqual(DEFAULT_VALUES.searchScreen.pagination.pageSize);
            expect(instance.paginationConfig.collectionSize).not.toEqual(0);
            expect(instance.paginationConfig.page).toEqual(DEFAULT_VALUES.searchScreen.pagination.page);
            expect(instance.paginationConfig.startIndex).toEqual(DEFAULT_VALUES.searchScreen.pagination.startPageIndex);
            expect(instance.paginationConfig.endIndex).not.toEqual(0);
        });

        it('Should call correct parser', () => {
            //Arrange
            contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
            contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
            const depositConfigurationSearchListData = searchPropertyDepositConfigurationList as IDepositConfigurationSearchResponseModel;
            const parseDepositConfigurationListData = spyOn(listParsingService, 'parseDepositConfigurationListData').and.returnValue(null);

            //Act
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, depositConfigurationSearchListData.paymentDepositRules, false),
                paginationConfig: new SimpleChange(null, 96, false)
            });

            //Assert
            expect(parseDepositConfigurationListData).toHaveBeenCalled();
        });

        it('Should set navigation to specified route', () => {
            contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
            contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
            const data: ITemplateSearchListModel = {
                id: 200
            };
            instance.editItem(data);
            expect(mockRouter.navigate).toHaveBeenCalled();
        });

        it('should return ViewLabel when configType is template and isCreatedAtEnterpriseLevel is true', () => {
            // Arrange
            contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
            contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);

            // Act
            const result = instance.displayViewOrEditButton(true);

            // Assert
            expect(result).toEqual(instance.ViewLabel);
        });

        it('should return ViewLabel when configType is payment-deposit-rule and isCreatedAtEnterpriseLevel is true', () => {
            // Arrange
            contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
            contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);

            // Act
            const result = instance.displayViewOrEditButton(true);

            // Assert
            expect(result).toEqual(instance.ViewLabel);
        });

        it('should return EditLabel when configType is not template or payment-deposit-rule and isCreatedAtEnterpriseLevel is true', () => {
            // Arrange
            contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
            contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);

            // Act
            const result = instance.displayViewOrEditButton(true);

            // Assert
            expect(result).toEqual(instance.EditLabel);
        });

        it('displayDeleteButton should return false when configType is DEPOSIT_CONFIGURATION, isEnterpriseLevel is false, and isCreatedAtEnterpriseLevel is true', () => {
            // Arrange
            contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
            contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);

            // Act
            const result = instance.displayDeleteButton(true);

            // Assert
            expect(result).toBe(false);
        });

        it('displayDeleteButton should return true when configType is DEPOSIT_CONFIGURATION and either isEnterpriseLevel or isCreatedAtEnterpriseLevel is false', () => {
            // Arrange
            contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
            contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);

            // Act
            const result = instance.displayDeleteButton(false);

            // Assert
            expect(result).toBe(true);
        });

        it('manageActionButton should return false when configType is DEPOSIT_CONFIGURATION, isEnterpriseLevel is false, and isCreatedAtEnterpriseLevel is true', () => {
            // Arrange
            contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
            contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);

            // Act
            const result = instance.manageActionButton(true);

            // Assert
            expect(result).toBe(false);
        });

        it('manageActionButton should return true when configType is DEPOSIT_CONFIGURATION and either isEnterpriseLevel or isCreatedAtEnterpriseLevel is false', () => {
            // Arrange
            contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
            contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);

            // Act
            const result = instance.manageActionButton(false);

            // Assert
            expect(result).toBe(true);
        });

        it('manageActionButton should return true when configType is not DEPOSIT_CONFIGURATION', () => {
            // Arrange
            contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
            contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);

            // Act
            const result = instance.manageActionButton(false);

            // Assert
            expect(result).toBe(true);
        });

    });

    describe('Enterprise Templates List for Cancellation', () => {
        beforeEach((done) => {
            contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
            contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
            contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
            fixture = TestBed.createComponent(ListComponent);
            instance = fixture.componentInstance;
            done();
        });

        it('expect List Instance to be Defined for cancellation', () => {
            // Assert
            expect(instance).toBeTruthy();
        });

        it('Should Check data for ListRules for cancellation', () => {
            // Arrange
            const ruleData = { ...LIST_CONFIG['enterprise']['template']['cancellation'] };

            // Act
            fixture.detectChanges();

            // Assert
            expect(instance.listRules).toEqual(ruleData.fields);
        });

        it('Should Check listData on ngOnChanges for cancellation', () => {
            // Arrange
            const cancelSearchListData = searchEMCancellationList.emPolicyTemplates;
            const totalCount = searchEMCancellationList.totalCount;

            cancelSearchListData[0].name = 'enterprise policy template test1';
            cancelSearchListData[0].policyCode = 'EPT';
            cancelSearchListData[0].status = 'ACTIVE';
            cancelSearchListData[0].emPolicyTemplateId = 123456;

            const cancellationRule = cancelSearchListData[0].policySetting.cancellationRule;
            cancellationRule.chargeType = 'ADVANCE_NOTICE';
            cancellationRule.priorHours = 19;

            const data = {
                cancellationRule: 'global_AdvanceNotice-LblAdvanceNotice - 0 global_Days+-LblDays+ 19 global_Hours-LblHours',
                name: 'enterprise policy template test1 (EPT)',
                isInstallmentEnabled: 'global_inactive_lbl-LblInactive',
                isFreeCancellation: 'global_NotSelected-MsgNotSelected',
                status: 'ACTIVE',
                id: 123456,
                jobId: 'ovOcQYoBnrYhsPpqeE2-',
                total_hotels_count: 24,
                failed_hotels_count: 0,

            };
            instance.searchListData = cancelSearchListData;
            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const currentPage = DEFAULT_VALUES.searchScreen.pagination.page;
            const startindex = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
            const endindex = Math.min(startindex + pagesize - 1, totalCount);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            instance.paginationConfig = paginationObj;

            // Act
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, cancelSearchListData, false),
                paginationConfig: new SimpleChange(null, totalCount, false)
            });
            fixture.detectChanges();

            // Assert
            expect(instance.listData.length).not.toEqual(0);
            expect(instance.listData[0]).toEqual(data);
            expect(instance.paginationConfig.pageSize).toEqual(DEFAULT_VALUES.searchScreen.pagination.pageSize);
            expect(instance.paginationConfig.collectionSize).not.toEqual(0);
            expect(instance.paginationConfig.page).toEqual(DEFAULT_VALUES.searchScreen.pagination.page);
            expect(instance.paginationConfig.startIndex).toEqual(DEFAULT_VALUES.searchScreen.pagination.startPageIndex);
            expect(instance.paginationConfig.endIndex).not.toEqual(0);
        });

        it('should set navigation to sepcified route when editItem', () => {
            // Arrange
            contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
            contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
            const data: IEMTemplateSearchListModel = {
                id: 12345
            };

            // Act
            instance.editItem(data);

            // Assert
            expect(mockRouter.navigate).toHaveBeenCalled();
        });
    });

    describe('Enterprise Templates List for Guarantee', () => {
        beforeEach((done) => {
            contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
            contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
            contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
            fixture = TestBed.createComponent(ListComponent);
            instance = fixture.componentInstance;
            done();
        });

        it('Should Check data for ListRules for guarantee', () => {
            // Arrange
            const ruleData = { ...LIST_CONFIG['enterprise']['template']['guarantee'] };

            // Act
            fixture.detectChanges();

            // Assert
            expect(instance.listRules).toEqual(ruleData.fields);
        });

        it('Should Check listData on ngOnChanges for guarantee', () => {
            // Arrange
            const guaranteeSearchListData = searchEMGuaranteeList.emPolicyTemplates;
            const totalCount = searchGuaranteeList.totalCount;
            guaranteeSearchListData[0].name = 'enterprise policy template test1';
            guaranteeSearchListData[0].policyCode = 'ENT';
            guaranteeSearchListData[0].status = 'ACTIVE';
            guaranteeSearchListData[0].emPolicyTemplateId = 123456;

            guaranteeSearchListData[0].policySetting.acceptedTender = 17;
            guaranteeSearchListData[0].policySetting.holdTime = 18;

            const data = {
                acceptedTender: 'Accept All',
                arrivalTime: 'global_HoldUtil-LblHoldUtil 18global_00WithoutPayment-Lbl00WithoutPayment',
                name: 'enterprise policy template test1 (ENT)',
                status: 'ACTIVE',
                id: 123456,
                isInstallmentEnabled: 'global_inactive_lbl-LblInactive',
                jobId: 'SPd4QYoBtSFadePyCjvl',
                total_hotels_count: 24,
                failed_hotels_count: 0
            };
            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const currentPage = DEFAULT_VALUES.searchScreen.pagination.page;
            const startindex = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
            const endindex = Math.min(startindex + pagesize - 1, totalCount);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            instance.paginationConfig = paginationObj;
            instance.searchListData = guaranteeSearchListData;

            // Act
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, guaranteeSearchListData, false),
            });
            fixture.detectChanges();

            // Assert
            expect(instance.listData.length).not.toEqual(0);
            expect(instance.listData[0]).toEqual(data);
        });
    });

    describe('Enterprise Templates List for Deposit', () => {
        beforeEach((done) => {
            contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
            contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
            contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
            fixture = TestBed.createComponent(ListComponent);
            instance = fixture.componentInstance;
            done();
        });

        it('Should Check data for ListRules for deposit', () => {
            // Arrange
            const ruleData = { ...LIST_CONFIG['enterprise']['template']['deposit'] };

            // Act
            fixture.detectChanges();

            // Assert
            expect(instance.listRules).toEqual(ruleData.fields);
        });

        it('Should Check listData on ngOnChanges for deposit', () => {
            // Arrange
            const depositSearchListData = searchEMDepositList.emPolicyTemplates;
            const totalCount = searchDepositList.totalCount;

            depositSearchListData[0].policySetting.acceptedTender = 8;
            depositSearchListData[0].policySetting.depositRuleId = 124;
            depositSearchListData[0].name = 'Test Data';
            depositSearchListData[0].policyCode = 'Template';
            depositSearchListData[0].policySetting.depositRuleName = 'deposit rule';
            depositSearchListData[0].emPolicyTemplateId = 123456;

            const data = {
                name: 'Test Data (Template)',
                id: 123456,
                status: 'ACTIVE',
                acceptedTender: 'Credit Card, Alternate Payments',
                depositeRule: 'deposit rule',
                isInstallmentEnabled: 'global_inactive_lbl-LblInactive',
                jobId: 'rQNxAooBrvYP_Kdj48sX',
                total_hotels_count: 0,
                failed_hotels_count: 0
            };

            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const currentPage = DEFAULT_VALUES.searchScreen.pagination.page;
            const startindex = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
            const endindex = Math.min(startindex + pagesize - 1, totalCount);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            instance.paginationConfig = paginationObj;
            instance.searchListData = depositSearchListData;

            // Act
            instance.ngOnChanges({
                searchListData: new SimpleChange(null, depositSearchListData, false),
            });
            fixture.detectChanges();

            // Assert
            expect(instance.listData.length).not.toEqual(0);
            expect(instance.listData[0]).toEqual(data);
        });

    });

    describe('Enterprise Policy template toggle status Make active/inactive', () => {

        beforeEach((done) => {
            contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
            contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
            contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
            fixture = TestBed.createComponent(ListComponent);
            instance = fixture.componentInstance;
            const searchListData = searchEMCancellationList.emPolicyTemplates;
            const totalCount = searchEMCancellationList.totalCount;

            searchListData[0].status = 'ACTIVE';
            searchListData[0].emPolicyTemplateId = 1234;

            instance.searchListData = searchListData;
            const pagesize = DEFAULT_VALUES.searchScreen.pagination.pageSize;
            const currentPage = DEFAULT_VALUES.searchScreen.pagination.page;
            const startindex = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
            const endindex = Math.min(startindex + pagesize - 1, totalCount);
            const paginationObj = {
                pageSize: pagesize,
                page: currentPage,
                startIndex: startindex,
                endIndex: endindex,
                collectionSize: totalCount
            };
            instance.paginationConfig = paginationObj;
            done();
        });

        it('should update status policyTemplate', () => {
            // Arrange
            const id = 1234;
            const rowObj = {
                id: id,
                status: STATUS_LIST.ACTIVE
            };
            const response: HttpResponse<any> = new HttpResponse({
                status: 200
            });
            spyOn(createPolicyTemplateService, 'createUpdatePolicyTemplate').and.returnValue(of(response));

            // Act
            instance.makeActiveInactive(rowObj);

            // Assert
            expect(createPolicyTemplateService.createUpdatePolicyTemplate).toHaveBeenCalledOnceWith(
                jasmine.objectContaining({ status: STATUS_LIST.INACTIVE, emPolicyTemplateId: id }), id);
        });

        it('should fail update status policyTemplate', () => {
            // Arrange
            const id = 1234;
            const rowObj = {
                id: 1234,
                status: STATUS_LIST.ACTIVE
            };
            const error = {
                error: {
                    errors: [
                        {
                            errorCode: 'DEPOSITRULE_NO_LONGER_EXISTS',
                            message: 'depositRule: Deposit Rule no longer exists.'
                        }
                    ]
                }
            };
            spyOn(createPolicyTemplateService, 'createUpdatePolicyTemplate').and.returnValue(throwError(() => error));
            spyOn(errorService, 'setErrorMessage').and.callThrough();

            // Act
            instance.makeActiveInactive(rowObj);

            // Assert
            expect(createPolicyTemplateService.createUpdatePolicyTemplate).toHaveBeenCalledOnceWith(
                jasmine.objectContaining({ status: STATUS_LIST.INACTIVE, emPolicyTemplateId: id }), id);
            expect(errorService.setErrorMessage).toHaveBeenCalledOnceWith(error.error.errors);
        });
    });
});
