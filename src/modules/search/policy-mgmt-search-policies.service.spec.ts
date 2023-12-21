import { PolicyMgmtSearchPolicyService } from './policy-mgmt-search-policies.service';
import { TestBed, async } from '@angular/core/testing';
import { STATUS_LIST, PROPERTY_POLICY_CREATION_LEVEL } from '../core/rules-config.constant';
import { IListSearchParams, IPolicySearchRepsonseModel, ISearchResponse } from './policy-mgmt-search.model';
import { POLICY_LEVEL } from '../core/constants';
import { DEFAULT_DATED_POLICY_TYPE } from '../core/rules.constant';
import { PolicyMgmtUtilityService } from '../core/utility.service';
import { TcTranslateService } from 'tc-angular-services';
import { SharedDataService } from '../core/shared.data.service';

const searchPolicyResponse: ISearchResponse = require('../../assets-policy-mgmt/data/policy/search/cancellation.json');

describe('PolicyMgmtSearchPolicyService Initialized', () => {
    let policyMgmtSearchPolicyService: PolicyMgmtSearchPolicyService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                PolicyMgmtSearchPolicyService,
                PolicyMgmtUtilityService,
                TcTranslateService,
                SharedDataService
            ]
        });

        policyMgmtSearchPolicyService = TestBed.get(PolicyMgmtSearchPolicyService);
    }));
    it('should Initialize List Service', () => {
        expect(policyMgmtSearchPolicyService).toBeDefined();
        expect(policyMgmtSearchPolicyService).toBeTruthy();
    });

    it('Should call setPolicySearchData', () => {
        const obj: IPolicySearchRepsonseModel = {
            uxGroupName: 'Test Policy',
            uxpolicyTemplateName: '6PM Day of Arrival',
            uxPolicyTemplateId: '12345',
            uxpolicyTemplateCode: 'Arrival',
            uxPolicyType: DEFAULT_DATED_POLICY_TYPE.default,
            uxPolicyDateRange: '2018-05-11/2018-05-24,2018-05-27/2018-06-05',
            uxPolicyStatus: STATUS_LIST.ACTIVE,
            uxPolicyLevel: POLICY_LEVEL.PROPERTY,
            uxRatePlanIds: ['101'],
            uxRateCategoryIds: ['1010'],
            uxDOW: 'MON,TUE',
            uxRank: '1',
            rules: [],
            uxRateCatalogs: []
        };
        const data = JSON.parse(JSON.stringify(searchPolicyResponse.policies));
        data[0] = obj;
        policyMgmtSearchPolicyService.setPolicySearchData(data);
        expect(policyMgmtSearchPolicyService.policySearchData[0].uxGroupName).toEqual('Test Policy');
        expect(policyMgmtSearchPolicyService.policySearchData[0].uxPolicyStatus).toEqual(STATUS_LIST.ACTIVE);
        expect(policyMgmtSearchPolicyService.policySearchData[0].uxPolicyLevel).toEqual(POLICY_LEVEL.PROPERTY);
        expect(policyMgmtSearchPolicyService.policySearchData[0].uxPolicyType).toEqual(DEFAULT_DATED_POLICY_TYPE.default);
    });

    it('Should call getPolicySearchData', () => {
        const obj: IPolicySearchRepsonseModel = {
            uxGroupName: 'Test Policy',
            uxpolicyTemplateName: '6PM Day of Arrival',
            uxPolicyTemplateId: '12345',
            uxpolicyTemplateCode: 'Arrival',
            uxPolicyType: DEFAULT_DATED_POLICY_TYPE.default,
            uxPolicyDateRange: '2018-05-11/2018-05-24,2018-05-27/2018-06-05',
            uxPolicyStatus: STATUS_LIST.ACTIVE,
            uxPolicyLevel: POLICY_LEVEL.PROPERTY,
            uxRatePlanIds: ['101'],
            uxRateCategoryIds: ['1010'],
            uxDOW: 'MON,TUE',
            uxRank: '1',
            rules: [],
            uxRateCatalogs: []
        };
        const data = JSON.parse(JSON.stringify(searchPolicyResponse.policies));
        data[0] = obj;
        policyMgmtSearchPolicyService.policySearchData = data;
        const result = policyMgmtSearchPolicyService.getPolicySearchData();
        expect(result[0].uxGroupName).toEqual('Test Policy');
        expect(result[0].uxPolicyStatus).toEqual(STATUS_LIST.ACTIVE);
        expect(result[0].uxPolicyLevel).toEqual(POLICY_LEVEL.PROPERTY);
        expect(result[0].uxPolicyType).toEqual(DEFAULT_DATED_POLICY_TYPE.default);
    });

    it('Should call getFilteredSearchData for PROPERTY Policy Level', () => {
        const obj: IPolicySearchRepsonseModel = {
            uxGroupName: 'Test Policy',
            uxpolicyTemplateName: '6PM Day of Arrival',
            uxpolicyTemplateCode: 'Arrival',
            uxPolicyTemplateId: '1229488',
            uxPolicyType: DEFAULT_DATED_POLICY_TYPE.dated,
            uxPolicyDateRange: '2020-07-11/2020-07-24,2020-07-26/2020-07-30',
            uxPolicyStatus: STATUS_LIST.ACTIVE,
            uxPolicyLevel: PROPERTY_POLICY_CREATION_LEVEL.PROPERTY,
            uxRatePlanIds: null,
            uxRateCategoryIds: null,
            uxDOW: 'MON,TUE',
            uxRank: '1',
            rules: [],
            uxRateCatalogs: []
        };
        const data = JSON.parse(JSON.stringify(searchPolicyResponse.policies));
        data[0] = obj;
        policyMgmtSearchPolicyService.policySearchData = data;
        const params: IListSearchParams = {
            policyLevel: [PROPERTY_POLICY_CREATION_LEVEL.PROPERTY],
            status: STATUS_LIST.ACTIVE,
            policyName: 'Test',
            policyTemplateId: '1229488',
            startDate: '2020-07-24',
            pageIndex: 1
        };
        const result = policyMgmtSearchPolicyService.getFilteredSearchData(params);
        expect(result[0].uxGroupName).toEqual('Test Policy');
        expect(result[0].uxPolicyStatus).toEqual(STATUS_LIST.ACTIVE);
        expect(result[0].uxPolicyLevel).toEqual(PROPERTY_POLICY_CREATION_LEVEL.PROPERTY);
        expect(result[0].uxPolicyType).toEqual(DEFAULT_DATED_POLICY_TYPE.dated);
    });

    it('Should call getFilteredSearchData for RATECATEGORY Policy Level', () => {
        const obj: IPolicySearchRepsonseModel = {
            uxGroupName: 'Test Policy',
            uxpolicyTemplateName: '6PM Day of Arrival',
            uxpolicyTemplateCode: 'Arrival',
            uxPolicyTemplateId: '1229488',
            uxPolicyType: DEFAULT_DATED_POLICY_TYPE.dated,
            uxPolicyDateRange: '2020-07-11/2020-07-24,2020-07-26/2020-07-30',
            uxPolicyStatus: STATUS_LIST.ACTIVE,
            uxPolicyLevel: PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY,
            uxRatePlanIds: null,
            uxRateCategoryIds: ['101'],
            uxDOW: 'MON,TUE',
            uxRank: '1',
            rules: [],
            uxRateCatalogs: []
        };
        const data = JSON.parse(JSON.stringify(searchPolicyResponse.policies));
        data[0] = obj;
        policyMgmtSearchPolicyService.policySearchData = data;
        const params: IListSearchParams = {
            policyLevel: [PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY],
            status: STATUS_LIST.ACTIVE,
            endDate: '2020-07-24',
            rateCategory: ['101', '693802'],
            pageIndex: 1
        };
        const result = policyMgmtSearchPolicyService.getFilteredSearchData(params);
        expect(result[0].uxGroupName).toEqual('Test Policy');
        expect(result[0].uxPolicyStatus).toEqual(STATUS_LIST.ACTIVE);
        expect(result[0].uxPolicyLevel).toEqual(PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY);
        expect(result[0].uxPolicyType).toEqual(DEFAULT_DATED_POLICY_TYPE.dated);
    });
    it('Should call getFilteredSearchData for RATEPLAN Policy Level', () => {
        const obj: IPolicySearchRepsonseModel = {
            uxGroupName: 'Test Policy',
            uxpolicyTemplateName: '6PM Day of Arrival',
            uxpolicyTemplateCode: 'Arrival',
            uxPolicyTemplateId: '1229488',
            uxPolicyType: DEFAULT_DATED_POLICY_TYPE.dated,
            uxPolicyDateRange: '2020-07-11/2020-07-24,2020-07-26/2020-07-30',
            uxPolicyStatus: STATUS_LIST.ACTIVE,
            uxPolicyLevel: PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN,
            uxRatePlanIds: ['101'],
            uxRateCategoryIds: null,
            uxDOW: 'MON,TUE',
            uxRank: '1',
            rules: [],
            uxRateCatalogs: []
        };
        const data = JSON.parse(JSON.stringify(searchPolicyResponse.policies));
        data[0] = obj;
        policyMgmtSearchPolicyService.policySearchData = data;
        const params: IListSearchParams = {
            policyLevel: [PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN],
            status: STATUS_LIST.ACTIVE,
            startDate: '2020-07-10',
            endDate: '2020-07-24',
            ratePlan: ['101', '3601461'],
            pageIndex: 1
        };
        const result = policyMgmtSearchPolicyService.getFilteredSearchData(params);
        expect(result[0].uxGroupName).toEqual('Test Policy');
        expect(result[0].uxPolicyStatus).toEqual(STATUS_LIST.ACTIVE);
        expect(result[0].uxPolicyLevel).toEqual(PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN);
        expect(result[0].uxPolicyType).toEqual(DEFAULT_DATED_POLICY_TYPE.dated);
    });
});
