import { IListSearchParams, ISearchEMTemplateParams } from '../search/policy-mgmt-search.model';
import { PolicyMgmtSearchPayloadService } from './search-payload.service';
import { TestBed, async } from '@angular/core/testing';
import { SharedDataService } from './shared.data.service';
import { RulesMataDataService } from './rules-meta-data.service';
import { ContextService } from './context.service';
import { FILTER_TYPE, MODIFIED_DATE, POLICY_TYPE, SORT_DIRECTION, DEFAULT_VALUES, POLICY_LEVEL } from './constants';
import { COMMON_OPTIONS, ENTERPRISE_POLICY_CREATION_LEVEL,
         ENTERPRISE_POLICY_LEVEL_FILTERS,
         FILTER_TYPE_OPTIONS,
         PROPERTY_POLICY_CREATION_LEVEL,
         STATUS_LIST } from './rules-config.constant';
import { SEARCH_SORT_DROPDOWN_OPTIONS, SEARCH_EM_SORT_OPTIONS } from '../search/policy-mgmt-search.constant';

const rulesMetaDataJson = require('../../assets-policy-mgmt/data/rulesData/rules-metadata-test-case.json');

class MockSharedDataService {
    getRulesMetaData() {
        return rulesMetaDataJson;
    }

    getHotelInfo() {
        return {
            hotelCode: 6938
        };
    }

    getChainInfo() {
        return {
            chainId: 6938
        };
    }
}

