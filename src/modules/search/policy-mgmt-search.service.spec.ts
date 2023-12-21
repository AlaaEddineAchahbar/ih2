import { ContextService } from '../core/context.service';
import { HTTPService } from '../core/http.service';
import { SharedDataService } from '../core/shared.data.service';
import { POLICY_LEVEL, CONFIG_TYPE, POLICY_TYPE, POLICY_TYPE_FOR_API, API_CONTEXT_PATH } from '../core/constants';
import { of, Subject } from 'rxjs';
import { IHTTPResponse, IHttpErrorResponse } from '../core/common.model';
import { TcTranslateService } from 'tc-angular-services';
import { IListSearchParams, ISearchEMResponse, ISearchEMTemplateParams } from './policy-mgmt-search.model';
import { PolicyMgmtSearchPayloadService } from '../core/search-payload.service';
import { PolicyMgmtSearchService } from './policy-mgmt-search.service';
import { TestBed, async } from '@angular/core/testing';
import { POLICY_LIST_TABS } from './policy-mgmt-search.constant';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { HttpClient, HttpClientModule, HttpResponse } from '@angular/common/http';
import { STATUS_LIST } from '../core/rules-config.constant';
import { ISearchResponse } from '../search/policy-mgmt-search.model';
import { PolicyMgmtUtilityService } from '../core/utility.service';
import { IPolicyMetaDataTypes, IPolicyMetadata } from '../core/rules-metadata.model';
import { POLICY_METADATA_TYPE } from '../core/rules.constant';


const searchGuaranteeJson = require('../../../src/assets-policy-mgmt/data/policy-template/search/guarantee.json');
const searchCancelJson = require('../../../src/assets-policy-mgmt/data/policy-template/search/cancellation.json');
const searchDepositJson = require('../../../src/assets-policy-mgmt/data/policy-template/search/deposit.json');
const searchPolicyCancelJson = require('../../assets-policy-mgmt/data/policy/search/cancellation.json');

const searchEMTemplateCancel =
                    require('../../assets-policy-mgmt/data/enterprise-policy-templates/search/searchEMCancellationList.json');
const searchEMTemplateGuarantee =
                    require('../../assets-policy-mgmt/data/enterprise-policy-templates/search/searchEMGuaranteeList.json');
const searchEMTemplateDeposit =
                    require('../../assets-policy-mgmt/data/enterprise-policy-templates/search/searchEMDepositList.json');

const paymentDepositRuleSoftDeleteRequest =
                require(`../../assets-policy-mgmt/data/property-payment-deposit-rule/soft-delete/payment-deposit-rule-soft-delete-rq.json`);
const metaDataJson = require('../../assets-policy-mgmt/data/meta-data.json');

const templateDropdownJson: Array<IPolicyMetadata> = require('../../assets-policy-mgmt/data/formatted-template-dropdown.json');
const ratePlanDropdownJson: Array<IPolicyMetadata> = require('../../assets-policy-mgmt/data/formatted-rateplan-dropdown.json');
const rateCategoryDropdownJson: Array<IPolicyMetadata> = require('../../assets-policy-mgmt/data/formatted-ratecategory-dropdown.json');

const errorObject: IHttpErrorResponse = {
    status: 404,
    statusText: 'OK',
    error: 'Error'
};

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

/**
 * Mock SearchPayloadService
 */
class MockSearchPayloadService {
    searchPayload: IListSearchParams;
    searchEMPayload: ISearchEMTemplateParams;
    getSearchPayload() {
        return this.searchPayload;
    }

    getSearchEMPayload() {
        return this.searchEMPayload;
    }

