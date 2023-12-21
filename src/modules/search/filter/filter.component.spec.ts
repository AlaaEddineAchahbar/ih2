/**
 * Core angular modules
 */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TcTranslateService } from 'tc-angular-services';
import { ContextService } from '../../core/context.service';
import { RulesConfigurationService } from '../../core/rules-config.service';
import { APP_CONSTANT } from '../../../app/app.constant';
import { NgbModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedDataService } from '../../core/shared.data.service';
import { POLICY_TYPE, CONFIG_TYPE, POLICY_LEVEL } from '../../core/constants';
import { DebugElement } from '@angular/core';
import { FILTER_CONFIG } from './filter.constant';
import { FilterComponent } from './filter.component';
import { FormsModule } from '@angular/forms';
import { DropdownModule, MultilevelDropdownModule, DatePickerModule } from 'tc-angular-components';
import { PolicyMgmtSearchService } from '../policy-mgmt-search.service';
import { HTTPService } from '../../core/http.service';
import { PolicyMgmtSearchPayloadService } from '../../core/search-payload.service';
import { By } from '@angular/platform-browser';
import {
    STATUS_LIST,
    CANCELLATION_OPTIONS,
    PROPERTY_POLICY_CREATION_LEVEL,
    ENTERPRISE_POLICY_CREATION_LEVEL,
    ENTERPRISE_POLICY_LEVEL_FILTERS,
    FILTER_TYPE_OPTIONS,
    COMMON_OPTIONS
} from '../../core/rules-config.constant';
import { RulesMataDataService } from '../../core/rules-meta-data.service';
import { SharedModule } from '../../common/shared.module';
import { CommonModule } from '@angular/common';
import { PolicyMgmtUtilityService } from '../../core/utility.service';
import { ENTERPRISE_POLICY_METADATA_TYPE, POLICY_ASSOCIATED_METADATA_TYPE } from '../../core/rules.constant';
import { IPolicyMetadata } from '../../core/rules-metadata.model';
import {
  ISearchEMTemplateColumnFilter,
  ISearchEMTemplateSortModel,
  IListSearchParams,
  ISearchEMTemplateParams
} from '../policy-mgmt-search.model';
import { SEARCH_EM_SORT_OPTIONS } from '../policy-mgmt-search.constant';

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
  },
  rateCategories: [
    {
      id: 1,
      name: 'RACK'
    },
    {
      id: 2,
      name: 'CORPORATE'
    },
    {
      id: 6,
      name: 'PACKAGE'
    },
    {
      id: 12,
      name: 'NEGOTIATED'
    },
    {
      id: 7,
      name: 'PROMOTIONAL'
    },
  ]
};
const policyTemplateJson = require('../../../assets-policy-mgmt/data/policy-template-dropdown.json');
const rateCategoryJson = require('../../../assets-policy-mgmt/data/formatted-ratecategory-dropdown.json');
const ratePlanCategoryJson = require('../../../assets-policy-mgmt/data/formatted-rateplan-dropdown.json');

const enterpriseChainCategoryJson = require('../../../assets-policy-mgmt/data/enterprise-chain-categories-metadata.json');
const enterpriseRateCategoryJson = require('../../../assets-policy-mgmt/data/enterprise-rate-categories-metadata.json');
const enterpriseRateCatalogJson = require('../../../assets-policy-mgmt/data/enterprise-rate-catalogs-metadata.json');
const enterprisePolicyTemplateJson = require('../../../assets-policy-mgmt/data/enterprise-templates-metadata.json');

class MockSharedDataService {
  getHotelInfo() {
    const hotelInfo = require('../../../assets-policy-mgmt/data/hotel-info.json');
    return hotelInfo;
  }

  getMetaData() {
    return MetaData;
  }