describe('Search Payload Service initialized', () => {
    let searchPayloadService: PolicyMgmtSearchPayloadService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
            ],
            providers: [
                PolicyMgmtSearchPayloadService,
                {
                    provide: SharedDataService,
                    useClass: MockSharedDataService
                },
                RulesMataDataService,
                ContextService
            ]
        });
        searchPayloadService = TestBed.get(PolicyMgmtSearchPayloadService);
    }));

    it('Should Create Mock PolicyMgmtSearchPayloadService ', () => {
        expect(searchPayloadService).toBeTruthy();
        expect(searchPayloadService.searchPayload).toBeTruthy();
    });

    it('expect resets search payload to default', () => {
        searchPayloadService.resetSearchPayload();
        expect(searchPayloadService.searchPayload).toBeTruthy();
    });

    it('Should returns intial value of search-payload', () => {
        const deafultSearchPayload: IListSearchParams = {
            sortBy: 'SORT_BY_LAST_MODIFIED_DATE',
            pageIndex: 1,
            pageSize: 25
        };
        expect(searchPayloadService.getSearchPayload()).toEqual(deafultSearchPayload);
    });

    it('Should set search payload', () => {
        const payload: IListSearchParams = {
            policyTemplateName: 'Tux1 Policy Template',
            cancellationNotice: 'SAME_DAY',
            acceptedTender: 0,
            status: 'ACTIVE',
            level: 'PROPERTY',
            sortBy: 'SORT_BY_LAST_MODIFIED_DATE',
            pageIndex: 1,
            pageSize: 25
        };

        searchPayloadService.setSearchPayload(payload);
        expect(searchPayloadService.getSearchPayload()).toEqual(payload);

        const newPayload: IListSearchParams = {
            cancellationNotice: 'SAME_DAY',
            acceptedTender: 0,
            status: 'ACTIVE',
            level: 'PROPERTY',
            sortBy: 'SORT_BY_LAST_MODIFIED_DATE',
            pageIndex: 1,
            pageSize: 25
        };
        searchPayloadService.setSearchPayload(newPayload);
        expect(searchPayloadService.getSearchPayload()).toEqual(newPayload);
    });

    it('should return policy search payload', () => {
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);
        const policySearchRequest = {
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
        const request = searchPayloadService.getPolicySearchPayload();
        expect(request.uxDateRangeRuleCriteriaID).toEqual(policySearchRequest.uxDateRangeRuleCriteriaID);
        expect(request.uxDowRuleCriteriaID).toEqual(policySearchRequest.uxDowRuleCriteriaID);
        expect(request.uxPolicyTemplateRuleDecisionTypeID).toEqual(policySearchRequest.uxPolicyTemplateRuleDecisionTypeID);
        expect(request.uxPolicyTypeRuleDecisionTypeModifierID).toEqual(policySearchRequest.uxPolicyTypeRuleDecisionTypeModifierID);
    });

    it('Should set Policy Search Payload', () => {
        const payload: IListSearchParams = {
            policyLevel: [PROPERTY_POLICY_CREATION_LEVEL.PROPERTY, PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY],
            policyName: 'Test',
            status: 'ACTIVE',
            sortBy: 'SORT_BY_LAST_MODIFIED_DATE',
            pageIndex: 1,
            pageSize: 25
        };

        searchPayloadService.setSearchPayload(payload);
        expect(searchPayloadService.getSearchPayload()).toEqual(payload);

        const newPayload: IListSearchParams = {
            policyLevel: [PROPERTY_POLICY_CREATION_LEVEL.PROPERTY, PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY],
            status: 'ACTIVE',
            sortBy: 'SORT_BY_LAST_MODIFIED_DATE',
            pageIndex: 1,
            pageSize: 25
        };
        searchPayloadService.setSearchPayload(newPayload);
        expect(searchPayloadService.getSearchPayload()).toEqual(newPayload);
    });

    it('Should set deposit configuration search payload', () => {
      const payload: IListSearchParams = {
          depositConfigurationName: 'Deposit Rule RQ1',
          status: 'ACTIVE',
          level: 'PROPERTY',
          sortBy: 'SORT_BY_LAST_MODIFIED_DATE',
          pageIndex: 1,
          pageSize: 25
      };

      searchPayloadService.setSearchPayload(payload);
      expect(searchPayloadService.getSearchPayload()).toEqual(payload);

      const newPayload: IListSearchParams = {
        depositConfigurationName: 'Deposit Rule RQ2',
        status: 'ACTIVE',
        level: 'PROPERTY',
        sortBy: 'SORT_BY_NAME_A_Z',
        pageIndex: 1,
        pageSize: 25
    };

      searchPayloadService.setSearchPayload(newPayload);
      expect(searchPayloadService.getSearchPayload()).toEqual(newPayload);
    });

    it('Should return enterprise search parameter', () => {
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);
        const emPolicySearchPayload = {
            search: {
                searchRequest: {
                    searchParameters: [
                        {
                            ruleTypeID: 14,
                            uniqueTypeID: '3',
                            uniqueID: '6938'
                        },
                        {
                            ruleTypeID: 14,
                            uniqueTypeID: '6',
                            hotelID: '6938'
                        },
                        {
                            ruleTypeID: 14,
                            uniqueTypeID: '9',
                            hotelID: '6938'
                        }
                    ]
                },
                searchFilters: {}
            },
            dateRangeRuleCriteriaID: '1002',
            dowRuleCriteriaID: '1020',
            policyTemplateRuleDecisionTypeID: '1024',
            policyTypeRuleDecisionTypeModifierID: '1091'
        };
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();
        expect(resultPayload.dateRangeRuleCriteriaID).toEqual(emPolicySearchPayload.dateRangeRuleCriteriaID);
        expect(resultPayload.dowRuleCriteriaID).toEqual(emPolicySearchPayload.dowRuleCriteriaID);
        expect(resultPayload.policyTemplateRuleDecisionTypeID).toEqual(emPolicySearchPayload.policyTemplateRuleDecisionTypeID);
        expect(resultPayload.policyTypeRuleDecisionTypeModifierID).toEqual(emPolicySearchPayload.policyTypeRuleDecisionTypeModifierID);

        expect(resultPayload.search.searchRequest.searchParameters[0].ruleTypeID)
            .toEqual(emPolicySearchPayload.search.searchRequest.searchParameters[0].ruleTypeID);
        expect(resultPayload.search.searchRequest.searchParameters[0].uniqueTypeID)
            .toEqual(emPolicySearchPayload.search.searchRequest.searchParameters[0].uniqueTypeID);
        expect(resultPayload.search.searchRequest.searchParameters[0].uniqueID)
            .toEqual(emPolicySearchPayload.search.searchRequest.searchParameters[0].uniqueID);

        expect(resultPayload.search.searchRequest.searchParameters[1].ruleTypeID)
            .toEqual(emPolicySearchPayload.search.searchRequest.searchParameters[1].ruleTypeID);
        expect(resultPayload.search.searchRequest.searchParameters[1].uniqueTypeID)
            .toEqual(emPolicySearchPayload.search.searchRequest.searchParameters[1].uniqueTypeID);
        expect(resultPayload.search.searchRequest.searchParameters[1].uniqueID)
            .toEqual(emPolicySearchPayload.search.searchRequest.searchParameters[1].uniqueID);

        expect(resultPayload.search.searchRequest.searchParameters[2].ruleTypeID)
            .toEqual(emPolicySearchPayload.search.searchRequest.searchParameters[2].ruleTypeID);
        expect(resultPayload.search.searchRequest.searchParameters[2].uniqueTypeID)
            .toEqual(emPolicySearchPayload.search.searchRequest.searchParameters[2].uniqueTypeID);
        expect(resultPayload.search.searchRequest.searchParameters[2].uniqueID)
            .toEqual(emPolicySearchPayload.search.searchRequest.searchParameters[2].uniqueID);
    });

    it('should set sortModel for ascending on getEnterprisePolicySearchPayload', () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);
        searchPayloadService.setSearchPayload({ sortBy: SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE_ASCENDING });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.sortModel[0].fieldName).toBe(MODIFIED_DATE);
        expect(resultPayload.searchFilters.sortModel[0].sortType).toBe(SORT_DIRECTION.Ascending);
    });

    it('should set sortModel for descending on getEnterprisePolicySearchPayload', () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);
        searchPayloadService.setSearchPayload({ sortBy: SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE_DESCENDING });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.sortModel[0].fieldName).toBe(MODIFIED_DATE);
        expect(resultPayload.searchFilters.sortModel[0].sortType).toBe(SORT_DIRECTION.Descending);
    });

    it('should set sortModel to null when sortBy not set correctly on getEnterprisePolicySearchPayload', () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);
        searchPayloadService.setSearchPayload({ sortBy: 'something' });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.sortModel).toBeNull();
    });

    it('should set pagination on getEnterprisePolicySearchPayload when it is set in searchPayload', () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);
        searchPayloadService.setSearchPayload({ pageSize: 10, pageIndex: 20 });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.maxEntries).toBe(10);
        expect(resultPayload.searchFilters.offset).toBe(19);
    });

    it('should not set pagination on getEnterprisePolicySearchPayload when maxEntries or offset is empty in seachPayload', () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);
        searchPayloadService.setSearchPayload({ pageSize: null, pageIndex: 20 });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.maxEntries).toBeUndefined();
        expect(resultPayload.searchFilters.offset).toBeUndefined();
    });

    it('should note set filterModels when not set in searchPayload on getEnterprisePolicySearchPayload', () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);
        searchPayloadService.setSearchPayload({});

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.filterModel.policyName).toBeUndefined();
        expect(resultPayload.searchFilters.filterModel.emPolicyTemplateId).toBeUndefined();
        expect(resultPayload.searchFilters.filterModel.status).toBeUndefined();
        expect(resultPayload.searchFilters.filterModel.dateRange).toBeUndefined();
        expect(resultPayload.searchFilters.filterModel.policyDistribution).toBeUndefined();
    });

    it('should set filterModel.policyNameFilter when set in searchPayload on getEnterprisePolicySearchPayload', () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);

        const expectedFilter = {
            filterType: FILTER_TYPE.EQUAL,
            value: 'test',
            valueTo: '',
            values: []
        };
        searchPayloadService.setSearchPayload({ policyName: expectedFilter.value });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.filterModel.policyName).toEqual(expectedFilter);
    });

    it('should set filterModel.emPolicyTemplateId when set in searchPayload on getEnterprisePolicySearchPayload', () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);

        const expectedFilter = {
            filterType: FILTER_TYPE.EQUAL,
            value: '1222',
            valueTo: '',
            values: []
        };
        searchPayloadService.setSearchPayload({ policyTemplateId: expectedFilter.value });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.filterModel.emPolicyTemplateId).toEqual(expectedFilter);
    });

    it('should set filterModel.status when set in searchPayload on getEnterprisePolicySearchPayload - Active value', () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);

        const expectedFilter = {
            filterType: FILTER_TYPE.INNERSET,
            value: 'ACTIVE',
            valueTo: '',
            values: []
        };
        searchPayloadService.setSearchPayload({ status: expectedFilter.value });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.filterModel.status).toEqual(expectedFilter);
    });

    it('should set filterModel.status when set in searchPayload on getEnterprisePolicySearchPayload - date value', () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);

        const expectedFilter = {
            filterType: FILTER_TYPE.INNERSET,
            value: '2022-03-04/2022-05-06',
            valueTo: '',
            values: []
        };
        searchPayloadService.setSearchPayload({ startDate: '2022-03-04', endDate: '2022-05-06' });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.filterModel.dateRange).toEqual(expectedFilter);
    });

    it(`should set filterModel.policyDistribution for chainCategories when policyLevel is chain_categories
        on getEnterprisePolicySearchPayload`, () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);

        const expectedFilter = {
            filterType: FILTER_TYPE.EQUAL,
            value: ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES,
            valueTo: '',
            values: ['123', '456']
        };
        searchPayloadService.setSearchPayload({
            policyLevel: [ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES],
            chainCategories: expectedFilter.values
        });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.filterModel.policyDistribution).toEqual(expectedFilter);
    });

    it(`should set filterModel.policyDistribution for ratePlans when policyLevel is rate_plans
        on getEnterprisePolicySearchPayload`, () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);

        const expectedFilter = {
            filterType: FILTER_TYPE.EQUAL,
            value: ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS,
            valueTo: '',
            values: ['123', '456']
        };
        searchPayloadService.setSearchPayload({
            policyLevel: [ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS],
            ratePlan: expectedFilter.values
        });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.filterModel.policyDistribution).toEqual(expectedFilter);
    });

    it(`should set filterModel.policyDistribution for rateCategories when policyLevel is rate_categories
        on getEnterprisePolicySearchPayload`, () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);

        const expectedFilter = {
            filterType: FILTER_TYPE.EQUAL,
            value: ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES,
            valueTo: '',
            values: ['123', '456']
        };
        searchPayloadService.setSearchPayload({
            policyLevel: [ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES],
            rateCategory: expectedFilter.values
        });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.filterModel.policyDistribution).toEqual(expectedFilter);
    });

    it(`should set filterModel.policyDistribution for chain when policyLevel is chain
        on getEnterprisePolicySearchPayload`, () => {
        // arrange
        const spyContextService: ContextService = TestBed.inject(ContextService);
        spyOnProperty(spyContextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);

        const expectedFilter = {
            filterType: FILTER_TYPE.EQUAL,
            value: ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN,
            valueTo: '',
            values: []
        };
        searchPayloadService.setSearchPayload({
            policyLevel: [ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN],
            rateCategory: []
        });

        // act
        const resultPayload = searchPayloadService.getEnterprisePolicySearchPayload();

        // assert
        expect(resultPayload.searchFilters.filterModel.policyDistribution).toEqual(expectedFilter);
    });

    it('Should set deposit configuration for property', () => {
      //Arange
      const spyContextService: ContextService = TestBed.inject(ContextService);
      spyOnProperty(spyContextService, 'policyLevel', 'get').and.returnValue(POLICY_LEVEL.PROPERTY);

      //Act
      const result = searchPayloadService.getDepositConfigurationPayload();

      //Assert
      expect(result.sortModel[0].fieldName).toEqual('NAME');
      expect(result.sortModel[0].sortType).toEqual('D');
    });


    it('Should set deposit configuration for property with correct order', () => {
      //Arange
      const spyContextService: ContextService = TestBed.inject(ContextService);
      spyOnProperty(spyContextService, 'policyLevel', 'get').and.returnValue(POLICY_LEVEL.PROPERTY);
      searchPayloadService.searchPayload.sortBy = SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_NAME_A_Z;

      //Act
      const result = searchPayloadService.getDepositConfigurationPayload();

      //Assert
      expect(result.sortModel[0].sortType).toEqual('A');
    });

    describe('Search Enterprise Templates Payload Service initialized', () => {
        it('Should Create Mock PolicyMgmtSearchPayloadService ', () => {
            // Assert
            expect(searchPayloadService).toBeTruthy();
            expect(searchPayloadService.searchEMPayload).toBeTruthy();
        });

        it('expect resets search payload to default', () => {
            // Act
            searchPayloadService.resetSearchPayload();

            // Assert
            expect(searchPayloadService.searchEMPayload).toBeTruthy();
        });

        it('Should returns intial value of search enterprise templates payload', () => {
            // Arrange
            const defaultEMPayload: ISearchEMTemplateParams = {
                offSet: 1,
                maxEntries: 25,
                filterModel: {
                    status: {
                        filterType: FILTER_TYPE_OPTIONS.EQUAL,
                        value: COMMON_OPTIONS.ALL,
                    }
                },
                sortModel: [
                    {
                        fieldName: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_FIELD_NAME,
                        sortType: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_DESC_SORT_TYPE
                    }
                ]
            };

            // Act & Assert
            expect(searchPayloadService.getSearchEMPayload()).toEqual(defaultEMPayload);
        });

        it('should set search enterprise templates payload', () => {
            // Arrange
            const emPayload: ISearchEMTemplateParams = {
                offSet: 1,
                maxEntries: 25,
                filterModel: {
                    status: {
                        filterType: FILTER_TYPE_OPTIONS.EQUAL,
                        value: COMMON_OPTIONS.ALL,
                    }
                },
                sortModel: [
                    {
                        fieldName: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_FIELD_NAME,
                        sortType: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_DESC_SORT_TYPE
                    }
                ]
            };

            const newEMPayload: ISearchEMTemplateParams = {
                offSet: 26,
                maxEntries: 25,
                filterModel: {
                    status: {
                        filterType: FILTER_TYPE_OPTIONS.EQUAL,
                        value: STATUS_LIST.ACTIVE,
                    }
                },
                sortModel: [
                    {
                        fieldName: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_FIELD_NAME,
                        sortType: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_ASC_SORT_TYPE
                    }
                ]
            };

            // Act & Assert
            searchPayloadService.setSearchEMPayload(emPayload);
            expect(searchPayloadService.getSearchEMPayload()).toEqual(emPayload);

            searchPayloadService.setSearchEMPayload(newEMPayload);
            expect(searchPayloadService.getSearchEMPayload()).toEqual(newEMPayload);
        });
    });
});

