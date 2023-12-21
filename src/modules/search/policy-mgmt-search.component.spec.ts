import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { PolicyMgmtSearchComponent } from './policy-mgmt-search.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TcTranslateService } from 'tc-angular-services';
import { searchRoutes } from './policy-mgmt-search.routing';
import { APP_CONSTANT } from '../../app/app.constant';
import { HTTPService } from '../core/http.service';
import { RouteStateService } from '../core/route.state.service';
import { ContextService } from '../core/context.service';
import { PolicyMgmtService } from '../policy-mgmt.service';
import { PolicyMgmtSearchService } from './policy-mgmt-search.service';
import { PolicyMgmtSearchPayloadService } from '../core/search-payload.service';
import { CONFIG_TYPE, POLICY_FLOW, POLICY_TYPE, DEFAULT_VALUES, POLICY_LEVEL, POST_MESSAGE } from '../core/constants';
import { TranslationMap } from '../core/translation.constant';
import {
  SORT_DROPDOWN,
  SEARCH_SORT_DROPDOWN_OPTIONS,
  POLICY_LIST_TABS,
  SEARCH_EM_SORT_OPTIONS,
  SEARCH_PORPERTY_SORT_OPTIONS
} from './policy-mgmt-search.constant';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule, MultilevelDropdownModule, DatePickerModule } from 'tc-angular-components';
import { FilterComponent } from './filter/filter.component';
import { ListComponent } from './list/list.component';
import { SharedDataService } from '../core/shared.data.service';
import {
  IListSearchParams,
  ISearchResponse,
  IPolicySearchRepsonseModel,
  ISearchEMTemplateParams,
  ISearchEMResponse
} from './policy-mgmt-search.model';
import { throwError, from, Subject, ReplaySubject, of } from 'rxjs';
import { IHttpErrorResponse } from '../core/common.model';
import { Router, ActivatedRoute, RouterEvent } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PolicyMgmtSearchPolicyService } from './policy-mgmt-search-policies.service';
import { STATUS_LIST, PROPERTY_POLICY_CREATION_LEVEL, FILTER_TYPE_OPTIONS } from '../core/rules-config.constant';
import { PolicyMgmtListDetailsModalComponent } from './list/list-details-modal/policy-mgmt-list-details-modal.component';
import { RulesMataDataService } from '../core/rules-meta-data.service';
import { SharedModule } from '../common/shared.module';
import { PolicyMgmtUtilityService } from '../core/utility.service';
import { PolicyMgmtCreateTemplateService } from '../create/template/policy-mgmt-create-template.service';
import { PolicyMgmtSearchExportService } from './policy-mgmt-search-export.service';

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

const searchEMTemplateResponse: ISearchEMResponse =
  require('../../assets-policy-mgmt/data/enterprise-policy-templates/search/searchEMCancellationList.json');
const searchTemplateResponse: ISearchResponse = require('../../assets-policy-mgmt/data/policy-template/search/cancellation.json');
const searchPolicyResponse: ISearchResponse = require('../../assets-policy-mgmt/data/policy/search/cancellation.json');
const searchDepositConfResponse: ISearchResponse = require('../../assets-policy-mgmt/data/payment-deposit-rule/search/search.json');
const searchPropertyDepositConfResponse: ISearchResponse =
require('../../assets-policy-mgmt/data/payment-deposit-rule/search/searchProperty.json');

const globalPayload = {
  listResponse: true,
  configType: '',
  policyLevel: POLICY_LEVEL.ENTERPRISE
};

class MockPolicyMgmtSearchService {
  hideFilterPanelSubject = new Subject<boolean>();
  searchPolicies() {
    if (globalPayload.listResponse) {
      if (globalPayload.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
        return of(searchDepositConfResponse);
      } else if (globalPayload.configType === CONFIG_TYPE.TEMPLATE) {
        if (globalPayload.policyLevel === POLICY_LEVEL.ENTERPRISE) {
          return of(searchEMTemplateResponse);
        } else {
          return of(searchTemplateResponse);
        }
      } else {
        return of(searchPolicyResponse);
      }
    } else {
      const errorObject: IHttpErrorResponse = {
        status: 404,
        statusText: 'NOT_FOUND',
        error: {}
      };
      return throwError(() => errorObject);
    }
  }

