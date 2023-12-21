import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed, async } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { APP_CONSTANT } from 'src/app/app.constant';
import { IChainInfo, IHTTPResponse, IHttpErrorResponse } from '../../../core/common.model';
import { ContextService } from '../../../core/context.service';
import { HTTPService } from '../../../core/http.service';
import { RulesMataDataService } from '../../../core/rules-meta-data.service';
import { SharedDataService } from '../../../core/shared.data.service';
import { PolicyMgmtUtilityService } from '../../../core/utility.service';
import { TcTranslateService } from 'tc-angular-services';
import { PolicyOverlapService } from './policy-overlap.service';
import { PolicyMgmtSearchPayloadService } from '../../../core/search-payload.service';
import { POLICY_LEVEL, POLICY_TYPE } from '../../../core/constants';
import { PolicyMgmtService } from '../../../policy-mgmt.service';
import { IOverlapPolicyInfo } from './policy-overlap.model';
import { IPolicyResponseModel } from '../policy-mgmt-create-policy.model';
import { IEMPolicySearchResponseModel, ISearchResponse } from '../../../search/policy-mgmt-search.model';

/**
 * AoT requires an exported function for factories
 *
 * @param http
 * @returns TranslateLoader
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

const chainInfo: IChainInfo = require('../../../../assets-policy-mgmt/data/chain-info.json');
const searchResponseChain: ISearchResponse =
    require('../../../../assets-policy-mgmt/data/policy/policy-overlap/search-response-chain.json');
const searchResponseChainCategory: ISearchResponse =
    require('../../../../assets-policy-mgmt/data/policy/policy-overlap/search-response-chain-category.json');
const searchResponseRateCategory: ISearchResponse =
    require('../../../../assets-policy-mgmt/data/policy/policy-overlap/search-response-rate-category.json');
const searchResponseRateCatalog: ISearchResponse =
    require('../../../../assets-policy-mgmt/data/policy/policy-overlap/search-response-rate-catalog.json');
const createResquestChain: IPolicyResponseModel =
    require('../../../../assets-policy-mgmt/data/policy/policy-overlap/create-request-chain.json');

class MockRulesMataDataService {
    getRuleTypeIdByRuleTypeDisplay() {
        return 14;
    }

    getRuleCriteriaMemberDataByRuleTypeId() {
        return [
            {
                ruleCriteriaMemberID: 1063,
                ruleCriteriaID: 1059,
                operatorTypeID: 1047,
                criteriaMemberDisplay: 'Hotel Id',
                formFieldType: null,
                criteriaMemberNames: 'HOTELID',
                helpText: 'For which hotel IDs this needs to be applied',
                operatorID: 18
            },
            {
                ruleCriteriaMemberID: 1064,
                ruleCriteriaID: 1060,
                operatorTypeID: 1048,
                criteriaMemberDisplay: 'Chain attribute value',
                formFieldType: null,
                criteriaMemberNames: 'CHAINATTRIBUTEVALUE',
                helpText: 'For which chain attribute values used for chain categories this needs to be applied',
                operatorID: 15
            },
            {
                ruleCriteriaMemberID: 1002,
                ruleCriteriaID: 1002,
                operatorTypeID: 1005,
                criteriaMemberDisplay: 'Travel dates',
                formFieldType: 'StayDateRangesYYYYMMDD',
                criteriaMemberNames: 'STAYDATESYYYYMMDD',
                helpText: 'Set dates guest can stay and blackout dates.',
                operatorID: 1004
            },
            {
                ruleCriteriaMemberID: 1020,
                ruleCriteriaID: 1020,
                operatorTypeID: 7,
                criteriaMemberDisplay: 'Day of week for stay dates',
                formFieldType: 'DOW Object',
                criteriaMemberNames: 'NIGHT DOW',
                helpText: 'Day of Week (Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday) applicable to the date of stay.',
                operatorID: 11
            }
        ];
    }

    getUniqueTypeIdByPolicyLevel(policyLevel: string) {
        if (policyLevel === 'ENTERPRISE') {
            return '3';
        } else if (policyLevel === 'RATECATALOG') {
            return '6';
        }
        else if (policyLevel === 'EMRATECATEGORY') {
            return '8';
        } else {
            return '3';
        }
    }

    getRuleDecisionTypeIdByRuleTypeId() {
        return '1017';
    }
}

class MockSharedDataService {
    getChainInfo() {
        chainInfo.categories = [
            {
                categoryId: '2418',
                categoryName: '11 Sept Category',
                status: 'ACTIVE',
                categoryGroups: [
                    {
                        categoryGroupId: '5173',
                        categoryGroupName: 'usd'
                    },
                    {
                        categoryGroupId: '10697',
                        categoryGroupName: 'LUX'
                    },
                ]
            }
        ];
        return chainInfo;
    }

    getPolicyMetadata(type): any {
        if (type === 'RateCategory') {
            return [{
                name: 'CORPORATE',
                id: '56002',
            },
            {
                name: 'CONSORTIA',
                id: '56013',
            },
            {
                name: 'CHANNEL MANAGEMENT',
                id: '56022',
            }];
        }
    }
}

class MockPolicyMgmtSearchPayloadService {
    getDowRuleCriteriaID() {
        return '1020';
    }

    getRuleDecisionTypeModifier() {
        return '1080';
    }
}

class MockPolicyMgmtService {
    getPolicyMetadata() {
        return of([{
            name: 'ENT RP Two Titan',
            id: '40040',
        },
        {
            name: 'Ent RP with CP catalog1',
            id: '40166',
        }]);
    }
}

class MockHttpService {
    response: IHTTPResponse;
    post(urlPath: string) {
        if (urlPath === 'enterprise/AAM/policy/CANCEL/search') {
            this.response = {
                status: 200,
                body: searchResponseChain
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

describe('Policy Overlap Service', () => {
    let policyOverlapService: PolicyOverlapService;
    let tcTranslateService: TcTranslateService;
    let translateService: TranslateService;
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
                    useClass: MockRulesMataDataService
                },
                {
                    provide: PolicyMgmtSearchPayloadService,
                    useClass: MockPolicyMgmtSearchPayloadService
                },
                PolicyOverlapService,
                ContextService,
                PolicyMgmtUtilityService,
                {
                    provide: PolicyMgmtService,
                    useClass: MockPolicyMgmtService
                }
            ]
        });

        policyOverlapService = TestBed.inject(PolicyOverlapService);
        tcTranslateService = TestBed.inject(TcTranslateService);
        translateService = TestBed.inject(TranslateService);
        contextService = TestBed.inject(ContextService);
        tcTranslateService.initTranslation(translateService);

        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setChainCode(chainInfo.chainCode);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
    }));

    it('Policy Overlap Service should be Initialized', () => {
        expect(policyOverlapService).toBeTruthy();
    });

    it('Should search policy overlap and return response in UI format for CHAIN', () => {
        // Act & Assert
        const policies = searchResponseChain.policies as IEMPolicySearchResponseModel[];
        policies[0].rules[0].ruleName = 'policy rule name no end date';
        policies[0].rules[0].ruleStartDate = '2029-12-27';
        policies[0].rules[0].ruleEndDate = null;
        policies[0].policyDateRange = '2029-12-27/';

        policyOverlapService.searchOverlapPolicies(createResquestChain).subscribe((data: Array<IOverlapPolicyInfo>) => {
            expect(data[0].id).toEqual('560');
            expect(data[0].name).toEqual('AAM');
            expect(data[0].policyName).toEqual('policy rule name no end date');
            expect(data[0].policyDateRange).toEqual('2029/12/27 - No End Date');
            expect(data[0].policyLevel).toEqual('CHAIN');
        });
    });

    it('Should fetch Overlap Policies Info by CHAIN CATEGORY level', () => {
        // Arrange
        const policies = searchResponseChainCategory.policies as IEMPolicySearchResponseModel[];
        policies[0].rules[0].ruleName = 'policy rule name no end date';
        policies[0].rules[0].ruleStartDate = '2029-12-27';
        policies[0].rules[0].ruleEndDate = null;
        policies[0].policyDateRange = '2029-12-27/';
        policies[1].rules[0].ruleName = 'policy rule name date range';
        policies[1].rules[0].ruleStartDate = '2029-12-27';
        policies[1].rules[0].ruleEndDate = '2030-12-27';
        policies[1].policyDateRange = '2029-12-27/2030-12-27';

        const expected = [
            {
                policyName: 'policy rule name no end date',
                ruleStartDate: '2029-12-27',
                ruleEndDate: null,
                id: '10697',
                policyDateRange: '2029/12/27 - No End Date',
                policyLevel: 'CHAIN_CATEGORIES',
                name: 'LUX',
                issue: 'Overlapping dates with active dated policy'
            },
            {
                policyName: 'policy rule name date range',
                ruleStartDate: '2029-12-27',
                ruleEndDate: '2030-12-27',
                id: '5173',
                policyDateRange: '2029/12/27 - 2030/12/27',
                policyLevel: 'CHAIN_CATEGORIES',
                name: 'usd',
                issue: 'Overlapping dates with active dated policy'
            }
        ];

        // Act
        const response = policyOverlapService.fetchOverlapPoliciesInfo(searchResponseChainCategory);

        // Assert
        expect(response).toEqual(expected);
    });

    it('Should fetch Overlap Policies Info by RATE CATEGORY level', () => {
        // Arrange
        const policies = searchResponseRateCategory.policies as IEMPolicySearchResponseModel[];
        policies[0].rules[0].ruleName = 'policy rule name1';
        policies[0].rules[0].ruleStartDate = '2029-12-27';
        policies[0].rules[0].ruleEndDate = null;
        policies[0].policyDateRange = '2029-12-27/';
        policies[0].rules[1].ruleName = 'policy rule name1';
        policies[0].rules[1].ruleStartDate = '2029-12-27';
        policies[0].rules[1].ruleEndDate = '2030-12-27';
        policies[0].policyDateRange = '2029-12-27/2030-12-27';

        const expected = [
            {
                policyName: 'policy rule name1',
                ruleStartDate: '2029-12-27',
                ruleEndDate: '2030-12-27',
                id: '56002',
                policyDateRange: '2029/12/27 - 2030/12/27',
                policyLevel: 'RATE_CATEGORIES',
                name: 'CORPORATE',
                issue: 'Overlapping dates with active dated policy'
            },
            {
                policyName: 'policy rule name1',
                ruleStartDate: '2029-12-27',
                ruleEndDate: '2030-12-27',
                id: '56013',
                policyDateRange: '2029/12/27 - 2030/12/27',
                policyLevel: 'RATE_CATEGORIES',
                name: 'CONSORTIA',
                issue: 'Overlapping dates with active dated policy'
            }
        ];

        // Act
        const response = policyOverlapService.fetchOverlapPoliciesInfo(searchResponseRateCategory);

        // Assert
        expect(response).toEqual(expected);
    });

    it('Should fetch Overlap Policies Info by RATE CATALOG level', () => {
        // Arrange
        const policies = searchResponseRateCatalog.policies as IEMPolicySearchResponseModel[];
        policies[0].rules[0].ruleName = 'policy rule name';
        policies[0].rules[0].ruleStartDate = '2029-12-27';
        policies[0].rules[0].ruleEndDate = '2030-12-27';
        policies[0].policyDateRange = '2029-12-27/2030-12-27';

        const expected = [
            {
                policyName: 'policy rule name',
                ruleStartDate: '2029-12-27',
                ruleEndDate: '2030-12-27',
                id: '40040',
                policyDateRange: '2029/12/27 - 2030/12/27',
                policyLevel: 'RATE_PLANS',
                name: 'ENT RP Two Titan',
                issue: 'Overlapping dates with active dated policy'
            }
        ];

        // Act
        const response = policyOverlapService.fetchOverlapPoliciesInfo(searchResponseRateCatalog);

        // Assert
        expect(response).toEqual(expected);
    });
});