  getPolicyMetadata(type: string) {
    if (type === POLICY_ASSOCIATED_METADATA_TYPE.templates) {
      return policyTemplateJson;
    } else if (type === POLICY_ASSOCIATED_METADATA_TYPE.rateCategories) {
      return rateCategoryJson;
    } else if (type === ENTERPRISE_POLICY_METADATA_TYPE.chainCategories) {
      return enterpriseChainCategoryJson;
    } else if (type === ENTERPRISE_POLICY_METADATA_TYPE.rateCategories) {
      return enterpriseRateCategoryJson;
    } else if (type === ENTERPRISE_POLICY_METADATA_TYPE.rateCatalogs) {
      return enterpriseRateCatalogJson;
    } else if (type === ENTERPRISE_POLICY_METADATA_TYPE.templates) {
      return enterprisePolicyTemplateJson;
    } else {
      return ratePlanCategoryJson;
    }
  }
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

describe('Filter Component', () => {
  let fixture: ComponentFixture<FilterComponent>;
  let instance: FilterComponent;
  let tcTranslateService: TcTranslateService;
  let translateService: TranslateService;
  let contextService: ContextService;
  window['CONFIG'] = {
    tokenDecodedData: APP_CONSTANT.config.tokenDecodedData,
    apiUrl: APP_CONSTANT.config.apiUrl
  };
  beforeEach((done) => {
    TestBed.configureTestingModule({
      declarations: [
        FilterComponent
      ],
      imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        FormsModule,
        DatePickerModule,
        DropdownModule,
        MultilevelDropdownModule,
        NgbModule,
        NgbDropdownModule,
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
        PolicyMgmtUtilityService,
        TcTranslateService,
        TranslateService,
        ContextService,
        RulesConfigurationService,
        {
          provide: SharedDataService,
          useClass: MockSharedDataService
        },
        PolicyMgmtSearchService,
        HTTPService,
        PolicyMgmtSearchPayloadService,
        RulesMataDataService
      ]
    }).compileComponents()
      .then(() => {
        tcTranslateService = TestBed.get(TcTranslateService);
        translateService = TestBed.get(TranslateService);
        tcTranslateService.initTranslation(translateService);
        contextService = TestBed.get(ContextService);
        done();

      });
  });

  describe('Filter for Template - Cancellation', () => {
    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
      fixture = TestBed.createComponent(FilterComponent);
      instance = fixture.componentInstance;
      fixture.detectChanges();
      done();
    });

    it('expect List Instance to be Defined', () => {
      expect(instance).toBeTruthy();
    });

    it('Should Check Rules Data for Filter and Search Payload', () => {
      const output = { ...FILTER_CONFIG['property']['template']['cancellation'] };
      expect(instance.rulesData.data.cancellationNotice).toEqual(output.data.cancellationNotice);
      expect(instance.rulesData.data.acceptedTender).toEqual(output.data.acceptedTender);
      expect(instance.rulesData.data.statusList).toEqual(output.data.statusList);
    });

    it('should check visibility of element', () => {
      expect(instance.checkVisibility('policyTemplateName')).toBeTruthy();
      expect(instance.checkVisibility('cancellationNotice')).toBeTruthy();
    });

    it('Should Call FilterChanges function for status radio button', () => {
      const radioOptions: DebugElement[] = fixture.debugElement.queryAll
        (By.css('.filter-form-container__radio-btn-options input[type="radio"]'));
      const selectedValue = radioOptions[0];
      selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });
      fixture.detectChanges();
      expect(instance.rulesData.fields.status).toEqual(STATUS_LIST.ACTIVE);
    });

    it('Should Call FilterChanges function for Cancellation Notice Radio button', () => {
      const radioOptions: DebugElement[] = fixture.debugElement.queryAll
        (By.css('.filter-form-container__radio-btn-options input[type="radio"]'));
      const selectedValue = radioOptions[3];
      selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });
      fixture.detectChanges();
      expect(instance.rulesData.fields.cancellationNotice).toEqual(CANCELLATION_OPTIONS.SAME_DAY);
    });

    xit('Should call resetFilter', () => {
      const output = { ...FILTER_CONFIG['property']['template']['cancellation'] };
      instance.resetFilter();
      fixture.detectChanges();
      expect(instance.rulesData.data.cancellationNotice).toEqual(output.data.cancellationNotice);
      expect(instance.rulesData.data.acceptedTender).toEqual(output.data.acceptedTender);
      expect(instance.rulesData.data.statusList).toEqual(output.data.statusList);
    });

    it('Should call getSearchPayload', () => {
      const elTempName = fixture.debugElement.query(By.css('#policyTemplateName'));
      elTempName.nativeElement.value = 'Sample Template1';
      elTempName.nativeElement.dispatchEvent(new Event('input'));

      const radioOptions: DebugElement[] = fixture.debugElement.queryAll
        (By.css('.filter-form-container__radio-btn-options input[type="radio"]'));
      const selectedStatus = radioOptions[1];
      selectedStatus.triggerEventHandler('change', { target: selectedStatus.nativeElement });
      fixture.detectChanges();

      const selectedValue = radioOptions[3];
      selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });
      fixture.detectChanges();

      const output = {
        cancellationNotice: 'SAME_DAY',
        isFreeCancellation: 2,
        level: 'BOTH',
        policyTemplateName: 'Sample Template1',
        status: 'INACTIVE'
      };
      const result = instance.getSearchPayload();
      expect(result).toEqual(output);
    });

    it('Should call toggleFilters', () => {
      instance.toggleFilters();
      fixture.detectChanges();
      expect(instance.hideFilterPanel).toBeTruthy();
      instance.toggleFilters();
      fixture.detectChanges();
      expect(instance.hideFilterPanel).toBeFalsy();
    });

  });
  describe('Filter for Template - Guarantee', () => {
    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
      fixture = TestBed.createComponent(FilterComponent);
      instance = fixture.componentInstance;
      fixture.detectChanges();
      done();
    });

    it('expect List Instance to be Defined', () => {
      expect(instance).toBeTruthy();
    });

    it('Should Check Rules Data for Filter and Search Payload', () => {
      const output = { ...FILTER_CONFIG['property']['template']['guarantee'] };
      expect(instance.rulesData.data.acceptedTender).toEqual(output.data.acceptedTender);
      expect(instance.rulesData.data.statusList).toEqual(output.data.statusList);

    });

    it('should check visibility of element', () => {
      expect(instance.checkVisibility('policyTemplateName')).toBeTruthy();
      expect(instance.checkVisibility('acceptedTender')).toBeTruthy();
    });

    it('Should Call FilterChanges function for status radio button', () => {
      const radioOptions: DebugElement[] = fixture.debugElement.queryAll
        (By.css('.filter-form-container__radio-btn-options input[type="radio"]'));
      const selectedValue = radioOptions[0];
      selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });
      fixture.detectChanges();
      expect(instance.rulesData.fields.status).toEqual(STATUS_LIST.ACTIVE);
    });

    it('Should Call FilterChanges function for Accepted Tender Radio button', () => {
      const radioOptions: DebugElement[] = fixture.debugElement.queryAll
        (By.css('.filter-form-container__radio-btn-options input[type="radio"]'));
      const selectedValue = radioOptions[5];
      selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });
      fixture.detectChanges();
      expect(instance.rulesData.fields.acceptedTender).not.toEqual(0);
    });

    it('Should call getSearchPayload', () => {
      const elTempName = fixture.debugElement.query(By.css('#policyTemplateName'));
      elTempName.nativeElement.value = 'Sample Template1';
      elTempName.nativeElement.dispatchEvent(new Event('input'));

      const radioOptions: DebugElement[] = fixture.debugElement.queryAll
        (By.css('.filter-form-container__radio-btn-options input[type="radio"]'));
      const selectedStatus = radioOptions[0];
      selectedStatus.triggerEventHandler('change', { target: selectedStatus.nativeElement });
      fixture.detectChanges();

      const selectedValue = radioOptions[5];
      selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });
      fixture.detectChanges();

      const output = {
        acceptedTender: 16,
        level: 'BOTH',
        policyTemplateName: 'Sample Template1',
        status: 'ACTIVE'
      };
      const result = instance.getSearchPayload();
      expect(result).toEqual(output);
    });
  });

  describe('Filter for Template - Deposit', () => {
    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
      fixture = TestBed.createComponent(FilterComponent);
      instance = fixture.componentInstance;
      fixture.detectChanges();
      done();
    });

    it('expect List Instance to be Defined', () => {
      expect(instance).toBeTruthy();
    });

    it('Should Check Rules Data for Filter and Search Payload', () => {
      const output = { ...FILTER_CONFIG['property']['template']['deposit'] };
      expect(instance.rulesData.data.acceptedTender).toEqual(output.data.acceptedTender);
      expect(instance.rulesData.data.statusList).toEqual(output.data.statusList);
      expect(instance.rulesData.data.installmentsList).toEqual(output.data.installmentsList);

    });

    it('should check visibility of element', () => {
      expect(instance.checkVisibility('policyTemplateName')).toBeTruthy();
      expect(instance.checkVisibility('acceptedTender')).toBeTruthy();
    });

    it('Should Call FilterChanges function for status radio button', () => {
      const radioOptions: DebugElement[] = fixture.debugElement.queryAll
        (By.css('.filter-form-container__radio-btn-options input[type="radio"]'));
      const selectedValue = radioOptions[0];
      selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });
      fixture.detectChanges();
      expect(instance.rulesData.fields.status).toEqual(STATUS_LIST.ACTIVE);
    });

    it('Should Call FilterChanges function for Accepted Tender Radio button', () => {
      const radioOptions: DebugElement[] = fixture.debugElement.queryAll
        (By.css('.filter-form-container__radio-btn-options input[type="radio"]'));
      const selectedValue = radioOptions[2];
      selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });
      fixture.detectChanges();
      expect(instance.rulesData.fields.acceptedTender).toEqual(0);
    });

    it('Should call getSearchPayload', () => {
      const elTempName = fixture.debugElement.query(By.css('#policyTemplateName'));
      elTempName.nativeElement.value = 'Sample Template1';
      elTempName.nativeElement.dispatchEvent(new Event('input'));

      const radioOptions: DebugElement[] = fixture.debugElement.queryAll
        (By.css('.filter-form-container__radio-btn-options input[type="radio"]'));
      const selectedStatus = radioOptions[0];
      selectedStatus.triggerEventHandler('change', { target: selectedStatus.nativeElement });
      fixture.detectChanges();

      const selectedValue = radioOptions[2];
      selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });
      fixture.detectChanges();

      const output = {
        acceptedTender: 0,
        level: 'BOTH',
        policyTemplateName: 'Sample Template1',
        status: 'ALL',
        isInstallmentEnabled: ''
      };
      const result = instance.getSearchPayload();
      expect(result).toEqual(output);
    });
  });
  describe('Filter for Policy', () => {
    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
      contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
      contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
      fixture = TestBed.createComponent(FilterComponent);
      instance = fixture.componentInstance;
      instance.dropdownLabels.placeholderText = 'Filter';
      instance.dropdownLabels.customLabels = {
        selectAll: 'Select All',
        clearAll: 'Clear All',
        expandAll: 'Expand All',
        collapseAll: 'Collapse All'
      };

      instance.dropdownLabels.defaultRatePlanText = [
        { selectionText: ('Number of Rate Plans Selected').replace('{{count}}', '') },
        { selectionText: 'All RatePlans Selected' },
        { selectionText: 'Select RatePlans' }
      ];

      instance.dropdownLabels.defaultRateCategoryText = [
        { selectionText: ('Number of Rate Categories Selected').replace('{{count}}', '') },
        { selectionText: 'All Categories Selected' },
        { selectionText: 'Select Rate Catgories' }
      ];
      fixture.detectChanges();
      spyOn(instance,'addRatePlanEnterpriseInPropertyContext');
      done();
    });

    it('expect List Instance to be Defined', () => {
      expect(instance).toBeTruthy();
    });
    it('Should Call onStartDateChange', () => {
      instance.onStartDateChange('2020-07-29');
      expect(instance.rulesData.fields.dateRange.startDate).toEqual('2020-07-29');
    });
    it('Should Call onEndDateChange', () => {
      instance.onEndDateChange('2020-07-29');
      expect(instance.rulesData.fields.dateRange.endDate).toEqual('2020-07-29');
    });
    it('Should Call onClearDates', () => {
      instance.onClearDate();
      expect(instance.rulesData.fields.dateRange.startDate).toEqual('');
      expect(instance.rulesData.fields.dateRange.endDate).toEqual('');
    });
    it('Should Call onPolicyTemplateSelectionChange', () => {
      const evt = {
        selectedIndex: 0,
        selectedObject: {
          id: '1',
          name: 'Test Policy Template'
        }
      };
      instance.onPolicyTemplateSelectionChange(evt);
      expect(instance.rulesData.fields.policyTemplateId).toEqual('1');
    });
    it('Should Call onRateCategorySelectionChange with 1 RateCategory Selected', () => {
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(rateCategoryJson));
      const obj = {
        name: 'Test RateCateogry',
        id: '100'
      };
      selectedObject[0] = obj;
      selectedObject[0].visible = true;
      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onRateCategorySelectionChange(selectionObject);
      expect(instance.rulesData.fields.rateCategory[0]).toEqual('100');
    });
    it('Should Call onRateCategorySelectionChange when Clear All Button is clicked', () => {
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(rateCategoryJson));
      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onRateCategorySelectionChange(selectionObject);
      expect(instance.rulesData.fields.rateCategory.length).toEqual(0);
    });
    it('Should Call onRatePlanSelectionChange with 1 RatePlan Selected', () => {
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(ratePlanCategoryJson));
      const obj = {
        name: 'Test RatePlan',
        id: '1'
      };
      selectedObject[0].list[0] = obj;
      selectedObject[0].expanded = true;
      selectedObject[0].list[0].selected = true;

      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onRatePlanSelectionChange(selectionObject);
      expect(instance.rulesData.fields.ratePlan[0]).toEqual('1');
      expect(instance.rateCategoryDisable).toBeTruthy();
    });

    it('Should Call onRatePlanSelectionChange when Clear All Button is clicked', () => {
      instance.resetFilter();
      expect(instance.rulesData.fields.ratePlan.length).toEqual(0);
      expect(instance.rateCategoryDisable).toBeFalsy();
    });

    it('Should Call on onPolicyLevelChange when RateCategory is unchecked and RatePlan is checked', () => {
      instance.rulesData.fields.policyLevel.RATECATEGORY = false;
      instance.rulesData.fields.policyLevel.RATEPLAN = true;
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(rateCategoryJson));
      const obj = {
        name: 'Test RateCateogry',
        id: '100'
      };
      selectedObject[0] = obj;
      selectedObject[0].visible = true;
      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onRateCategorySelectionChange(selectionObject);
      instance.onPolicyLevelChange();
      expect(instance.rulesData.fields.rateCategory.length).toEqual(0);
    });

    it('Should Call on onPolicyLevelChange when RatePlan is unchecked and RateCategory is checked', () => {
      instance.rulesData.fields.policyLevel.RATECATEGORY = true;
      instance.rulesData.fields.policyLevel.RATEPLAN = false;
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(ratePlanCategoryJson));
      const obj = {
        name: 'Test RatePlan',
        id: '1'
      };
      selectedObject[0].list[0] = obj;
      selectedObject[0].expanded = true;
      selectedObject[0].list[0].selected = true;
      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onRatePlanSelectionChange(selectionObject);
      instance.onPolicyLevelChange();
      expect(instance.rulesData.fields.ratePlan.length).toEqual(0);
      expect(instance.rateCategoryDisable).toBeFalsy();
    });

    it('Should Call on onPolicyLevelChange when only Property is checked', () => {
      instance.onPolicyLevelChange();
      expect(instance.rulesData.data.ratePlans.length).toBeGreaterThan(0);
      expect(instance.rulesData.data.rateCategories.length).toBeGreaterThan(0);
      expect(instance.rateCategoryDisable).toBeFalsy();
    });

    it('Should Call on onPolicyLevelChange when ALL Checkboxes are unchecked and', () => {
      instance.rulesData.fields.policyLevel.RATECATEGORY = true;
      instance.rulesData.fields.policyLevel.RATEPLAN = true;
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(ratePlanCategoryJson));
      const obj = {
        name: 'Test RatePlan',
        id: '1'
      };
      selectedObject[0].list[0] = obj;
      selectedObject[0].expanded = true;
      selectedObject[0].list[0].selected = true;
      const selectionObject = {
        dropdownItems: selectedObject
      };
      instance.onRatePlanSelectionChange(selectionObject);
      instance.onPolicyLevelChange();
      expect(instance.rateCategoryDisable).toBeTruthy();
    });

    it('should call searchPoliciesByRatePlanInContext and search policies associated to provided rate plan id', () => {
      spyOn(instance.search, 'emit');
      fixture.detectChanges();
      instance.ratePlanId = '3745574';
      instance.searchPoliciesByRatePlanInContext();
      expect(instance.rulesData.fields.policyLevel).toEqual({
        [PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN]: true
      });
      expect(instance.rateCategoryDisable).toBeTruthy();
      expect(instance.rulesData.fields.ratePlan).toEqual(['3745574']);
      expect(instance.search.emit).toHaveBeenCalledWith({
        endDate: '',
        policyLevel: ['RATEPLAN'],
        policyName: '',
        policyTemplateId: '',
        policyTemplateName: undefined,
        rateCategory: [],
        ratePlan: ['3745574'],
        startDate: '',
        status: 'ACTIVE'
      });
    });
  });

  describe('filter for enterprise policy', () => {
    beforeEach((done) => {
      contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
      contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
      contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
      fixture = TestBed.createComponent(FilterComponent);
      instance = fixture.componentInstance;
      instance.dropdownLabels.placeholderText = 'Filter';
      instance.dropdownLabels.customLabels = {
        selectAll: 'Select All',
        clearAll: 'Clear All',
        expandAll: 'Expand All',
        collapseAll: 'Collapse All'
      };

      instance.dropdownLabels.defaultRatePlanText = [
        { selectionText: ('Number of Rate Plans Selected').replace('{{count}}', '') },
        { selectionText: 'All RatePlans Selected' },
        { selectionText: 'Select RatePlans' }
      ];

      instance.dropdownLabels.defaultRateCategoryText = [
        { selectionText: ('Number of Rate Categories Selected').replace('{{count}}', '') },
        { selectionText: 'All Categories Selected' },
        { selectionText: 'Select Rate Catgories' }
      ];

      instance.dropdownLabels.defaultChainCategoryText = [
        { selectionText: ('Number of Rate Categories Selected').replace('{{count}}', '') },
        { selectionText: 'All Categories Selected' },
        { selectionText: 'Select Rate Catgories' }
      ];

      fixture.detectChanges();
      done();
    });

    function setupSearchPayload() {
      instance.rulesData.fields.chainCategory = ['1'];
      instance.rulesData.fields.rateCategory = ['2'];
      instance.rulesData.fields.ratePlan = ['3'];
      instance.rulesData.fields.policyName = 'policy';
      instance.rulesData.fields.policyTemplateId = '123';
      instance.rulesData.fields.dateRange.startDate = '2023-05-05';
      instance.rulesData.fields.dateRange.endDate = '2023-06-06';
      instance.rulesData.fields.status = 'ACTIVE';
      const expectedSearchPayload: IListSearchParams = {
        policyName: instance.rulesData.fields.policyName,
        policyTemplateId: instance.rulesData.fields.policyTemplateId,
        startDate: instance.rulesData.fields.dateRange.startDate,
        endDate: instance.rulesData.fields.dateRange.endDate,
        status: instance.rulesData.fields.status,
        policyTemplateName: undefined
      };
      return expectedSearchPayload;
    }

    it('should expect filter to be defined', () => {
      expect(instance).toBeTruthy();
    });

    it('should call onEnterprisePolicyLevelChange', () => {
      // act
      instance.onEnterprisePolicyLevelChange('RATE_PLANS');

      // assert
      expect(instance.rulesData.fields.enterprisePolicyLevel.CHAIN).toBe(false);
      expect(instance.rulesData.fields.enterprisePolicyLevel.CHAIN_CATEGORIES).toBe(false);
      expect(instance.rulesData.fields.enterprisePolicyLevel.RATE_CATEGORIES).toBe(false);
      expect(instance.rulesData.fields.enterprisePolicyLevel.RATE_PLANS).toBe(true);
    });

    it('Should Call onPolicyTemplateSelectionChange', () => {
      // arrange
      const evt = {
        selectedIndex: 0,
        selectedObject: {
          id: '1',
          name: 'Test Policy Template'
        }
      };

      // act
      instance.onPolicyTemplateSelectionChange(evt);

      // assert
      expect(instance.rulesData.fields.policyTemplateId).toEqual('1');
    });

    it('should call onEnterpriseRateCategorySelectionChange', () => {
      // arrange
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(enterpriseRateCategoryJson));
      const obj = {
        name: 'Test RateCateogry',
        id: '100'
      };
      selectedObject[0] = obj;
      selectedObject[0].visible = true;
      const selectionObject = {
        dropdownItems: selectedObject
      };

      // act
      instance.onRateCategorySelectionChange(selectionObject);

      // assert
      expect(instance.rulesData.fields.rateCategory).toEqual(['100']);
    });

    it('should call onEnterpriseRatePlanSelectionChange', () => {
      // arrange
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(enterpriseRateCatalogJson));
      const obj = {
        name: 'Test RateCatalog',
        id: '100'
      };
      selectedObject[0] = obj;
      selectedObject[0].visible = true;
      const selectionObject = {
        dropdownItems: selectedObject
      };

      // act
      instance.onEnterpriseRatePlanSelectionChange(selectionObject);

      // assert
      expect(instance.rulesData.fields.ratePlan).toEqual(['100']);
    });

    it('should call onEnterpriseChainCategorySelectionChange', () => {
      // arrange
      const selectedObject: Array<IPolicyMetadata> = JSON.parse(JSON.stringify(enterpriseChainCategoryJson));
      const obj = {
        name: 'Test ChainCategory',
        id: '100',
        list: [
          {
            name: '1',
            id: '1',
            selected: true
          },
          {
            name: '2',
            id: '2',
            selected: false
          },
          {
            name: '3',
            id: '3',
            selected: true
          }
        ]
      };
      selectedObject[0] = obj;
      selectedObject[0].visible = true;
      const selectionObject = {
        dropdownItems: selectedObject
      };

      // act
      instance.onEnterpriseChainCategorySelectionChange(selectionObject);

      // assert
      expect(instance.rulesData.fields.chainCategory).toEqual(['1', '3']);
    });

    it('should call getSearchPayload for policy level CHAIN_CATEGORIES', () => {
      // arrange
      const expectedSearchPayload = setupSearchPayload();
      instance.rulesData.fields.enterprisePolicyLevel.CHAIN_CATEGORIES = true;
      expectedSearchPayload.policyLevel = [ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN_CATEGORIES];
      expectedSearchPayload.chainCategories = instance.rulesData.fields.chainCategory;

      // act
      const searchPayload = instance.getSearchPayload();

      // assert
      expect(searchPayload).toEqual(expectedSearchPayload);
    });

    it('should call getSearchPayload for policy level RATE_CATEGORIES', () => {
      // arrange
      const expectedSearchPayload = setupSearchPayload();
      instance.rulesData.fields.enterprisePolicyLevel.RATE_CATEGORIES = true;
      expectedSearchPayload.policyLevel = [ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_CATEGORIES];
      expectedSearchPayload.rateCategory = instance.rulesData.fields.rateCategory;

      // act
      const searchPayload = instance.getSearchPayload();

      // assert
      expect(searchPayload).toEqual(expectedSearchPayload);
    });

    it('should call getSearchPayload for policy level RATE_PLANS', () => {
      // arrange
      const expectedSearchPayload = setupSearchPayload();
      instance.rulesData.fields.enterprisePolicyLevel.RATE_PLANS = true;
      expectedSearchPayload.policyLevel = [ENTERPRISE_POLICY_LEVEL_FILTERS.RATE_PLANS];
      expectedSearchPayload.ratePlan = instance.rulesData.fields.ratePlan;

      // act
      const searchPayload = instance.getSearchPayload();

      // assert
      expect(searchPayload).toEqual(expectedSearchPayload);
    });

    it('should call getSearchPayload for policy level CHAIN', () => {
      // arrange
      const expectedSearchPayload = setupSearchPayload();
      instance.rulesData.fields.enterprisePolicyLevel.CHAIN = true;
      expectedSearchPayload.policyLevel = [ENTERPRISE_POLICY_LEVEL_FILTERS.CHAIN];

      // act
      const searchPayload = instance.getSearchPayload();

      // assert
      expect(searchPayload).toEqual(expectedSearchPayload);
    });
  });

  describe('Filter for Enterprise Templates', () => {

    describe('Filter for Cancellation', () => {
      beforeEach((done) => {
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        fixture = TestBed.createComponent(FilterComponent);
        instance = fixture.componentInstance;
        fixture.detectChanges();
        done();
      });

      it('expect List Instance to be Defined', () => {
        // Assert
        expect(instance).toBeTruthy();
      });

      it('Should Check Rules Data for Filter and Search Payload', () => {
        // Arrange
        const output = { ...FILTER_CONFIG['enterprise']['template']['cancellation'] };

        // Assert
        expect(instance.rulesData.data.cancellationNotice).toEqual(output.data.cancellationNotice);
        expect(instance.rulesData.data.acceptedTender).toEqual(output.data.acceptedTender);
        expect(instance.rulesData.data.statusList).toEqual(output.data.statusList);

      });

      it('should check visibility of element', () => {
        // Assert
        expect(instance.checkVisibility('policyTemplateName')).toBeTruthy();
        expect(instance.checkVisibility('cancellationNotice')).toBeTruthy();
      });

      it('Should Call FilterChanges function for status ALL radio button', () => {
        // Arrange
        const radioOptions: DebugElement[] = fixture.debugElement.queryAll(
          By.css('.filter-form-container__radio-btn-options input[type="radio"]')
        );
        const selectedValue = radioOptions[2];
        selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });

        // Act
        fixture.detectChanges();

        // Assert
        expect(instance.rulesData.fields.status).toEqual(STATUS_LIST.ALL_STATUS);
      });

      it('Should call getSearchPayloadEMPolicyTemplate', () => {
        // Arrange
        const elTempName = fixture.debugElement.query(By.css('#policyTemplateName'));
        elTempName.nativeElement.value = 'Sample Entyerprise Template1';
        elTempName.nativeElement.dispatchEvent(new Event('input'));

        const radioOptions: DebugElement[] = fixture.debugElement.queryAll(
          By.css('.filter-form-container__radio-btn-options input[type="radio"]')
        );
        const selectedStatus = radioOptions[1];
        selectedStatus.triggerEventHandler('change', { target: selectedStatus.nativeElement });
        fixture.detectChanges();

        const selectedValue = radioOptions[3];
        selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });
        fixture.detectChanges();

        const output: ISearchEMTemplateParams = {
          offSet: 1,
          maxEntries: 25,
          filterModel: {
            status: {
              filterType: FILTER_TYPE_OPTIONS.EQUAL,
              value: STATUS_LIST.INACTIVE
            },
            emPolicyTemplateName: {
              filterType: FILTER_TYPE_OPTIONS.LIKE,
              value: 'Sample Entyerprise Template1'
            },
            cancellationNotice: {
              filterType: FILTER_TYPE_OPTIONS.EQUAL,
              value: 'SAME_DAY'
            },
            acceptedTender: undefined,
            isInstallmentEnabled: undefined
          },
          sortModel: [
            {
              fieldName: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_FIELD_NAME,
              sortType: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_DESC_SORT_TYPE
            }
          ]
        };

        // Act
        const result = instance.getSearchPayload();

        // Assert
        expect(result).toEqual(output);
      });

    });


    describe('Filter for Guarantee', () => {
      beforeEach((done) => {
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        contextService.setPolicyType(POLICY_TYPE.GUARANTEE);
        fixture = TestBed.createComponent(FilterComponent);
        instance = fixture.componentInstance;
        fixture.detectChanges();
        done();
      });

      it('expect List Instance to be Defined', () => {
        // Assert
        expect(instance).toBeTruthy();
      });

      it('Should Check Rules Data for Filter and Search Payload', () => {
        // Arrange
        const output = { ...FILTER_CONFIG['enterprise']['template']['guarantee'] };

        // Assert
        expect(instance.rulesData.data.acceptedTender).toEqual(output.data.acceptedTender);
        expect(instance.rulesData.data.statusList).toEqual(output.data.statusList);
      });

      it('Should call getSearchPayloadEMPolicyTemplate', () => {
        // Arrange
        const elTempName = fixture.debugElement.query(By.css('#policyTemplateName'));
        elTempName.nativeElement.value = 'Sample guarantee Template';
        elTempName.nativeElement.dispatchEvent(new Event('input'));

        const radioOptions: DebugElement[] = fixture.debugElement.queryAll(
          By.css('.filter-form-container__radio-btn-options input[type="radio"]')
        );
        const selectedStatus = radioOptions[0];
        selectedStatus.triggerEventHandler('change', { target: selectedStatus.nativeElement });
        fixture.detectChanges();

        const selectedValue = radioOptions[5];
        selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });
        fixture.detectChanges();

        const output: ISearchEMTemplateParams = {
          offSet: 1,
          maxEntries: 25,
          filterModel: {
            status: {
              filterType: FILTER_TYPE_OPTIONS.EQUAL,
              value: STATUS_LIST.ACTIVE
            },
            emPolicyTemplateName: {
              filterType: FILTER_TYPE_OPTIONS.LIKE,
              value: 'Sample guarantee Template'
            },
            acceptedTender: {
              filterType: FILTER_TYPE_OPTIONS.EQUAL,
              value: '16'
            },
            cancellationNotice: undefined,
            isInstallmentEnabled: undefined
          },
          sortModel: [
            {
              fieldName: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_FIELD_NAME,
              sortType: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_DESC_SORT_TYPE
            }
          ]
        };

        // Act
        const result = instance.getSearchPayload();

        // Assert
        expect(result).toEqual(output);
      });
    });


    describe('Filter for  Deposit', () => {
      beforeEach((done) => {
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        fixture = TestBed.createComponent(FilterComponent);
        instance = fixture.componentInstance;
        fixture.detectChanges();
        done();
      });

      it('expect List Instance to be Defined', () => {
        // Assert
        expect(instance).toBeTruthy();
      });

      it('Should Check Rules Data for Filter and Search Payload', () => {
        // Arrange
        const output = { ...FILTER_CONFIG['enterprise']['template']['deposit'] };

        // Assert
        expect(instance.rulesData.data.acceptedTender).toEqual(output.data.acceptedTender);
        expect(instance.rulesData.data.statusList).toEqual(output.data.statusList);
        expect(instance.rulesData.data.installmentsList).toEqual(output.data.installmentsList);

      });

      it('should check visibility of element', () => {
        // Assert
        expect(instance.checkVisibility('policyTemplateName')).toBeTruthy();
        expect(instance.checkVisibility('acceptedTender')).toBeTruthy();
      });

      it('Should call getSearchPayloadEMPolicyTemplate', () => {
        // Arrange
        const elTempName = fixture.debugElement.query(By.css('#policyTemplateName'));
        elTempName.nativeElement.value = 'Sample deposit Template';
        elTempName.nativeElement.dispatchEvent(new Event('input'));

        const radioOptions: DebugElement[] = fixture.debugElement.queryAll(
          By.css('.filter-form-container__radio-btn-options input[type="radio"]')
        );
        const selectedStatus = radioOptions[0];
        selectedStatus.triggerEventHandler('change', { target: selectedStatus.nativeElement });
        fixture.detectChanges();

        const selectedValue = radioOptions[2];
        selectedValue.triggerEventHandler('change', { target: selectedValue.nativeElement });
        fixture.detectChanges();

        const output: ISearchEMTemplateParams = {
          offSet: 1,
          maxEntries: 25,
          filterModel: {
            status: {
              filterType: FILTER_TYPE_OPTIONS.EQUAL,
              value: COMMON_OPTIONS.ALL
            },
            emPolicyTemplateName: {
              filterType: FILTER_TYPE_OPTIONS.LIKE,
              value: 'Sample deposit Template'
            },
            isInstallmentEnabled: {
              filterType: FILTER_TYPE_OPTIONS.EQUAL,
              value: ''
            },
            cancellationNotice: undefined,
            acceptedTender: undefined
          },
          sortModel: [
            {
              fieldName: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_FIELD_NAME,
              sortType: SEARCH_EM_SORT_OPTIONS.LAST_MODIFIED_DATE_DESC_SORT_TYPE
            }
          ]
        };

        // Act
        const result = instance.getSearchPayload();

        // Assert
        expect(result).toEqual(output);
      });
    });

  });

  describe('Check the call filter action is correct (depend on context)', () => {
    beforeEach((done) => {
      fixture = TestBed.createComponent(FilterComponent);
      instance = fixture.componentInstance;
      done();
    });

    it('When is policy template type enterprise callFilterAction should call have onFilter method', () => {
      // Arrange
      contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
      contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
      contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
      spyOn(instance, 'onFilter');

      // Act
      instance.callFilterAction();

      // Assert
      expect(instance.onFilter).toHaveBeenCalledOnceWith();
    });

    it('When is deposit configuration callFilterAction should call have onFilter method', () => {
      // Arrange
      contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
      spyOn(instance, 'onFilter');

      // Act
      instance.callFilterAction();

      // Assert
      expect(instance.onFilter).toHaveBeenCalledOnceWith();
    });

    it('When is not deposit configuration or enterprise  policy template callFilterAction should call have search method', () => {
      // Arrange
      contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
      spyOn(instance, 'onSearch');

      // Act
      instance.callFilterAction();

      // Assert
      expect(instance.onSearch).toHaveBeenCalledOnceWith();
    });

  });


});