    getPolicySearchPayload() {
        return {
            search: {
                searchRequest: {
                    searchParameters: [
                        {
                            ruleTypeID: 14,
                            uniqueTypeID: '1',
                            uniqueID: 6938
                        },
                        {
                            ruleTypeID: 14,
                            uniqueTypeID: '7',
                            hotelID: '6938'
                        },
                        {
                            ruleTypeID: 14,
                            uniqueTypeID: '5',
                            hotelID: '6938'
                        }
                    ]
                }
            },
            uxDateRangeRuleCriteriaID: '1002',
            uxDowRuleCriteriaID: '1020',
            uxPolicyTemplateRuleDecisionTypeID: '1024',
            uxPolicyTypeRuleDecisionTypeModifierID: '1091'
        };
    }

    getEnterprisePolicySearchPayload() {
        return {};
    }
}

/** MockSharedDataService */
class MockSharedDataService {
    private policyMetadata: IPolicyMetaDataTypes;
    constructor() {
        this.policyMetadata = {};
    }
    getHotelInfo() {
        const hotelInfo = require('../../../src/assets-policy-mgmt/data/hotel-info.json');
        return hotelInfo;
    }

    getChainInfo() {
        return { chainCode: 'AAM'};
    }

    getRulesMetaData() {
        return metaDataJson;
    }

    getPolicyMetadata(type): any {
        switch(type) {
            case POLICY_METADATA_TYPE.rateCategory:
                return rateCategoryDropdownJson;
            case POLICY_METADATA_TYPE.ratePlan:
                return ratePlanDropdownJson;
            case POLICY_METADATA_TYPE.template:
                return templateDropdownJson;
            default:
                return null;
        }
    }
    setPolicyMetadata(type, data) {
        this.policyMetadata[type] = data;
    }
}

class MockHttpService {
    response: IHTTPResponse;
    post(urlPath) {
        if (urlPath === 'hotels/1098/policy-template/CANCEL/search') {
            this.response = {
                status: 200,
                body: searchCancelJson
            };
        } else if (urlPath === 'hotels/1098/policy-template/GUARANTEE/search') {
            this.response = {
                status: 200,
                body: searchGuaranteeJson
            };
        } else if (urlPath === 'hotels/1098/policy-template/DEPOSIT/search') {
            this.response = {
                status: 200,
                body: searchDepositJson
            };
        } else if (urlPath === 'hotels/1098/policy/CANCEL/search') {
            this.response = {
                status: 200,
                body: searchPolicyCancelJson
            };
        } else if (urlPath === 'enterprise/AAM/policyTemplate/CANCEL/search') {
            this.response = {
                status: 200,
                body: searchEMTemplateCancel
            };
        } else if (urlPath === 'enterprise/AAM/policyTemplate/GUARANTEE/search') {
            this.response = {
                status: 200,
                body: searchEMTemplateGuarantee
            };
        } else if (urlPath === 'enterprise/AAM/policyTemplate/DEPOSIT/search') {
            this.response = {
                status: 200,
                body: searchEMTemplateDeposit
            };
        } else if (urlPath === 'enterprise/AAM/policy/CANCEL/search') {
            this.response = {
                status: 200,
                body: searchPolicyCancelJson
            };
        } else {
            this.response = {
                status: 404,
                body: errorObject
            };
        }
        return of(this.response);
    }
    get(urlPath) {
        if (urlPath === 'policy-template/search/guarantee.json') {
            this.response = {
                status: 200,
                body: searchGuaranteeJson
            };
        } else {
            this.response = {
                status: 404,
                body: errorObject
            };
        }
        return of(this.response);
    }
    patch(urlPath: string, payload: any) {
        if (urlPath === 'hotels/1098/policy-template/GUARANTEE/100') {
            if (payload.status === STATUS_LIST.INACTIVE) {
                this.response = {
                    status: 200,
                    body: 'Inactivated'
                };
            } else {
                this.response = {
                    status: 200,
                    body: 'Activated'
                };
            }
        } else {
            this.response = {
                status: 404,
                body: errorObject
            };
        }
        return of(this.response);
    }
    put(urlPath, payload){
        return of(this.response);
    }
}

