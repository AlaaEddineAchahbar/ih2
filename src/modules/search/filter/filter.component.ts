import { Component, ViewEncapsulation, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ContextService } from '../../core/context.service';
import { RulesConfigurationService } from '../../core/rules-config.service';
import { IFilterRulesData, IFilterErrorModel } from './filter.model';
import {
  IAcceptedTenderFilter,
  ICancellationNoticeFilter,
  IEMPolicyTemplateNameFilter,
  IIsInstallmentEnabledFilter,
  IListSearchParams,
  ISearchEMTemplateParams,
  IStatusFilter
} from '../policy-mgmt-search.model';
import { TranslationMap } from '../../core/translation.constant';
import { CONFIG_TYPE, DEFAULT_VALUES, POLICY_LEVEL } from '../../core/constants';
import { PolicyMgmtSearchService } from '../policy-mgmt-search.service';
import { ENTERPRISE_POLICY_METADATA_TYPE, POLICY_ASSOCIATED_METADATA_TYPE } from '../../core/rules.constant';
import { SharedDataService } from '../../core/shared.data.service';
import { TcTranslateService } from 'tc-angular-services';
import {
  COMMON_OPTIONS,
  PROPERTY_POLICY_CREATION_LEVEL,
  STATUS_LIST,
  ENTERPRISE_POLICY_LEVEL_FILTERS,
  POLICY_SETTING_OPTIONS,
  FILTER_TYPE_OPTIONS,
  INSTALLMENTS_LIST,
  POLICY_OWNER
} from '../../core/rules-config.constant';
import { PolicyMgmtUtilityService } from '../../core/utility.service';
import * as moment from 'moment';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ErrorMessage } from '../../core/common.model';
import { SEARCH_EM_SORT_OPTIONS } from '../policy-mgmt-search.constant';

