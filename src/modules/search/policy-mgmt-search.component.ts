import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteStateService } from '../core/route.state.service';
import { ContextService } from '../core/context.service';
import { PolicyMgmtService } from '../policy-mgmt.service';
import { IListFormat, IHttpErrorResponse, IHotelInfo } from '../core/common.model';
import {
  POLICY_FLOW, CONFIG_TYPE, API_RESPONSE_CODE, DEFAULT_VALUES, POLICY_TYPE,
  PAYMENT_PROCESSING_STATUS, POLICY_LEVEL, POST_MESSAGE, POST_MESSAGE_ENT,
  HOTEL_SETTING_TYPE
} from '../core/constants';
import { PolicyMgmtSearchService } from './policy-mgmt-search.service';
import { TranslationMap } from '../core/translation.constant';
import { TcTranslateService } from 'tc-angular-services';
import {
  SORT_DROPDOWN,
  POLICY_LIST_TABS,
  SEARCH_SORT_DROPDOWN_OPTIONS,
  SEARCH_EM_SORT_OPTIONS,
  SORT_DROPDOWN_ENTERPRISE_POLICIES,
  SORT_DROPDOWN_PROPERTY_DEPOSIT_CONFIG,
  SORT_DROPDOWN_DEPOSIT_CONFIG
} from './policy-mgmt-search.constant';
import {
  IListSearchParams,
  ISearchResponse,
  IPolicySearchRepsonseModel,
  IEmPaymentDepositRulesResponseModel,
  IDepositConfigurationSearchResponseModel,
  IEMPolicySearchResponseModel,
  IEMTemplateResponseModel,
  ISearchEMResponse,
  ISearchEMTemplateParams,
  ISearchEMTemplateSortModel,
  IPaymentDepositRulesResponseModel
} from './policy-mgmt-search.model';
import { PolicyMgmtSearchPayloadService } from '../core/search-payload.service';
import { ITemplateResponseModel } from '../create/template/policy-mgmt-create-template.model';
import { PolicyMgmtSearchPolicyService } from './policy-mgmt-search-policies.service';
import { IPaginationModel } from './list/policy-mgmt-list.model';
import { PolicyMgmtUtilityService } from '../core/utility.service';
import { SharedDataService } from '../core/shared.data.service';
import { PolicyMgmtCreateTemplateService } from '../create/template/policy-mgmt-create-template.service';
import { FilterComponent } from './filter/filter.component';
import { PolicyMgmtSearchExportService } from './policy-mgmt-search-export.service';

@Component({
  templateUrl: './policy-mgmt-search.component.html',
  styleUrls: [
    './policy-mgmt-search.component.scss'
  ],
  encapsulation: ViewEncapsulation.None
})
export class PolicyMgmtSearchComponent implements OnInit, AfterViewInit {

  @ViewChild('tabSet', { static: false }) tabSet;
  @ViewChild(FilterComponent, { static: false }) filterComponent: FilterComponent;

  tabList: Array<IListFormat> = [];
  pageHeader: string;
  activeTab: string;
  configType: any;
  policyFlow: any;
  postMessage: any;
  componentInitialized: boolean;
  isConfigTypeTemplate: boolean;
  isConfigTypePolicy: boolean;
  isConfigTypeDepositConfiguration: boolean;
  translationMap: any;
  sortDropdown: Array<IListFormat>;
  isEnterpriseLevel: boolean;

  /**
   * Holds search response data
   */
  searchListData: Array<ITemplateResponseModel>
    | Array<IPolicySearchRepsonseModel>
    | Array<IPaymentDepositRulesResponseModel>
    | Array<IEmPaymentDepositRulesResponseModel>
    | Array<IEMPolicySearchResponseModel>
    | Array<IEMTemplateResponseModel>;

  /**
   * Holds boolean for showing/hiding filter panel
   */
  hideFilterPanel: boolean;

  /**
   * holds flag which determines whether tooltip should be shown or not
   */
  isToolTipEnabled: boolean;

  /**
   * holds flag whether has Edit access or not
   */
  hasEditAccess: boolean;

  paginationObj: IPaginationModel;
  /**
   * Holds value to check whether initial search Policy data loaded
   */
  isInitialSearchPoliciesLoaded: boolean;

  /**
   * Holds flag to check whether TemplateDropdown-Policy MetaData is loaded or not
   */
  isTemplateDropdownAPIDataLoaded: boolean;

  isDepositConfigurationLoaded: boolean;