describe('Search Service initialized', () => {
    let searchService: PolicyMgmtSearchService;
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
                TcTranslateService, TranslateService,
                {
                    provide: HTTPService,
                    useClass: MockHttpService
                },
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                },
                {
                    provide: PolicyMgmtSearchPayloadService,
                    useClass: MockSearchPayloadService
                },
                ContextService,
                PolicyMgmtSearchService,
                PolicyMgmtUtilityService

            ]
        });
        searchService = TestBed.inject(PolicyMgmtSearchService);
        contextService = TestBed.inject(ContextService);
        sharedDataService = TestBed.inject(SharedDataService);
        tcTranslateService = TestBed.inject(TcTranslateService);
        translateService = TestBed.inject(TranslateService);
        tcTranslateService.initTranslation(translateService);

        searchService.hideFilterPanelSubject.subscribe();
        searchService.hideFilterPanelSubject = new Subject<boolean>();
        searchService.hideFilterPanel = false;
    }));

    it('Should Create Mock PolicyMgmtSearchService ', () => {
        expect(searchService).toBeTruthy();
    });

    it('should set hide-filter-panel subject', () => {
        searchService.hideFilterPanel = false;
        searchService.toggleHideFilterSubject();
        searchService.hideFilterPanelSubject.subscribe(data => {
            expect(data).toEqual(true);
        });
    });

    it('Should return search result for Cancellation', () => {
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        searchService.searchPolicies().subscribe((res) => {
            expect(res.totalRecordCount).toBeGreaterThan(0);
            expect(res.policyTemplates.length).toBeGreaterThan(0);
            expect(res.policyTemplates[0].name).toBeDefined();
            expect(res.policyTemplates[0].status).toBeDefined();
            expect(res.policyTemplates[0].id).toBeDefined();
            expect(res.policyTemplates[0].policySetting.cancellationRule.chargeType).toBeDefined();
        });
    });

    it('Should return search result for Guarantee', () => {
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        searchService.searchPolicies().subscribe((res) => {
            expect(res.totalRecordCount).toBeGreaterThan(0);
            expect(res.policyTemplates.length).toBeGreaterThan(0);
            expect(res.policyTemplates.length).toEqual(res.totalRecordCount);
            expect(res.policyTemplates[0].name).toBeDefined();
            expect(res.policyTemplates[0].status).toBeDefined();
            expect(res.policyTemplates[0].id).toBeDefined();
            expect(res.policyTemplates[0].policySetting.acceptedTender).toBeDefined();
        });
    });

    it('Should return search result for Deposit', () => {
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        searchService.searchPolicies().subscribe((res) => {
            expect(res.totalRecordCount).toBeGreaterThan(0);
            expect(res.policyTemplates.length).toBeGreaterThan(0);
            expect(res.policyTemplates.length).toEqual(res.totalRecordCount);
            expect(res.policyTemplates[0].name).toBeDefined();
            expect(res.policyTemplates[0].status).toBeDefined();
            expect(res.policyTemplates[0].id).toBeDefined();
            expect(res.policyTemplates[0].policySetting.acceptedTender).toBeDefined();
        });
    });

    it('Should return search result Policy (Cancellation/Guarantee/Deposit)', () => {
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        searchService.searchPolicies().subscribe((res: ISearchResponse) => {
            if (res) {
                expect(res).toBeTruthy();
                expect(res.policies.length).toBeTruthy();
            }
        });
    });

    it('Should return search result Enterprise (Cancellation/Guarantee/Deposit)', () => {
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        searchService.searchPolicies().subscribe((res: ISearchResponse) => {
            expect(res).toBeTruthy();
            expect(res.policies.length).toBeGreaterThan(0);
        });
    });

    it('Should return false for Enterprise when search call fails', () => {
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyType('wrong');
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        searchService.searchPolicies().subscribe((res: any) => {
            expect(res).toBe(false);
        });
    });

    it('Should create prod search url for policy template Cancellation', () => {
        const searchUrl = 'hotels/1098/policy-template/CANCEL/search';
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        expect(searchUrl).toEqual(searchService.formatSearchUrl());
    });

    it('Should create prod search url for enterprise policy Guarantee', () => {
        const searchUrl = 'enterprise/AAM/policy/GUARANTEE/search';
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        expect(searchUrl).toEqual(searchService.formatSearchUrl());
    });

    it('Should create prod search url for policy Guarantee', () => {
        const searchUrl = 'hotels/1098/policy/GUARANTEE/search';
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        expect(searchUrl).toEqual(searchService.formatSearchUrl());
    });

    it('Should create local search url for policy Cancellation', () => {
        const searchUrl = 'policy/search/cancellation.json';
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        expect(searchUrl).toEqual(searchService.formatSearchUrlOnLocal());
    });

    it('Should create local search url for policy template Guarantee', () => {
        const searchUrl = 'policy-template/search/guarantee.json';
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        expect(searchUrl).toEqual(searchService.formatSearchUrlOnLocal());
    });

    it('Should translate tab list', () => {
        let translatedTabList = [];
        expect(searchService.translationMap).toBeDefined();
        translatedTabList = searchService.translateTabList(POLICY_LIST_TABS);
        expect(translatedTabList).toEqual(POLICY_LIST_TABS);
    });

    it('Should make Active Policy as Inactive', () => {
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        searchService.updateStatus(100, STATUS_LIST.INACTIVE).subscribe((res) => {
            expect(res.body).toEqual('Inactivated');
        });
    });

    it('Should make InActive Policy as Active', () => {
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        searchService.updateStatus(100, STATUS_LIST.ACTIVE).subscribe((res) => {
            expect(res.body).toEqual('Activated');
        });
    });

    it('Should make an invalid Policy as Inactive', () => {
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        searchService.updateStatus(null, STATUS_LIST.INACTIVE).subscribe((res) => {
            expect(res.body.error).toEqual('Error');
        });
    });

    it('Enterprise Templates - Should return search result for Cancellation', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);

        // Act & Assert
        searchService.searchPolicies().subscribe((res) => {
            expect(res.totalCount).toBeGreaterThan(0);
            expect(res.emPolicyTemplates.length).toBeGreaterThan(0);
            expect(res.emPolicyTemplates[0].name).toBeDefined();
            expect(res.emPolicyTemplates[0].status).toBeDefined();
            expect(res.emPolicyTemplates[0].emPolicyTemplateId).toBeDefined();
            expect(res.emPolicyTemplates[0].policySetting.cancellationRule.chargeType).toBeDefined();
        });
    });

    it('Enterprise Templates - Should return search result for Guarantee', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);

        // Act & Assert
        searchService.searchPolicies().subscribe((res) => {
            expect(res.totalCount).toBeGreaterThan(0);
            expect(res.emPolicyTemplates.length).toBeGreaterThan(0);
            expect(res.emPolicyTemplates[0].name).toBeDefined();
            expect(res.emPolicyTemplates[0].status).toBeDefined();
            expect(res.emPolicyTemplates[0].emPolicyTemplateId).toBeDefined();
            expect(res.emPolicyTemplates[0].policySetting.acceptedTender).toBeDefined();
        });
    });

    it('Enterprise Templates - Should return search result for Deposit', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);

        // Act & Assert
        searchService.searchPolicies().subscribe((res) => {
            expect(res.totalCount).toBeGreaterThan(0);
            expect(res.emPolicyTemplates.length).toBeGreaterThan(0);
            expect(res.emPolicyTemplates[0].name).toBeDefined();
            expect(res.emPolicyTemplates[0].status).toBeDefined();
            expect(res.emPolicyTemplates[0].emPolicyTemplateId).toBeDefined();
            expect(res.emPolicyTemplates[0].policySetting.acceptedTender).toBeDefined();
        });
    });

    it('Enterprise Templates - should return the correct enterprise search URL for policy template', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);

        // Act
        const result = searchService.formatEnterpriseSearchUrl();

        // Assert
        expect(result).toBe(`enterprise/AAM/policyTemplate/DEPOSIT/search`);
    });

    it('Enterprise Templates - should return the correct enterprise search URL for policy', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);

        // Act
        const result = searchService.formatEnterpriseSearchUrl();
        // Assert
        expect(result).toBe(`enterprise/AAM/policy/DEPOSIT/search`);
    });


    it('should return the correct property template search URL', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);

        // Act
        const result = searchService.formatSearchUrl();

        // Assert
        expect(result).toBe('hotels/1098/policy-template/CANCEL/search');
    });

    it('should return the correct enterprise template search URL', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);

        // Act
        const result = searchService.formatSearchUrl();

        // Assert
        expect(result).toBe('enterprise/AAM/policy-template/CANCEL/search');
    });

    it('should return the correct property policy search URL', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);

        // Act
        const result = searchService.formatSearchUrl();

        // Assert
        expect(result).toBe('hotels/1098/policy/CANCEL/search');
    });

    it('should return the correct enterprise policy search URL', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);

        // Act
        const result = searchService.formatSearchUrl();

        // Assert
        expect(result).toBe('enterprise/AAM/policy/CANCEL/search');
    });

    it('should return the correct query parameters', () => {
        // Arrange
        const payload: IListSearchParams = {
            status: 'ACTIVE',
            sortBy: 'SORT_BY_LAST_MODIFIED_DATE',
            pageIndex: 1,
            pageSize: 25
        };

        // Act
        const result = searchService.getQueryParams(payload);

        // Assert
        expect(result).toEqual('status=active&sortBy=sort_by_last_modified_date&pageIndex=1&pageSize=25&');
    });

    it('should set enabledInstallmentFlag to true if checkPaymentAuxConfigsObj returns true', () => {
        // Arrange
        spyOn<PolicyMgmtSearchService, any>(searchService, 'checkPaymentAuxConfigsObj').and.returnValue(Promise.resolve(true));

        // Act
        const result = searchService.setEnableInstallment();

        // Assert
        expect(searchService.enabledInstallmentFlag).toBeTrue;
        expect(result).toBeTrue;
    });

    it('should set enabledInstallmentFlag to false if checkPaymentAuxConfigsObj returns false', () => {
        // Arrange
        spyOn<PolicyMgmtSearchService, any>(searchService, 'checkPaymentAuxConfigsObj').and.returnValue(Promise.resolve(false));

        // Act
        const result = searchService.setEnableInstallment();

        // Arrange
        expect(searchService.enabledInstallmentFlag).toBeFalse;
        expect(result).toBeFalse;
    });

    it('should set hideFilterPanel to false and call hideFilterPanelSubject.next', () => {
        // Act
        searchService.setFilterPanelToDefault();

        // Assert
        expect(searchService.hideFilterPanel).toBeFalse();
        expect(searchService.hideFilterPanelSubject.next).toBeTruthy();
    });

    it('should return correct deposit configuration url', () => {
        // Act
        const result = searchService.getSearchDepositConfigurationUrl();

        // Assert
        expect(result).toEqual('payment-deposit-rule');
    });

    it('should call property api url on setDeleteStatus method', () => {
        // Arrange
        const httpService: HTTPService = TestBed.inject(HTTPService);
        const httpResponse: HttpResponse<Object> = new HttpResponse();
        spyOn(httpService, 'put').and.returnValue(of(httpResponse));
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);

        // Act
        searchService.setDeleteStatus(paymentDepositRuleSoftDeleteRequest);

        // Assert
        expect(httpService.put)
        .toHaveBeenCalledWith(`hotels/1098/payment-deposit-rule/84508`, jasmine.any(Object),  API_CONTEXT_PATH.POLICY_MGMT);

    });

    afterAll(() => {
        TestBed.resetTestingModule();
    });
});