@Component({
  selector: 'policy-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilterComponent implements OnInit, OnChanges {

  /**
   * Output events
   */
  @Output() search: EventEmitter<IListSearchParams> | EventEmitter<ISearchEMTemplateParams> = new EventEmitter();

  @Output() filter: EventEmitter<IListSearchParams> | EventEmitter<ISearchEMTemplateParams> = new EventEmitter();

  /**
   * Filter rules Data
   */
  rulesData: IFilterRulesData;

  /**
   * Holds Translation map
   */
  translationMap: any;

  /**
   * Holds config type: Template/Policy
   */
  configType: string;

  /**
   * Holds Config Type Enum
   */
  configTypeEnum: any;

  /**
   * Holds boolean for showing/hiding filter panel
   */
  hideFilterPanel: boolean;

  /**
   * holds flag which determines whether tooltip should be shown or not
   */
  isToolTipEnabled: boolean;

  /**
   * Dropdown Input Values
   */
  dropdownLabels: any;

  /**
   * Holds the dateformat for date picker
   */
  dateFormat: string;

  /**
   * Holds deafult startDate for date picker
   */
  startDate: Date | string | NgbDateStruct;

  /**
   * Holds deafult endDate for date picker
   */
  endDate: Date | string | NgbDateStruct;

  /**
   * This will hold week & month values to be given to Date Picker
   */
  datePickeri18nValues: {};

  /**
   * Input parameter from Search component
   */
  @Input() isInitialSearchPoliciesLoaded: boolean;

  /**
   * Flag tells whether TemplateDropdown API Data is loaded or not
   * Note: For Template, its not required, so default value is true
   */
  @Input() isTemplateDropdownAPIDataLoaded: boolean;

  @Input() isDepositConfigurationLoaded: boolean;

  /**
   * Hold value to disable Rate Category
   */
  rateCategoryDisable: boolean;

  /**
   * Holds list of inline error messages if any
   */
  errorObj: IFilterErrorModel;

  /**
   * Holds a rate plan id
   */
  ratePlanId: string;

  /**
   * To display Installment sections
   */
  enabledInstallmentFlag: boolean;

  constructor(
    private contextService: ContextService,
    private rulesConfigService: RulesConfigurationService,
    private policyMgmtSearchService: PolicyMgmtSearchService,
    private sharedDataService: SharedDataService,
    private translate: TcTranslateService,
    private utilityService: PolicyMgmtUtilityService
  ) {
    this.translationMap = TranslationMap;
    this.configType = this.contextService.configType;
    this.configTypeEnum = CONFIG_TYPE;

    this.policyMgmtSearchService.hideFilterPanelSubject.subscribe((flag: boolean) => {
      this.hideFilterPanel = flag;
    });
    this.dropdownLabels = {};
    this.errorObj = {
      policyAssignmentLevelErrorMessage: new ErrorMessage()
    };
    this.errorObj.policyAssignmentLevelErrorMessage.message =
      this.translate.translateService.instant(TranslationMap['SELECTION_IS_REQUIRED']);
  }

  ngOnInit(): void {
    // Here RulesData will get set when OnTabChange is called
    if (!this.rulesData) {
      this.rulesData = this.rulesConfigService.getFilterConfigData(
        this.contextService.policyLevel,
        this.contextService.configType,
        this.contextService.policyType
      );
    }

    this.setDropdownLabels();
    this.startDate = {
      year: null,
      month: null,
      day: null
    };
    this.endDate = {
      year: null,
      month: null,
      day: null
    };
    this.dateFormat = DEFAULT_VALUES.datePickerUIFormat;
    this.datePickeri18nValues = this.utilityService.getDatePickerTranslatedDates();
    this.rateCategoryDisable = false;
    this.ratePlanId = this.contextService.getRatePlanId();
    this.enabledInstallmentFlag = this.policyMgmtSearchService.setEnableInstallment();
  }

  /**
   * Sets rate plan in context to filter policies
   */
  searchPoliciesByRatePlanInContext() {
    // Make "Rate Plan" checkbox selected
    this.rulesData.fields.policyLevel = {
      [PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN]: true
    };
    // Disable rate category dropdown as rate plan is selected by default
    this.rateCategoryDisable = true;
    // Check if rate plan is present in policy associated rate plans
    // If present, make it selected in dropdown
    this.rulesData.data.ratePlans.forEach((category) => {
      const ratePlan = category.list.find((rate) => rate.id === this.ratePlanId);
      if (ratePlan) {
        ratePlan.selected = true;
      }
    });
    // Set rate plan context to filter records
    this.rulesData.fields.ratePlan = [this.ratePlanId];
    // Call search function to filter policies based on rate plan
    this.onSearch();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isInitialSearchPoliciesLoaded && changes.isInitialSearchPoliciesLoaded.currentValue
      && this.contextService.configType === CONFIG_TYPE.POLICY) {
      if (!this.isEnterpriseLevel()) {
        this.setDefaultDropdownsList();
        if (this.ratePlanId) {
          this.searchPoliciesByRatePlanInContext();
        }
      } else {
        this.setEnterpriseDropdowns();
      }
    }

    // if Dropdown calls are completed & rulesData not set, then make search call
    if (changes.isTemplateDropdownAPIDataLoaded &&
      changes.isTemplateDropdownAPIDataLoaded.currentValue) {
      // Here RulesData will get set when OnPageLoad is called
      if (!this.rulesData) {
        this.rulesData = this.rulesConfigService.getFilterConfigData(
          this.contextService.policyLevel,
          this.contextService.configType,
          this.contextService.policyType
        );
      }

      this.onSearch();
    }

    if (this.contextService.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION &&
      changes.isDepositConfigurationLoaded) {
      // Here RulesData will get set when OnPageLoad is called
      if (!this.rulesData) {
        this.rulesData = this.rulesConfigService.getFilterConfigData(
          this.contextService.policyLevel,
          this.contextService.configType,
          this.contextService.policyType
        );
      }
      // As loader is not getting displayed when search call is in progress, adding setTimeout to handle this
      setTimeout(() => {
        this.onFilter();
      }, 10);
    }
  }

  filterChanges(evt, key) {
    if (this.rulesData.fields.hasOwnProperty(key) && evt.target.value) {
      let val = evt.target.value;
      if (key === 'acceptedTender') {
        val = Number(val);
      }
      this.rulesData.fields[key] = val;
    }
  }

  /**
   * returns search payload from rules data
   */
  getSearchPayload(): IListSearchParams | ISearchEMTemplateParams {
    if (this.contextService.policyLevel === POLICY_LEVEL.PROPERTY) {
      if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
        return this.getSearchPayloadPolicyTemplate();
      } else if (this.contextService.configType === CONFIG_TYPE.POLICY) {
        return this.getSearchPayloadPolicies();
      } else {
        return this.getSearchPayloadDepositConfiguration();
      }
    } else {
      if (this.contextService.configType === CONFIG_TYPE.TEMPLATE) {
        return this.getSearchPayloadEMPolicyTemplate();
      } else if (this.contextService.configType === CONFIG_TYPE.POLICY) {
        return this.getSearchPayloadPolicies();
      } else {
        return this.getSearchPayloadDepositConfiguration();
      }
    }
  }

  /**
  * returns search enterprise templates payload from rules data
  */
  getSearchPayloadEMPolicyTemplate(): ISearchEMTemplateParams {
    let searchEMPayload: ISearchEMTemplateParams = {};
    let statusFilter: IStatusFilter;
    let nameFilter: IEMPolicyTemplateNameFilter;
    let cancellationNoticeFilter: ICancellationNoticeFilter;
    let acceptedTenderFilter: IAcceptedTenderFilter;
    let installmentsFilter: IIsInstallmentEnabledFilter;

    // Set status
    statusFilter = {
      filterType: FILTER_TYPE_OPTIONS.EQUAL,
      value: this.rulesData.fields.status === STATUS_LIST.ALL_STATUS ?
        COMMON_OPTIONS.ALL : this.rulesData.fields.status
    };

    // Set Sort
    searchEMPayload.sortModel = [
      {
        fieldName: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_FIELD_NAME,
        sortType: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_DESC_SORT_TYPE
      }
    ];

    // Set page index and page size
    searchEMPayload.offSet = DEFAULT_VALUES.searchScreen.pagination.startPageIndex;
    searchEMPayload.maxEntries = DEFAULT_VALUES.searchScreen.pagination.pageSize;

    // Set template name filter
    if (this.rulesData.fields.policyTemplateName) {
      nameFilter = {
        filterType: FILTER_TYPE_OPTIONS.LIKE,
        value: this.rulesData.fields.policyTemplateName
      };
    }

    // Set cancellation notice filter
    if (this.rulesData.fields.hasOwnProperty(POLICY_SETTING_OPTIONS.CANCELLATION_NOTICE)) {
      if (this.rulesData.fields.cancellationNotice !== COMMON_OPTIONS.ALL) {
        cancellationNoticeFilter = {
          filterType: FILTER_TYPE_OPTIONS.EQUAL,
          value: this.rulesData.fields.cancellationNotice
        };
      }
    }

    // Set accepted tender filter
    if (this.rulesData.fields.hasOwnProperty(POLICY_SETTING_OPTIONS.ACCEPTED_TENDER)) {
      if (this.rulesData.fields.acceptedTender !== 0) {
        acceptedTenderFilter = {
          filterType: FILTER_TYPE_OPTIONS.EQUAL,
          value: this.rulesData.fields.acceptedTender.toString()
        };
      }
    }

    // set installments filter
    if (this.rulesData.fields.hasOwnProperty(POLICY_SETTING_OPTIONS.INSTALLMENTS)) {
      if (this.rulesData.fields.installments === INSTALLMENTS_LIST.ACTIVE) {
        installmentsFilter = { filterType: FILTER_TYPE_OPTIONS.EQUAL, value: '1' };
      } else if (this.rulesData.fields.installments === INSTALLMENTS_LIST.INACTIVE) {
        installmentsFilter = { filterType: FILTER_TYPE_OPTIONS.EQUAL, value: '0' };
      } else if (this.rulesData.fields.installments === INSTALLMENTS_LIST.BOTH) {
        installmentsFilter = { filterType: FILTER_TYPE_OPTIONS.EQUAL, value: '' };
      }
    }

    // Set all filters
    searchEMPayload.filterModel = {
      status: statusFilter,
      emPolicyTemplateName: nameFilter,
      cancellationNotice: cancellationNoticeFilter,
      acceptedTender: acceptedTenderFilter,
      isInstallmentEnabled: installmentsFilter
    };

    return { ...searchEMPayload };
  }

  getSearchPayloadPolicyTemplate(): IListSearchParams {
    const searchPayload: IListSearchParams = {};
    if (this.rulesData.fields.policyTemplateName) {
      searchPayload.policyTemplateName = this.rulesData.fields.policyTemplateName;
    }
    if (this.rulesData.fields.hasOwnProperty('cancellationNotice')) {
      searchPayload.cancellationNotice = this.rulesData.fields.cancellationNotice;
    }
    if (this.rulesData.fields.hasOwnProperty('acceptedTender')) {
      searchPayload.acceptedTender = this.rulesData.fields.acceptedTender;
    }
    if (this.rulesData.fields.hasOwnProperty('installments')) {
      if (this.rulesData.fields.installments === 'ACTIVE_TEXT') {
        searchPayload.isInstallmentEnabled = 1;
      } else if (this.rulesData.fields.installments === 'INACTIVE_TEXT') {
        searchPayload.isInstallmentEnabled = 0;
      } else if (this.rulesData.fields.installments === 'BOTH_TEXT') {
        searchPayload.isInstallmentEnabled = '';
      }
    }

    if (this.rulesData.fields.hasOwnProperty('isFreeCancellation')) {
      searchPayload.isFreeCancellation = this.rulesData.fields.isFreeCancellation;
    }

    searchPayload.level = POLICY_OWNER.BOTH;

    searchPayload.status = this.rulesData.fields.status === STATUS_LIST.ALL_STATUS ?
      COMMON_OPTIONS.ALL : this.rulesData.fields.status;
    return { ...searchPayload };
  }

  getSearchPayloadPolicies(): IListSearchParams {
    const searchPayload: IListSearchParams = {};
    if (this.isEnterpriseLevel()) {
      if (this.rulesData.fields.enterprisePolicyLevel?.CHAIN_CATEGORIES) {
        searchPayload.policyLevel = [ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES];
        searchPayload.chainCategories = this.rulesData.fields.chainCategory;
      } else if (this.rulesData.fields.enterprisePolicyLevel?.RATE_CATEGORIES) {
        searchPayload.policyLevel = [ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES];
        searchPayload.rateCategory = this.rulesData.fields.rateCategory;
      } else if (this.rulesData.fields.enterprisePolicyLevel?.RATE_PLANS) {
        searchPayload.policyLevel = [ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS];
        searchPayload.ratePlan = this.rulesData.fields.ratePlan;
      } else {
        searchPayload.policyLevel = [ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN];
      }
    } else {
      searchPayload.policyLevel = this.getPolicyLevel();
      searchPayload.rateCategory = this.rulesData.fields.rateCategory;
      searchPayload.ratePlan = this.rulesData.fields.ratePlan;
    }
    searchPayload.policyName = this.rulesData.fields.policyName;
    searchPayload.policyTemplateId = this.rulesData.fields.policyTemplateId;
    searchPayload.policyTemplateName = this.rulesData.fields['policyTemplateNameDropdownValue'];
    searchPayload.startDate = this.rulesData.fields.dateRange.startDate;
    searchPayload.endDate = this.rulesData.fields.dateRange.endDate;
    searchPayload.status = this.rulesData.fields.status;
    return { ...searchPayload };
  }

  getSearchPayloadDepositConfiguration(): IListSearchParams {
    const searchPayload: IListSearchParams = {};
    searchPayload.depositConfigurationName = this.rulesData.fields.depositConfigurationName;
    return { ...searchPayload };
  }

  /**
   * Emits payload data on search-click and onInit
   */
  onSearch() {
    // First checking condition whether it is Policy or Template by using hasOwnProperty
    // Then check Policy Assignment Level required validation, if any of selected then only emit data
    if (this.checkPropertyPolicyLevel()) {
      if (this.getPolicyLevel().length > 0) {
        this.search.emit(this.getSearchPayload());
      }
    } else {
      this.search.emit(this.getSearchPayload());
    }
  }

  onFilter() {
    this.filter.emit(this.getSearchPayload());
  }

  checkVisibility(key: string) {
    return this.rulesData.fields.hasOwnProperty(key);
  }

  isEnterpriseLevel() {
    return this.contextService.policyLevel === POLICY_LEVEL.ENTERPRISE;
  }

  isTemplateType() {
    return this.contextService.configType === CONFIG_TYPE.TEMPLATE;
  }

  isDepositConfigType() {
    return this.contextService.configType === CONFIG_TYPE.DEPOSIT_CONFIGURATION;
  }

  checkEnterprisePolicyLevel(): boolean {
    return this.checkVisibility('enterprisePolicyLevel') && !this.checkEmpty('enterprisePolicyLevel');
  }

  checkPropertyPolicyLevel(): boolean {
    return this.checkVisibility('policyLevel') && !this.checkEmpty('policyLevel');
  }

  checkEmpty(key: string) {
    return Object.keys(this.rulesData.fields[key]).length === 0;
  }

  /**
   * Resets search filter option to default
   */
  resetFilter() {
    this.rulesData = this.rulesConfigService.getFilterConfigData(
      this.contextService.policyLevel,
      this.contextService.configType,
      this.contextService.policyType
    );

    if (this.isEnterpriseLevel() && !this.isTemplateType() && !this.isDepositConfigType()) {
      this.setEnterpriseDropdowns();
    }

    if (!this.isEnterpriseLevel() && !this.isTemplateType()) {
      this.setDefaultDropdownsList();
    }

    this.rateCategoryDisable = false;
    // Reset DatePicker's startDate and endDate
    this.startDate = {
      year: null,
      month: null,
      day: null
    };
    this.endDate = {
      year: null,
      month: null,
      day: null
    };

    if (this.isDepositConfigType()) {
      this.onFilter();
    } else {
      this.onSearch();
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
   * On Rate Category Dropdown selection change
   * @param evt: selected data
   */
  onRateCategorySelectionChange(evt: any) {
    const rateCategorySelected: Array<string> = [];
    evt.dropdownItems.forEach(category => {
      if (category.visible) {
        rateCategorySelected.push(category.id);
      }
    });
    // If rateCategoryItem is selected then set ratePlans to empty so that it will be disabled.
    // Else re-assign rateplan list
    if (rateCategorySelected.length > 0) {
      this.rulesData.fields.rateCategory = rateCategorySelected;
      this.rulesData.data.ratePlans = [];
    } else {
      this.rulesData.fields.rateCategory = [];
      this.rulesData.data.ratePlans = JSON.parse(JSON.stringify(
        this.sharedDataService.getPolicyMetadata(POLICY_ASSOCIATED_METADATA_TYPE.ratePlans)));
    }
  }

  /**
   * On Rate Plan Dropdown selection change
   * evt: Selected Rate Plan
   */
  onRatePlanSelectionChange(evt: any) {
    const ratePlanSelected: Array<string> = [];
    evt.dropdownItems.forEach(category => {
      category.list.forEach(rateplan => {
        if (rateplan.selected) {
          ratePlanSelected.push(rateplan.id);
        }
      });
    });
    // If ratePlans are selected from list then disable RateCategory
    // Else enable RateCategory Dropdown
    if (ratePlanSelected.length > 0) {
      this.rulesData.fields.ratePlan = ratePlanSelected;
      this.rateCategoryDisable = true;
    } else {
      this.rateCategoryDisable = false;
      this.rulesData.fields.ratePlan = [];
    }
  }

  onEnterpriseRateCategorySelectionChange(evt: any) {
    const rateCategorySelected: Array<string> = [];
    evt.dropdownItems.forEach(category => {
      if (category.visible) {
        rateCategorySelected.push(category.id);
      }
    });
    this.rulesData.fields.rateCategory = rateCategorySelected;
  }

  onEnterpriseRatePlanSelectionChange(evt: any) {
    const ratePlansSelected: Array<string> = [];
    evt.dropdownItems.forEach(ratePlan => {
      if (ratePlan.visible) {
        ratePlansSelected.push(ratePlan.id);
      }
    });
    this.rulesData.fields.ratePlan = ratePlansSelected;
  }

  onEnterpriseChainCategorySelectionChange(evt: any) {
    const chainCategoriesSelected: Array<string> = [];
    evt.dropdownItems.forEach(chainCategory => {
      chainCategory.list.forEach(chainCategoryGroup => {
        if (chainCategoryGroup.selected) {
          chainCategoriesSelected.push(chainCategoryGroup.id);
        }
      });
    });
    this.rulesData.fields.chainCategory = chainCategoriesSelected;
  }

  /**
   * Set Dropdown labels
   */
  setDropdownLabels() {
    this.translate.translateService.get('FILTERS').subscribe(() => {
      this.dropdownLabels.placeholderText = this.translate.translateService.instant(TranslationMap['FILTERS']);
      this.dropdownLabels.customLabels = {
        selectAll: this.translate.translateService.instant(TranslationMap['SELECT_ALL']),
        clearAll: this.translate.translateService.instant(TranslationMap['CLEAR_ALL']),
        expandAll: this.translate.translateService.instant(TranslationMap['EXPAND_ALL']),
        collapseAll: this.translate.translateService.instant(TranslationMap['COLLAPSE_ALL'])
      };

      this.dropdownLabels.defaultRatePlanText = [
        {
          selectionText: this.translate.translateService.instant(
            TranslationMap['NUMBER_OF_RATE_PLANS_SELECTED']).replace('{{count}}', '')
        },
        { selectionText: this.translate.translateService.instant(TranslationMap['ALL_RATEPLANS_SELECTED']) },
        { selectionText: this.translate.translateService.instant(TranslationMap['DEFAULT_RATE_SELECT']) }
      ];

      this.dropdownLabels.defaultRateCategoryText = [
        {
          selectionText: this.translate.translateService.instant(
            TranslationMap['NUMBER_OF_RATE_CATEGORIES_SELECTED']).replace('{{count}}', '')
        },
        { selectionText: this.translate.translateService.instant(TranslationMap['ALL_RATE_CATEGORIES_SELECTED']) },
        { selectionText: this.translate.translateService.instant(TranslationMap['DEFAULT_RATE_CATEGORY_SELECT']) }
      ];

      this.dropdownLabels.defaultChainCategoryText = [
        {
          selectionText: this.translate.translateService.instant(
            TranslationMap['NUMBER_OF_CHAIN_CATEGORIES_SELECTED']).replace('{{count}}', '')
        },
        { selectionText: this.translate.translateService.instant(TranslationMap['ALL_CHAIN_CATEGORIES_SELECTED']) },
        { selectionText: this.translate.translateService.instant(TranslationMap['DEFAULT_CHAIN_CATEGORY_SELECT']) }
      ];
    });
  }

  /**
   * Get Policy Assigned Levels
   */
  getPolicyLevel() {
    const policyLevels: Array<string> = [];
    Object.keys(this.rulesData.fields.policyLevel).forEach(key => {
      if (this.rulesData.fields.policyLevel[key]) {
        policyLevels.push(key);
      }
    });
    return policyLevels;
  }

  /**
   * Set the Policy Template
   */
  onPolicyTemplateSelectionChange(event) {
    this.rulesData.fields.policyTemplateId = event.selectedObject.id;
    this.rulesData.fields['policyTemplateNameDropdownValue'] = event.selectedObject.name;
  }

  /**
   * On Start Date change selection
   * @param startDate: selected startDate
   */
  onStartDateChange(startDate) {
    if (startDate) {
      this.rulesData.fields.dateRange.startDate = moment(startDate).format(DEFAULT_VALUES.datePickerAPIFormat);
    }

  }

  /**
   * On End Date change selection
   * @param endDate: selected endDate
   */

  onEndDateChange(endDate) {
    if (endDate) {
      this.rulesData.fields.dateRange.endDate = moment(endDate).format(DEFAULT_VALUES.datePickerAPIFormat);
    }
  }

  /**
   * To reset DateRange startDate and endDate when dates are cleared
   * using Clear Dates
   */
  onClearDate() {
    this.rulesData.fields.dateRange.startDate = '';
    this.rulesData.fields.dateRange.endDate = '';
  }

  /**
   * Set Default Dropdown list for PolicyTemplateList, RateCategories and RatePlans
   */
  setDefaultDropdownsList() {
    if (this.rulesData && !this.rulesData.data.policyTemplateList.length) {
      this.rulesData.data.policyTemplateList = JSON.parse(JSON.stringify(
        this.sharedDataService.getPolicyMetadata(POLICY_ASSOCIATED_METADATA_TYPE.templates)));
    }
    if (this.rulesData && !this.rulesData.data.rateCategories.length) {
      this.rulesData.data.rateCategories = JSON.parse(JSON.stringify(
        this.sharedDataService.getPolicyMetadata(POLICY_ASSOCIATED_METADATA_TYPE.rateCategories)));
    }
    if (this.rulesData && !this.rulesData.data.ratePlans.length) {
      this.rulesData.data.ratePlans = this.sharedDataService.getPolicyMetadata(POLICY_ASSOCIATED_METADATA_TYPE.ratePlans);
      this.addRatePlanEnterpriseInPropertyContext();
    }
  }
  /**
   * On Policy Level Change - RateCategory and RatePlan
   * If above Policy Levels are unchecked then reset dropdown to Default Values and
   * reset selectedValues present for rateCategory / ratePlan
   */
  onPolicyLevelChange() {
    // If rateCategory Checkbox is unchecked and ratePlan Checkbox is checked
    const chainCheckbox = this.rulesData.fields.policyLevel[ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN];
    const propertyCheckbox = this.rulesData.fields.policyLevel[PROPERTY_POLICY_CREATION_LEVEL.PROPERTY];
    const rateCategoryCheckbox = this.rulesData.fields.policyLevel[PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY];
    const ratePlanCheckbox = this.rulesData.fields.policyLevel[PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN];

    // Condition to check if no policy level is checked.
    this.errorObj.policyAssignmentLevelErrorMessage.show = !(chainCheckbox || propertyCheckbox || rateCategoryCheckbox || ratePlanCheckbox);

    if (!rateCategoryCheckbox && ratePlanCheckbox) {
      if (this.rulesData.fields.rateCategory.length > 0) {
        // Reset Data for RateCategory if any item is selected from RateCategory
        this.rulesData.fields.rateCategory = [];
        // Reset Data for RateCategory if any item is selected from RateCategory List
        this.rulesData.data.rateCategories = this.sharedDataService.getPolicyMetadata(POLICY_ASSOCIATED_METADATA_TYPE.rateCategories);
        // Set Data for RatePlans which was set to Empty on RateCategory Selection
        this.rulesData.data.ratePlans = this.sharedDataService.getPolicyMetadata(POLICY_ASSOCIATED_METADATA_TYPE.ratePlans);
        this.addRatePlanEnterpriseInPropertyContext();
      }
    } else if (!ratePlanCheckbox && rateCategoryCheckbox) {
      // If ratePlan Checkbox is unchecked and rateCategory Checkbox is checked
      if (this.rulesData.fields.ratePlan.length > 0) {
        this.rulesData.fields.ratePlan = [];
        this.rateCategoryDisable = false;
        // Reset Data for RatePlan if any item is selected from RatePlan List
        this.rulesData.data.ratePlans = this.sharedDataService.getPolicyMetadata(POLICY_ASSOCIATED_METADATA_TYPE.ratePlans);
        this.addRatePlanEnterpriseInPropertyContext();
      }
    } else if (!rateCategoryCheckbox && !ratePlanCheckbox && propertyCheckbox) {
      // If only Property checkbox is checked
      // Reset Data for RateCategory if any item is selected from RateCategory List
      this.rulesData.data.rateCategories = this.sharedDataService.getPolicyMetadata(POLICY_ASSOCIATED_METADATA_TYPE.rateCategories);
      // Reset Data for RatePlan if any item is selected from RatePlan List
      this.rulesData.data.ratePlans = this.sharedDataService.getPolicyMetadata(POLICY_ASSOCIATED_METADATA_TYPE.ratePlans);
      this.addRatePlanEnterpriseInPropertyContext();
      this.rulesData.fields.rateCategory = [];
      this.rulesData.fields.ratePlan = [];
      this.rateCategoryDisable = false;
    } else { // If ALL Policy Levels are Checked
      if (this.rulesData.fields.ratePlan.length > 0) {
        this.rateCategoryDisable = true;
      } else {
        this.rateCategoryDisable = false;
      }
      if (this.rulesData.fields.rateCategory.length > 0) {
        this.rulesData.data.ratePlans = [];
      }
    }
  }

  /**
   * Add rate plan enterprise to rates plan
   */
  addRatePlanEnterpriseInPropertyContext(): void {
    // Set Enterprise Rate
    const ratePlanNames = this.sharedDataService.getPolicySearchData().map(e => {
      if (e.uxRateCatalogs) {
        return e.uxRateCatalogs.map(e => e.rateCatalogName).concat();
      }
      return null;
    }).flat().filter(e => e !== null);
    if (this.rulesData.data['ratePlansDefault']) {
      // Reset
      this.rulesData.data.ratePlans = JSON.parse(JSON.stringify(this.rulesData.data['ratePlansDefault']));
    } else {
      this.policyMgmtSearchService.getRatePlanEnterpriseWithCategory(ratePlanNames).subscribe({
        next: ratePlansWithCategory => {
          ratePlansWithCategory.forEach(ratePlanWithCategory => {
            const categoryPos = this.rulesData.data.ratePlans.findIndex(e => e.name === ratePlanWithCategory['category']);
            const ratePlan = { name: ratePlanWithCategory['name'], id: ratePlanWithCategory['id'] };
            if (categoryPos >= 0) {
              this.rulesData.data.ratePlans[categoryPos].list.push(ratePlan);
            } else {
              const category = { name: ratePlanWithCategory['category'], list: [ratePlan] };
              this.rulesData.data.ratePlans.push(category);
            }
          });
          this.rulesData.data['ratePlansDefault'] = JSON.parse(JSON.stringify(this.rulesData.data.ratePlans));
        }
      });
    }
  }

  onEnterprisePolicyLevelChange(levelItem: string) {
    this.rulesData.fields.enterprisePolicyLevel.CHAIN = false;
    this.rulesData.fields.enterprisePolicyLevel.CHAIN_CATEGORIES = false;
    this.rulesData.fields.enterprisePolicyLevel.RATE_CATEGORIES = false;
    this.rulesData.fields.enterprisePolicyLevel.RATE_PLANS = false;

    this.rulesData.fields.enterprisePolicyLevel[levelItem] = true;
  }

  setEnterpriseDropdowns() {
    if (this.rulesData && !this.rulesData.data.chainCategories.length) {
      this.rulesData.data.chainCategories = JSON.parse(JSON.stringify(
        this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.chainCategories)));
    }
    if (this.rulesData && !this.rulesData.data.rateCategories.length) {
      this.rulesData.data.rateCategories = JSON.parse(JSON.stringify(
        this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.rateCategories)));
    }
    if (this.rulesData && !this.rulesData.data.ratePlans.length) {
      this.rulesData.data.ratePlans = JSON.parse(JSON.stringify(
        this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.rateCatalogs)));
    }
    if (this.rulesData && !this.rulesData.data.policyTemplateList.length) {
      const templateList = JSON.parse(JSON.stringify(
        this.sharedDataService.getPolicyMetadata(ENTERPRISE_POLICY_METADATA_TYPE.templates)));
      this.rulesData.data.policyTemplateList = templateList.filter(template => !!template.name);
    }
  }

  callFilterAction(): void {
    if (this.isEnterpriseLevel() && this.isTemplateType() || this.isDepositConfigType()) {
      this.onFilter();
    } else {
      this.onSearch();
    }
  }
}