  /**
   * routeURL used when redirecting between policies and templates
   */
  navigationRouteUrl: string;

  /**
   * Determines if redirected from the group block screen
   */
  isRedirectedFromGroups: boolean;

  /**
   * Determine if the property has the toogle New Policies Enabled
   */
  public isEnabledNewPolicies: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private routeStateService: RouteStateService,
    private contextService: ContextService,
    private policyMgmtService: PolicyMgmtService,
    private policyMgmtSearchService: PolicyMgmtSearchService,
    private searchPayloadService: PolicyMgmtSearchPayloadService,
    private translate: TcTranslateService,
    private searchPolicyService: PolicyMgmtSearchPolicyService,
    private utilityService: PolicyMgmtUtilityService,
    private sharedDataService: SharedDataService,
    private policyMgmtCreateTemplateService: PolicyMgmtCreateTemplateService,
    private policyMgmtSearchExportService: PolicyMgmtSearchExportService
  ) {
    this.configType = CONFIG_TYPE;
    this.policyFlow = POLICY_FLOW;
    this.postMessage = POST_MESSAGE;
    this.componentInitialized = false;
    this.translationMap = TranslationMap;
    this.activatedRoute.params.subscribe(params => {
      this.activeTab = params.policyType;
      this.contextService.setPolicyType(this.activeTab);
      this.contextService.setPolicyLevel(params.policyLevel);
    });
    this.postMessage = this.isEnterpriseLevel ? POST_MESSAGE_ENT : POST_MESSAGE;
    // listen to hide-filter panel flag
    this.policyMgmtSearchService.hideFilterPanelSubject.subscribe((flag: boolean) => {
      this.hideFilterPanel = flag;
    });
    this.paginationObj = {
      pageSize: DEFAULT_VALUES.searchScreen.pagination.pageSize,
      page: DEFAULT_VALUES.searchScreen.pagination.page,
      startIndex: DEFAULT_VALUES.searchScreen.pagination.startPageIndex,
      endIndex: 1,
      collectionSize: 1
    };
    this.isRedirectedFromGroups = this.contextService.getIsRedirectFromGroups();
  }

  async ngOnInit() {
    /* Window listener for redirecting to URM */
    window.addEventListener('message', this.onPostMessageHandler);

    this.translate.translateService.get(this.translationMap['CANCELLATION']).subscribe(() => {
      this.tabList = this.policyMgmtSearchService.translateTabList(POLICY_LIST_TABS);
      this.isEnterpriseLevel = this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE;
      this.postMessage = this.isEnterpriseLevel ? POST_MESSAGE_ENT : POST_MESSAGE;
      this.isConfigTypeTemplate = this.contextService.configType === CONFIG_TYPE.TEMPLATE;
      this.isConfigTypeDepositConfiguration = this.contextService.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION;
      this.isConfigTypePolicy = this.contextService.configType === CONFIG_TYPE.POLICY;
      this.setPageHeader();
      if (this.isPolicyTypeAvailable()) {
        setTimeout(() => {
          this.tabSet.select(this.activeTab);
        }, 0);
      }

      if (this.isEnterpriseLevel) {
        if (!this.isConfigTypeDepositConfiguration) {
          this.sortDropdown = this.translateSortDropDownOptions(SORT_DROPDOWN_ENTERPRISE_POLICIES);
        } else {
          this.sortDropdown = this.translateSortDropDownOptions(SORT_DROPDOWN_DEPOSIT_CONFIG);
        }
      } else {
        if (!this.isConfigTypeDepositConfiguration) {
          this.sortDropdown = this.translateSortDropDownOptions(SORT_DROPDOWN);
        } else {
          this.sortDropdown = this.translateSortDropDownOptions(SORT_DROPDOWN_PROPERTY_DEPOSIT_CONFIG);
        }
      }
    });

    // 1. For "Template", there is no PolicyMetadata-TemplateDropdown call required, so default flag set to "TRUE"
    // 2. For "Policy", there is PolicyMetadata-TemplateDropdown call, so default flag set to "FALSE" and
    // and when PolicyMetadata-TemplateDropdown call gets completed, then flat set to "TRUE"
    this.isTemplateDropdownAPIDataLoaded = this.contextService.configType === CONFIG_TYPE.TEMPLATE;
    this.isDepositConfigurationLoaded = this.contextService.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION;

    await this.initializeGlobalData();
    this.hasEditAccess = this.contextService.hasEditAccess();
    this.componentInitialized = true;
    this.toggleNewPolicyFeature();
  }

  ngAfterViewInit() {
    if (this.isPolicyTypeAvailable()) {
      this.tabSet.select(this.activeTab);
    }
  }

  private toggleNewPolicyFeature(): void {
    this.isEnabledNewPolicies = false;
    if (this.contextService.configType !== CONFIG_TYPE.DEPOSIT_CONFIGURATION
      || this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
        this.isEnabledNewPolicies = true;
    } else {
      const hotelCode = this.sharedDataService.getHotelInfo().hotelCode.toString();
      this.policyMgmtService.getHotelSettingToggle(hotelCode,  HOTEL_SETTING_TYPE.NEW_POLICIES).subscribe(res => {
        this.isEnabledNewPolicies = res;
      });
    }
  }


  async initializeGlobalData() {
    // load global data first
    await this.policyMgmtService.loadGlobalData();

    if (this.sharedDataService.getHotelInfo()) {
      const chainCode = this.sharedDataService.getHotelInfo().chainCode;
      this.contextService.setChainCode(chainCode);
    }
    this.policyMgmtService.getChainInfo().subscribe(chainInfo => this.sharedDataService.setChainInfo(chainInfo));

    this.searchPayloadService.resetSearchPayload();
    if (this.isEnterpriseLevel && this.isConfigTypeDepositConfiguration) {
      this.searchPayloadService.searchPayload.sortBy = SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_FIELD_NAME;
      this.searchPayloadService.searchPayload.sortOrder = SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_DESC_SORT_TYPE;
    }
    // loading Deposit Rules Data
    await this.loadDepositRulesData();

    if (this.contextService.configType === CONFIG_TYPE.POLICY) {
      await this.policyMgmtService.makePolicyMetadataAPICalls();
      this.isTemplateDropdownAPIDataLoaded = true;
      this.searchPolicyService.setPolicySearchData([]);
    }
  }

  /**
   * Loads Deposit Rules Data for deposit template
   */
  async loadDepositRulesData() {
    if (CONFIG_TYPE.TEMPLATE === this.contextService.configType) {
      if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
        // Populate Hotel info only after loadGlobalData call
        const hotelInfo: IHotelInfo = this.sharedDataService.getHotelInfo() ? this.sharedDataService.getHotelInfo() : null;
        // Call deposit rules API, if policy type is deposit and ProcessingMode is not Disabled
        if (this.contextService.policyType === POLICY_TYPE.DEPOSIT && hotelInfo
          && (hotelInfo.paymentInfo.processingMode !== PAYMENT_PROCESSING_STATUS.DISABLED
            || hotelInfo.hotelSettings.isGdsEnabled)) {
          await this.policyMgmtCreateTemplateService.loadDepositRuleListInfo().catch((err: IHttpErrorResponse) => {
            if (err.status === API_RESPONSE_CODE.NOT_FOUND_404) {
              this.sharedDataService.setDepositRulesList([]);
            }
          });
        }
      } else {
        this.sharedDataService.setDepositRulesList([]);
      }
    }
  }

  async onTabChange(evt) {
    this.contextService.setPolicyType(evt.nextId);
    this.searchPayloadService.resetSearchPayload();

    // loading deposit rules data
    await this.loadDepositRulesData();

    // set Filter panel to default value (expanded state) on tab change
    this.policyMgmtSearchService.setFilterPanelToDefault();
    // reset searchlist response data
    // this.searchListData = [];

    // For Policy, if component is initialized and tab changes has called, then make templateMetaData dropdown API call
    if (this.contextService.configType === CONFIG_TYPE.POLICY && this.componentInitialized) {
      this.searchPolicyService.setPolicySearchData([]);
      this.isInitialSearchPoliciesLoaded = false;
      this.isTemplateDropdownAPIDataLoaded = false;

      await this.policyMgmtService.makePolicyMetadataAPICalls();
      this.isTemplateDropdownAPIDataLoaded = true;
    }
  }

  /**
   * On filter and sort dropdown emit events, sets search payload
   * @param params: holds payload along with type
   */
  onSearchClicked(params?: IListSearchParams) {
    let policyListData: Array<IPolicySearchRepsonseModel> | Array<IEMPolicySearchResponseModel>;
    if (params) {
      // If params.pageIndex exists then assign it as it is.
      // Else assign Default PageIndex to it.
      params.pageIndex = params.pageIndex ? params.pageIndex : DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
      this.searchPayloadService.setSearchPayload(params);
    }

    if (this.searchPolicyService.getPolicySearchData().length && this.contextService.configType === CONFIG_TYPE.POLICY) {
      const searchPayload = this.searchPayloadService.getSearchPayload();
      policyListData = this.searchPolicyService.getFilteredSearchData(searchPayload);
      // Set Pagination Object and searchList Data for Policy
      this.setPaginationObject(params.pageIndex, policyListData.length);
      this.searchListData = policyListData.slice(this.paginationObj.startIndex - 1, this.paginationObj.endIndex);
    } else {
      this.policyMgmtSearchService.searchPolicies()
        .subscribe({
          next: (res: ISearchResponse) => {
            if (this.contextService.configType === CONFIG_TYPE.POLICY) {
              this.isInitialSearchPoliciesLoaded = true;
              if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
                this.searchPolicyService.setPolicySearchData(res.policies as Array<IPolicySearchRepsonseModel>);
                // Get Policiy search payload
                const searchPayload = this.searchPayloadService.getSearchPayload();
                // Filtering Policy list based on search payload
                policyListData = this.searchPolicyService.getFilteredSearchData(searchPayload);

                this.setPaginationObject(params.pageIndex, policyListData.length);
                this.searchListData = policyListData.slice(this.paginationObj.startIndex - 1, this.paginationObj.endIndex);
              } else {
                this.setPaginationObject(params.pageIndex, res.totalRecordCount);
                this.searchListData = res.policies as Array<IEMPolicySearchResponseModel>;
              }
            } else {
              this.searchListData = res.policyTemplates;
              // Set paginationObject
              this.setPaginationObject(params.pageIndex, res.totalRecordCount);
            }
          }, error: ((error: IHttpErrorResponse) => {
            if (error.status === API_RESPONSE_CODE.NOT_FOUND_404) {
              this.searchListData = [];
            }
          })
        });
    }
  }

  /**
   * Sets search enterprise template payload
   * @param params: holds payload along with type
   */
  onSearchEMClicked(params?: ISearchEMTemplateParams) {
    params.maxEntries = params.maxEntries ?? DEFAULT_VALUES.searchScreen.pagination.pageSize;
    if (params) {
      this.searchPayloadService.setSearchEMPayload(params);
    }

    this.policyMgmtSearchService.searchPolicies().subscribe({
      next: (res: ISearchEMResponse) => {
        this.searchListData = res.emPolicyTemplates;
        this.setPaginationObject(params.offSet, res.totalCount);
      }, error: ((error: IHttpErrorResponse) => {
        if (error.status === API_RESPONSE_CODE.NOT_FOUND_404) {
          this.searchListData = [];
        }
      })
    });
  }

  onFilterClicked(params?: IListSearchParams) {
    if (params) {
      // If params.pageIndex exists then assign it as it is.
      // Else assign Default PageIndex to it.
      params.pageIndex = params.pageIndex ? params.pageIndex : DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
      this.searchPayloadService.setSearchPayload(params);
    }

    this.policyMgmtSearchService.searchDepositConfiguration()
      .subscribe({
        next: (res: IDepositConfigurationSearchResponseModel) => {
          // process depositConfiguration data here
          this.isDepositConfigurationLoaded = true;
          if (this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE) {
            this.searchListData = res.emPaymentDepositRules;
          }
          else {
            this.searchListData = res.paymentDepositRules;
          }
          this.setPaginationObject(params.pageIndex, res.totalCount);
        }, error: ((error: IHttpErrorResponse) => {
          if (error.status === API_RESPONSE_CODE.NOT_FOUND_404) {
            this.searchListData = [];
          }
        })
      });
  }

  /**
   * This method is used to respond to a click event on the filter button.
   * Only for enterprise policy tempolates
   * @param {Event} event - The event object representing the click event.
   */
  onFilterEMClicked(params?: ISearchEMTemplateParams) {
    params.maxEntries = params.maxEntries ? params.maxEntries : DEFAULT_VALUES.searchScreen.pagination.pageSize;
    if (params) {
      this.searchPayloadService.setSearchEMPayload(params);
    }
    this.policyMgmtSearchService.searchPolicies().subscribe({
      next: (res: ISearchEMResponse) => {
        this.searchListData = res.emPolicyTemplates;
        this.setPaginationObject(params.offSet, res.totalCount);
      }, error: ((error: IHttpErrorResponse) => {
        if (error.status === API_RESPONSE_CODE.NOT_FOUND_404) {
          this.searchListData = [];
        }
      })
    });
  }

  /**
   * handling route for policies based on type and level
   */
  goToSpecifiedRoute(configType: CONFIG_TYPE, policyFlow: POLICY_FLOW, id?: string) {
    const route = policyFlow + '/' + configType;
    const routeUrl: string = this.routeStateService.getNavigateRouteUrl(route);
    let redirectionCode: string;

    if (policyFlow === POLICY_FLOW.CREATE) {
      this.router.navigate([routeUrl], { relativeTo: this.activatedRoute });
    } else if (policyFlow === POLICY_FLOW.SEARCH) {
      this.navigationRouteUrl = routeUrl;
      switch (configType) {
        case CONFIG_TYPE.TEMPLATE:
          redirectionCode = this.postMessage.template;
          break;
        case CONFIG_TYPE.POLICY:
          redirectionCode = this.postMessage.policies;
          break;
        case CONFIG_TYPE.DEPOSIT_CONFIGURATION:
          redirectionCode = this.postMessage.depositConfiguration;
          break;
        default:
          break;
      }

      // This handles change in menu when wants to redirect
      const obj = { code: redirectionCode, redirect: false };
      window.parent.postMessage(JSON.stringify(obj), '*');
    }
    else {
      this.router.navigate([routeUrl], { queryParams: { id }, relativeTo: this.activatedRoute });
    }
  }


  /**
   * Toggles filter section
   */
  toggleFilters() {
    this.policyMgmtSearchService.toggleHideFilterSubject();
  }

  /**
   * This will check the truncated text and enable/disable flag to show tool tip.
   * @param e: Mouse enter event on element
   */
  setToolTip(e: any) {
    this.isToolTipEnabled = e.target.scrollWidth > e.target.clientWidth;
  }

  /**
   * Set startIndex, endIndex and page of paginationObj
   */
  setPaginationObject(pageIndex: number, size: number) {
    const paginationObject: IPaginationModel = {
      pageSize: DEFAULT_VALUES.searchScreen.pagination.pageSize,
      collectionSize: size
    };
    if (pageIndex && pageIndex !== DEFAULT_VALUES.searchScreen.pagination.startPageIndex) {
      paginationObject.startIndex = pageIndex;
      paginationObject.endIndex = Math.min((paginationObject.startIndex + paginationObject.pageSize - 1),
        paginationObject.collectionSize);
      // Calculate current selected page using startIndex and pageSize
      paginationObject.page = Math.ceil((paginationObject.startIndex - 1) / paginationObject.pageSize) + 1;
      this.paginationObj = { ...paginationObject };
    } else {
      // Set startIndex, endIndex and page to Default Values in case of Search and Clear Button Click
      paginationObject.startIndex = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
      paginationObject.endIndex = Math.min((paginationObject.startIndex + paginationObject.pageSize - 1),
        paginationObject.collectionSize);
      paginationObject.page = DEFAULT_VALUES.searchScreen.pagination.page;
      this.paginationObj = { ...paginationObject };
    }
  }

  /**
   * On Sort Dropdown Selection Change
   */
  onSortSelectionChange(event) {
    const searchPayload: IListSearchParams = {};
    const searchEMPayload: ISearchEMTemplateParams = {};
    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      searchPayload.sortBy = event.selectedObject.id;
      if (this.contextService.configTypeName === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
        searchPayload.sortOrder = this.getSortOrder(event.selectedObject.name);
        this.onFilterClicked(searchPayload);
      } else {
        this.onSearchClicked(searchPayload);
      }
    } else {
      if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
        let selectedSort = event.selectedObject.id;
        const sortModel: ISearchEMTemplateSortModel = {
          fieldName: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_FIELD_NAME,
          sortType: selectedSort === SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_LAST_MODIFIED_DATE_DESCENDING ?
            SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_DESC_SORT_TYPE :
            SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_ASC_SORT_TYPE
        };
        searchEMPayload.sortModel = [sortModel];
        this.onSearchEMClicked(searchEMPayload);
      } else if (this.contextService.configTypeName === CONFIG_TYPE.DEPOSIT_CONFIGURATION) {
        searchPayload.sortBy = event.selectedObject.id;
        searchPayload.sortOrder = this.getSortOrder(event.selectedObject.name);
        this.onFilterClicked(searchPayload);
      } else {
        searchPayload.sortBy = event.selectedObject.id;
        this.onSearchClicked(searchPayload);
      }
    }
  }

  /**
   * Translate Sort Dropdown
   */
  translateSortDropDownOptions(sortData: any) {
    const listData = [];
    sortData.forEach(item => {
      listData.push({
        id: item.id,
        name: this.translate.translateService.instant(TranslationMap[item.name])
      });
    });
    return listData;
  }

  /**
   * event listener for window post message in iframe
   * It is the alternative handler only when the module is not integrated with UE (e.g. local testing environment)
   * @param event: event object passed from UE Menu
   */
  onPostMessageHandler = (event) => {
    if (event.data && this.utilityService.isValidJson(event.data)) {
      const code = JSON.parse(event.data).code;
      if (code === this.postMessage.template || code === this.postMessage.policies
        || this.postMessage.depositConfiguration) {
        this.router.navigate([this.navigationRouteUrl], { relativeTo: this.activatedRoute });
      }
    }
  };

  /**
   * Redirects to other ue modules
   * @param redirectionCode Redirection menu code
   */
  redirectToUeModule(redirectionCode: string) {
    const obj = { code: redirectionCode, redirect: true };
    if (window.parent) {
      window.parent.postMessage(JSON.stringify(obj), '*');
    }
  }

  setPageHeader() {
    if (this.isEnterpriseLevel) {
      if (this.isConfigTypeTemplate) {
        this.pageHeader = TranslationMap.POLICY_ENTERPRISE_TEMPLATE_PAGE_HEADER;
      } else if (this.isConfigTypePolicy) {
        this.pageHeader = TranslationMap.ENTERPRISE_POLICY_PAGE_HEADER;
      } else {
        this.pageHeader = TranslationMap.PAYMENT_DEPOSIT_RULES_PAGE_HEADER;
      }
    } else {
      if (this.isConfigTypeTemplate) {
        this.pageHeader = TranslationMap.POLICY_TEMPLATE_PAGE_HEADER;
      } else if (this.isConfigTypePolicy) {
        this.pageHeader = TranslationMap.POLICY_PAGE_HEADER;
      } else {
        this.pageHeader = TranslationMap.PAYMENT_DEPOSIT_RULES_PAGE_HEADER;
      }
    }
  }

  getConfigType(): CONFIG_TYPE {
    return this.contextService.configType as CONFIG_TYPE;
  }

  getNextConfigType(): CONFIG_TYPE {
    if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
      return CONFIG_TYPE.POLICY;
    } else {
      return CONFIG_TYPE.TEMPLATE;
    }
  }

  getCreateButtonName(): string {
    if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
      return TranslationMap.CREATE_NEW_POLICY_TEMPLATE;
    } else if (this.contextService.configType === CONFIG_TYPE.POLICY) {
      return TranslationMap.CREATE_NEW_POLICY;
    } else {
      return TranslationMap.CREATE_NEW_PAYMENT_DEPOSIT_RULE;
    }
  }

  getViewButtonName(): string {
    if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
      return TranslationMap.VIEW_POLICIES;
    } else {
      return TranslationMap.VIEW_POLICY_TEMPLATES;
    }
  }

  getViewDepositButtonName(): string | any {
    if (this.contextService.configType === CONFIG_TYPE.TEMPLATE && this.contextService.policyType === POLICY_TYPE.DEPOSIT) {
      return TranslationMap.VIEW_DEPOSIT_CONFIGURATIONS;
    }
  }

  isPolicyTypeAvailable(): boolean {
    return this.contextService.configType !== CONFIG_TYPE.DEPOSIT_CONFIGURATION;
  }

  /**
   * function to remove event after postMessage has been triggered
   */
  onDestroy() {
    /* Remove the event listener */
    window.removeEventListener('message', this.onPostMessageHandler);
  }

  getSortOrder(selected: string): string {
    let sortOrder: string = SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_DESC_SORT_TYPE;
    let sortByNameAZ = this.translate.translateService.instant(TranslationMap[SEARCH_SORT_DROPDOWN_OPTIONS.SORT_BY_NAME_A_Z]);
    if (selected === sortByNameAZ) {
      sortOrder = SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_ASC_SORT_TYPE;
    }
    return sortOrder;
  }


  /**
   * function to export the data
   */
  onClickExport() {
    const searchParams = this.filterComponent.getSearchPayload();
    this.policyMgmtSearchExportService.searchAndExport(searchParams);
  }
}