  translateTabList(data) {
    return data;
  }
  toggleHideFilterSubject() {
    this.hideFilterPanelSubject.next(false);
  }
  setFilterPanelToDefault() {
  }
  searchDepositConfiguration() {

  }
}

class MockPolicyMgmtService {
  loadGlobalData() {
    return Promise.resolve({});
  }
  makePolicyMetadataAPICalls() {
    return Promise.resolve({});
  }
}

describe('Search Component', () => {
  let fixture: ComponentFixture<PolicyMgmtSearchComponent>;
  let instance: PolicyMgmtSearchComponent;
  let tcTranslateService: TcTranslateService;
  let translateService: TranslateService;
  let policyMgmtService: PolicyMgmtService;
  let policyMgmtSearchService: PolicyMgmtSearchService;
  let contextService: ContextService;
  let activateRoute: ActivatedRoute;

  const spySearchPayloadService: PolicyMgmtSearchPayloadService = jasmine.createSpyObj('PolicyMgmtSearchPayloadService', [
    'resetSearchPayload', 'setSearchPayload', 'getSearchPayload', 'getSearchEMPayload', 'setSearchEMPayload'
  ]);

  const spyPolicyMgmtSearchPolicyService = jasmine.createSpyObj('PolicyMgmtSearchPolicyService', [
    'getFilteredSearchData', 'setPolicySearchData', 'getPolicySearchData']);
  
  const spyPolicyMgmtSearchExportService = jasmine.createSpyObj('PolicyMgmtSearchExportService', ['searchAndExport']);

  window['CONFIG'] = {
    tokenDecodedData: APP_CONSTANT.config.tokenDecodedData,
    apiUrl: APP_CONSTANT.config.apiUrl
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PolicyMgmtSearchComponent,
        FilterComponent,
        ListComponent,
        PolicyMgmtListDetailsModalComponent
      ],
      imports: [
        CommonModule,
        SharedModule,
        HttpClientModule,
        NgbModule,
        FormsModule,
        DropdownModule,
        MultilevelDropdownModule,
        DatePickerModule,
        RouterTestingModule.withRoutes(searchRoutes),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        TranslateService,
        TcTranslateService,
        HTTPService,
        RouteStateService,
        ContextService,
        {
          provide: PolicyMgmtSearchPolicyService,
          useValue: spyPolicyMgmtSearchPolicyService
        },
        {
          provide: PolicyMgmtService,
          useClass: MockPolicyMgmtService
        },
        {
          provide: PolicyMgmtSearchService,
          useClass: MockPolicyMgmtSearchService
        },
        {
          provide: PolicyMgmtSearchPayloadService,
          useValue: spySearchPayloadService
        },
        RulesMataDataService,
        SharedDataService,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{ policyType: POLICY_TYPE.CANCELLATION }]),
            queryParams: from([{ ratePlanId: null }])
          }
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        PolicyMgmtUtilityService,
        PolicyMgmtCreateTemplateService,
        {
          provide: PolicyMgmtSearchExportService,
          useValue: spyPolicyMgmtSearchExportService
        }
      ]
    }).compileComponents()
      .then(() => {
        tcTranslateService = TestBed.get(TcTranslateService);
        translateService = TestBed.get(TranslateService);
        tcTranslateService.initTranslation(translateService);
        policyMgmtService = TestBed.get(PolicyMgmtService);
        policyMgmtSearchService = TestBed.inject(PolicyMgmtSearchService);
        contextService = TestBed.get(ContextService);
        activateRoute = TestBed.get(ActivatedRoute);
        fixture = TestBed.createComponent(PolicyMgmtSearchComponent);
        instance = fixture.componentInstance;
        instance.configType = CONFIG_TYPE;
        instance.policyFlow = POLICY_FLOW;
        instance.componentInitialized = false;
        instance.translationMap = TranslationMap;
        instance.translationMap = SORT_DROPDOWN;
        instance.activeTab = POLICY_TYPE.CANCELLATION;
        activateRoute.params.subscribe();
        policyMgmtSearchService.hideFilterPanelSubject.subscribe();
        instance.hideFilterPanel = false;
      });
  }));

  it('should initialize SEARCH-COMPONENT', () => {
    expect(instance).toBeDefined();
    expect(instance).toBeTruthy();
  });

  describe('For Template', () => {
    it('should set Active Tab, from activateRoute', () => {
      activateRoute.params.subscribe(param => {
        expect(param.policyType).toBe(POLICY_TYPE.CANCELLATION);
      });
    });

    it('should set hideFilter panel boolean', () => {
      policyMgmtSearchService.hideFilterPanelSubject.next(true);
      policyMgmtSearchService.hideFilterPanelSubject.subscribe(flag => {
        instance.hideFilterPanel = flag;
      });
      expect(instance.hideFilterPanel).toEqual(true);
    });

    it('should call toogleFilter to show-hide filter section', () => {
      policyMgmtSearchService.hideFilterPanelSubject.next(true);
      instance.toggleFilters();
      policyMgmtSearchService.hideFilterPanelSubject.subscribe(flag => {
        instance.hideFilterPanel = flag;
        expect(instance.hideFilterPanel).toEqual(false);
      });
    });

    it('should reset search payload and set policy type - on Tab Change', () => {
      instance.onTabChange({ nextId: POLICY_TYPE.GUARANTEE });
      expect(spySearchPayloadService.resetSearchPayload).toHaveBeenCalled();
    });

    it('should return search list data on Search API call', () => {
      const params: IListSearchParams = {
        cancellationNotice: 'ALL',
        status: STATUS_LIST.ACTIVE,
        level: POLICY_LEVEL.PROPERTY,
        pageIndex: 1
      };
      globalPayload.listResponse = true;
      globalPayload.configType = CONFIG_TYPE.TEMPLATE;
      globalPayload.policyLevel = POLICY_LEVEL.PROPERTY;
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      spySearchPayloadService.setSearchPayload(params);
      spyPolicyMgmtSearchPolicyService.getPolicySearchData.and.returnValue([]);

      instance.onSearchClicked(params);
      expect(spySearchPayloadService.setSearchPayload).toHaveBeenCalledWith(params);
      expect(instance.searchListData.length).toBeTruthy();
      expect(instance.paginationObj).toBeDefined();
    });

    it('should return empty array response on Search API call - 404', () => {
      const params: IListSearchParams = {
        cancellationNotice: 'ALL',
        status: STATUS_LIST.ACTIVE,
        level: POLICY_LEVEL.PROPERTY
      };
      globalPayload.listResponse = false;
      globalPayload.configType = CONFIG_TYPE.TEMPLATE;
      spySearchPayloadService.setSearchPayload(params);
      spyPolicyMgmtSearchPolicyService.getPolicySearchData.and.returnValue([]);

      instance.onSearchClicked(params);
      expect(spySearchPayloadService.setSearchPayload).toHaveBeenCalledWith(params);
      expect(instance.searchListData.length).toBeFalsy();
    });

    it('should set navigation to sepcified route for create template', () => {
      const configType = CONFIG_TYPE.TEMPLATE;
      const policyFlow = POLICY_FLOW.CREATE;
      contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
      instance.goToSpecifiedRoute(configType, policyFlow);
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should set navigation to sepcified route for edit template', () => {
      const configType = CONFIG_TYPE.TEMPLATE;
      const policyFlow = POLICY_FLOW.EDIT;
      contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
      instance.goToSpecifiedRoute(configType, policyFlow);
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should set navigation to sepcified route for search deposit cofigurations', () => {
      const obj = { code: POST_MESSAGE.depositConfiguration, redirect: false };
      spyOn(window.parent, 'postMessage');
      const configType = CONFIG_TYPE.DEPOSIT_CONFIGURATION;
      const policyFlow = POLICY_FLOW.SEARCH;
      contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
      instance.goToSpecifiedRoute(configType, policyFlow);
      expect(window.parent.postMessage).toHaveBeenCalledWith(JSON.stringify(obj), '*' as unknown as any);
    });

    it('should return sort order ascending', () => {
      let sortOrder = instance.getSortOrder(translateService.instant(TranslationMap[SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_NAME_A_Z]));
      expect(sortOrder).toBe('A');
    });

    it('should return sort order descending', () => {
        let sortOrder = instance.getSortOrder(translateService.instant(TranslationMap[SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_NAME_Z_A]));
        expect(sortOrder).toBe('D');
    });

    it('Should display Tootltip when hovered Hide Filters/Show Filters', () => {
      const event = {
        target: {
          scrollWidth: 100,
          clientWidth: 90
        }
      };
      instance.setToolTip(event);
      expect(instance.isToolTipEnabled).toBe(true);
    });

    it('Should sort by Default Sort', () => {
      globalPayload.listResponse = true;
      globalPayload.configType = CONFIG_TYPE.TEMPLATE;
      globalPayload.policyLevel = POLICY_LEVEL.PROPERTY;
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      spyPolicyMgmtSearchPolicyService.getPolicySearchData.and.returnValue([]);
      const sortOptionSelected = {
        selectedIndex: 0,
        selectedObject: {
          id: SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE,
          name: SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE
        }
      };
      instance.onSortSelectionChange(sortOptionSelected);
      expect(instance.searchListData.length).toBeTruthy();
    });

  });


  describe('For deposit', () => {

    beforeEach(() => {
      const configType = CONFIG_TYPE.DEPOSIT_CONFIGURATION;
      const policyLevel = POLICY_LEVEL.PROPERTY;
      globalPayload.listResponse = true;
      globalPayload.configType = configType;
      globalPayload.policyLevel = policyLevel;
      contextService.setPolicyConfigType(configType);
      contextService.setPolicyLevel(policyLevel);
    });

    it('should initialize data on property ngOnInit()', () => {
      //Arrange
      instance.translationMap = TranslationMap;

      //Act
      fixture.detectChanges();

      //Assert
      expect(instance.sortDropdown[0].id).toBe(SEARCH_PORPERTY_SORT_OPTIONS.DEPOSIT_RULE_NAME);
      expect(instance.sortDropdown[1].id).toBe(SEARCH_PORPERTY_SORT_OPTIONS.DEPOSIT_RULE_NAME);
    });

    it('Should sort by Last Date', () => {
      // Arrange
      const sortOptionSelected = {
        selectedIndex: 0,
        selectedObject: {
          id: SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE,
          name: SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE
        }
      };
      spyOn(policyMgmtSearchService, 'searchDepositConfiguration').and.returnValue(of(searchPropertyDepositConfResponse));

      // Act
      instance.onSortSelectionChange(sortOptionSelected);

      // Assert
      expect(instance.searchListData.length).toBeTruthy();
    });

  });


  describe('For Enterprise Template', () => {
    globalPayload.listResponse = true;
    globalPayload.configType = CONFIG_TYPE.TEMPLATE;
    globalPayload.policyLevel = POLICY_LEVEL.ENTERPRISE;

    const params: ISearchEMTemplateParams = {
      offSet: 1,
      maxEntries: 25,
      filterModel: {
        status: {
          filterType: FILTER_TYPE_OPTIONS.EQUAL,
          value: STATUS_LIST.INACTIVE,
        },
        cancellationNotice: {
          filterType: FILTER_TYPE_OPTIONS.EQUAL,
          value: 'SAME_DAY'
        }
      },
      sortModel: [
        {
          fieldName: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_FIELD_NAME,
          sortType: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_DESC_SORT_TYPE
        }
      ]
    };

    it('should return search enterprise templates list data on Search API call', () => {
      // Arrange
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
      spySearchPayloadService.setSearchEMPayload(params);
      spyPolicyMgmtSearchPolicyService.getPolicySearchData.and.returnValue([]);

      // Act
      instance.onSearchEMClicked(params);

      // Assert
      expect(spySearchPayloadService.setSearchEMPayload).toHaveBeenCalledWith(params);
      expect(instance.searchListData.length).toBeDefined();
      expect(instance.paginationObj).toBeDefined();
    });

    it('should return search enterprise templates list data on Filter ', () => {
      // Arrange
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);

      spySearchPayloadService.setSearchEMPayload(params);
      spyPolicyMgmtSearchPolicyService.getPolicySearchData.and.returnValue([]);

      // Act
      instance.onFilterEMClicked(params);

      // Assert
      expect(spySearchPayloadService.setSearchEMPayload).toHaveBeenCalledWith(params);
      expect(instance.searchListData.length).toBeDefined();
      expect(instance.paginationObj).toBeDefined();
    });

    it('should return empty array response on Search API call - 404', () => {
      // Arrange
      globalPayload.listResponse = false;

      spySearchPayloadService.setSearchEMPayload(params);
      spyPolicyMgmtSearchPolicyService.getPolicySearchData.and.returnValue([]);

      // Act
      instance.onSearchEMClicked(params);

      // Assert
      expect(spySearchPayloadService.setSearchEMPayload).toHaveBeenCalledWith(params);
      expect(instance.searchListData.length).toBeFalsy();
    });

    it('Should sort by Default Sort', () => {
      // Arrange
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
      spyPolicyMgmtSearchPolicyService.getPolicySearchData.and.returnValue([]);
      const sortOptionSelected = {
        selectedIndex: 0,
        selectedObject: {
          id: SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE_ASCENDING,
          name: SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE_ASCENDING
        }
      };

      // Act
      instance.onSortSelectionChange(sortOptionSelected);

      // Assert
      expect(instance.searchListData.length).toBeDefined();
    });

    it('should return TranslationMap.VIEW_DEPOSIT_CONFIGURATIONS if configType is TEMPLATE and policyType is DEPOSIT', () => {
      // Arrange
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
      contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);

      // Act
      const result = instance.getViewDepositButtonName();

      // Assert
      expect(result).toBe(TranslationMap.VIEW_DEPOSIT_CONFIGURATIONS);
    });
  });

  describe('For Policy', () => {
    it('should initialize data on ngOnInit()', () => {
      instance.translationMap = TranslationMap;
      contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
      fixture.detectChanges();
      translateService.get(TranslationMap['CANCELLATION']).subscribe(res => {
        expect(res).toBeTruthy();
        expect(instance.tabList).toBe(POLICY_LIST_TABS);
        expect(instance.isConfigTypeTemplate).toBeFalsy();
        expect(instance.pageHeader).toBe(TranslationMap.POLICY_PAGE_HEADER);
      });
      expect(instance.sortDropdown[0].id).toBe(SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE);
      expect(instance.sortDropdown[1].id).toBe(SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_NAME_A_Z);
    });

    it('should get global data - hotelInfo, Metadata and RulesMetaData', () => {
      instance.initializeGlobalData();
      expect(policyMgmtService.loadGlobalData()).toBeTruthy();
      expect(policyMgmtService.makePolicyMetadataAPICalls()).toBeTruthy();
    });

    it('should return search Policy list data on Search API call with Page Index 1', () => {
      const searchList = searchPolicyResponse.policies as Array<IPolicySearchRepsonseModel>;
      const activePolicyList = searchList.filter(item => item.uxPolicyStatus === STATUS_LIST.ACTIVE);
      const propertyPolicyList = activePolicyList.filter(item => item.uxPolicyLevel === PROPERTY_POLICY_CREATION_LEVEL.PROPERTY);
      spyPolicyMgmtSearchPolicyService.getPolicySearchData.and.returnValue([]);
      spyPolicyMgmtSearchPolicyService.getFilteredSearchData.and.returnValue([...propertyPolicyList]);
      const params: IListSearchParams = {
        status: STATUS_LIST.ACTIVE,
        policyLevel: [PROPERTY_POLICY_CREATION_LEVEL.PROPERTY],
        pageIndex: 1
      };
      globalPayload.listResponse = true;
      globalPayload.configType = CONFIG_TYPE.POLICY;
      contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
      instance.onSearchClicked(params);
      expect(spySearchPayloadService.setSearchPayload).toHaveBeenCalledWith(params);
      expect(instance.searchListData.length).toBeTruthy();
      expect(instance.paginationObj).toBeDefined();
    });

    it('should return search Policy list data on Search API call with Page 2', () => {
      const searchList = searchPolicyResponse.policies as Array<IPolicySearchRepsonseModel>;
      const activePolicyList = searchList.filter(item => item.uxPolicyStatus === STATUS_LIST.ACTIVE);
      spyPolicyMgmtSearchPolicyService.getPolicySearchData.and.returnValue([...activePolicyList]);
      spyPolicyMgmtSearchPolicyService.getFilteredSearchData.and.returnValue([...activePolicyList]);
      globalPayload.listResponse = true;
      globalPayload.configType = CONFIG_TYPE.POLICY;
      contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
      instance.searchListData = activePolicyList;

      const params2: IListSearchParams = {
        status: STATUS_LIST.ACTIVE,
        policyLevel: [PROPERTY_POLICY_CREATION_LEVEL.PROPERTY],
        pageIndex: DEFAULT_VALUES.searchScreen.pagination.pageSize + 1
      };
      instance.onSearchClicked(params2);
      expect(spySearchPayloadService.setSearchPayload).toHaveBeenCalledWith(params2);
      expect(instance.searchListData.length).toBeTruthy();
      expect(instance.paginationObj).toBeDefined();
    });

    it('Should sort by Default Sort', () => {
      globalPayload.listResponse = true;
      globalPayload.configType = CONFIG_TYPE.TEMPLATE;
      globalPayload.policyLevel = POLICY_LEVEL.PROPERTY;
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      const searchList = searchPolicyResponse.policies as Array<IPolicySearchRepsonseModel>;
      const activePolicyList = searchList.filter(item => item.uxPolicyStatus === STATUS_LIST.ACTIVE);
      spyPolicyMgmtSearchPolicyService.getPolicySearchData.and.returnValue([]);
      spyPolicyMgmtSearchPolicyService.getFilteredSearchData.and.returnValue([...activePolicyList]);
      const sortOptionSelected = {
        selectedIndex: 0,
        selectedObject: {
          id: SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE,
          name: SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE
        }
      };
      instance.onSortSelectionChange(sortOptionSelected);
      expect(instance.searchListData.length).toBeTruthy();
    });


  });

  it('should post message to redirect to respective UE module', () => {
    const obj = { code: instance.postMessage.GROUPS, redirect: true };
    spyOn(window.parent, 'postMessage');
    instance.redirectToUeModule(instance.postMessage.GROUPS);
    expect(window.parent.postMessage).toHaveBeenCalledWith(JSON.stringify(obj), '*' as unknown as any);
  });

  describe('for Enterprise policy', () => {
    beforeEach(() => {
      contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
      contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
    });

    it('should initialize data on ngOnInit()', () => {
      instance.translationMap = TranslationMap;
      fixture.detectChanges();
      translateService.get(TranslationMap['CANCELLATION']).subscribe(res => {
        expect(res).toBeTruthy();
        expect(instance.tabList).toBe(POLICY_LIST_TABS);
        expect(instance.isConfigTypeTemplate).toBeFalsy();
        expect(instance.pageHeader).toBe(TranslationMap.ENTERPRISE_POLICY_PAGE_HEADER);
      });
      expect(instance.sortDropdown[0].id).toBe(SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE_DESCENDING);
      expect(instance.sortDropdown[1].id).toBe(SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE_ASCENDING);
    });
  });

  it('should call export service on export button click', () => {
    // Arrange
    const spyFilterComponent = jasmine.createSpyObj('FilterComponent', ['getSearchPayload']);
    instance.filterComponent = spyFilterComponent;

    // Act
    instance.onClickExport();

    // Assert
    expect(spyFilterComponent.getSearchPayload).toHaveBeenCalled();
    expect(spyPolicyMgmtSearchExportService.searchAndExport).toHaveBeenCalled();
  });

});
