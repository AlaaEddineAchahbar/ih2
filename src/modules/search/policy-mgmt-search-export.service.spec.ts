// Angular imports
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

// Third party imports
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { TcTranslateService } from 'tc-angular-services';

// Application level imports
import { CONFIG_TYPE, POLICY_LEVEL, POLICY_TYPE } from '../core/constants';
import { ContextService } from '../core/context.service';
import { HTTPService } from '../core/http.service';
import { PolicyMgmtSearchPayloadService } from '../core/search-payload.service';
import { SharedDataService } from '../core/shared.data.service';
import { TranslationMap } from '../core/translation.constant';
import { PolicyMgmtUtilityService } from '../core/utility.service';
import { PolicyMgmtCreateTemplateService } from '../create/template/policy-mgmt-create-template.service';
import { PolicyMgmtListParsingService } from './list/policy-mgmt-list-parsing.service';
import { PolicyMgmtSearchExportService } from './policy-mgmt-search-export.service';
import { PolicyMgmtSearchPolicyService } from './policy-mgmt-search-policies.service';
import {
    IEnterpriseDepositConfigurationCsvModel,
    IEnterprisePolicyTemplateCancellationCsvModel,
    IPolicyCsvModel,
    IPropertyDepositConfigurationCsvModel,
    IPropertyPolicyTemplateCancellationCsvModel,
    IPropertyPolicyTemplateDepositCsvModel,
    IPropertyPolicyTemplateGuaranteeCsvModel
} from './policy-mgmt-search.model';
import { PolicyMgmtSearchService } from './policy-mgmt-search.service';

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
  return new TcTranslateService().loadTranslation(http, langApiUrl, '?include=admin-ui');
}

const contextSettings = {
  policyLevel: POLICY_LEVEL.ENTERPRISE,
  configType: CONFIG_TYPE.POLICY,
  policyType: POLICY_TYPE.CANCELLATION
};

/**
 * Mocks
 */
const spySearchPayloadService = jasmine.createSpyObj('PolicyMgmtSearchPayloadService',
  ['setSearchPayload', 'setSearchEMPayload', 'getSearchPayload', 'resetSearchPayload']);
const spyCreateTemplateService = jasmine.createSpyObj('PolicyMgmtCreateTemplateService', ['loadDepositRuleListInfo']);
spyCreateTemplateService.loadDepositRuleListInfo.and.returnValue(Promise.resolve());
const spyUtilityService = jasmine.createSpyObj('PolicyMgmtUtilityService', ['exportToCSV', 'getStartDate']);
spyUtilityService.getStartDate.and.returnValue(new Date());

/**
 * Mock Policy Search Service
 */
class MockPolicySearchService {
  searchPolicies() {
    const isEnterpriseLevel = contextSettings.policyLevel === POLICY_LEVEL.ENTERPRISE;
    switch (contextSettings.configType) {
      case CONFIG_TYPE.POLICY:
        const policies = isEnterpriseLevel
          ? require('src/assets-policy-mgmt/data/export/enterprise/policies.json')
          : require('src/assets-policy-mgmt/data/export/Property/policies.json');
        return of(policies);
      case CONFIG_TYPE.TEMPLATE:
        switch (contextSettings.policyType) {
          case POLICY_TYPE.CANCELLATION:
            const templatesCancellation = isEnterpriseLevel
              ? require('src/assets-policy-mgmt/data/export/enterprise/template-cancellation.json')
              : require('src/assets-policy-mgmt/data/export/Property/template-cancellation.json');
            return of(templatesCancellation);
          case POLICY_TYPE.GUARANTEE:
            const templatesGuarantee = isEnterpriseLevel
              ? require('src/assets-policy-mgmt/data/export/enterprise/template-guarantee.json')
              : require('src/assets-policy-mgmt/data/export/Property/template-guarantee.json');
            return of(templatesGuarantee);
          case POLICY_TYPE.DEPOSIT:
            const templatesDeposit = isEnterpriseLevel
              ? require('src/assets-policy-mgmt/data/export/enterprise/template-deposit.json')
              : require('src/assets-policy-mgmt/data/export/Property/template-deposit.json');
            return of(templatesDeposit);
        }
    }
    return of([]);
  }

  searchDepositConfiguration() {
    if (contextSettings.policyLevel === POLICY_LEVEL.ENTERPRISE) {
      const enterpriseDepositConfiguration = require('src/assets-policy-mgmt/data/export/enterprise/payment-deposit-rule.json');
      return of(enterpriseDepositConfiguration);
    } else {
      const propertyDepositConfiguration = require('src/assets-policy-mgmt/data/export/Property/payment-deposit-rule.json');
      return of(propertyDepositConfiguration);
    }
  }
};

/**
 * Mock Context Service
 */
class MockContextService {
  get policyLevel() {
    return contextSettings.policyLevel;
  }

  get configTypeName() {
    return contextSettings.configType;
  }

  get policyType() {
    return contextSettings.policyType;
  }
}

/**
 * Mock Shared Data Service
 */
class MockSharedDataService {
  getLanguages() {
    return {
      languages: [
        {
          id: 1,
          languageName: 'English (US)',
          languageCode: 'EN_US'
        },
        {
          id: 2,
          languageName: 'Spanish',
          nativeLanguage: 'Español',
          languageCode: 'ES_ES'
        }
      ]
    };
  }

  getHotelInfo() {
    return {
      currencies: [{
        currencyId: 4,
        currencyCode: 'EUR',
        isDefault: true
      }]
    };
  }

  getDepositRulesList() {
    return [
      {
        depositRuleId: 1001,
        name: 'Test deposit rule'
      }
    ];
  }

  getPolicyMetadata(type) {
    return [{
      id: '1',
      name: 'Test Meta 1',
      list: [{
        id: '1001',
        name: 'Test List 1'
      }]
    }, {
      id: '2',
      name: 'Test Meta 2',
      list: [{
        id: '2001',
        name: 'Test List 2'
      }]
    }];
  }
}

/**
 * Mock Search Policy Service
 */
class MockSearchPolicyService {
  private policies;

  setPolicySearchData(policies) {
    this.policies = policies;
  }

  getFilteredSearchData(searchPayload) {
    return this.policies;
  }

}

describe('Policy Mgmt Search Export Service', () => {
  let tcTranslateService: TcTranslateService;
  let translateService: TranslateService;
  let exportService: PolicyMgmtSearchExportService;

  beforeEach((done) => {
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
        {
          provide: PolicyMgmtUtilityService,
          useValue: spyUtilityService
        },
        {
          provide: PolicyMgmtSearchPayloadService,
          useValue: spySearchPayloadService
        },
        {
          provide: PolicyMgmtCreateTemplateService,
          useValue: spyCreateTemplateService
        },
        {
          provide: PolicyMgmtSearchService,
          useClass: MockPolicySearchService
        },
        {
          provide: ContextService,
          useClass: MockContextService
        },
        {
          provide: SharedDataService,
          useClass: MockSharedDataService
        },
        {
          provide: PolicyMgmtSearchPolicyService,
          useClass: MockSearchPolicyService
        },
        PolicyMgmtSearchExportService,
        PolicyMgmtListParsingService,
        TranslateService,
        TcTranslateService,
        HTTPService,
      ]
    });
    tcTranslateService = TestBed.inject(TcTranslateService);
    translateService = TestBed.inject(TranslateService);
    tcTranslateService.initTranslation(translateService);
    exportService = TestBed.inject(PolicyMgmtSearchExportService);

    // wait until translations are loaded
    translateService.get(TranslationMap.EXPORT).subscribe((res: string) => {
      done();
    });
  });

  it('Export service should be created', () => {
    expect(exportService).toBeTruthy();
  });

  it('Should reset search payload after the download', () => {
    // Act
    exportService.exportCsvData([]);

    // Assert
    expect(spySearchPayloadService.resetSearchPayload).toHaveBeenCalled();
  });

  describe('Export: Enterprise level', () => {
    beforeEach(() => {
      contextSettings.policyLevel = POLICY_LEVEL.ENTERPRISE;
    });

    it('Should export enterprise payment deposit configuration', () => {
      // Arrange
      contextSettings.configType = CONFIG_TYPE.DEPOSIT_CONFIGURATION;
      const expectedData: IEnterpriseDepositConfigurationCsvModel[] = [{
        DEPOSIT_CONFIGURATION_NAME: 'Enterprise Test Deposit Configuration',
        CHARGE_DATE: 'Time of Booking',
        PERCENTAGE_AMOUNT: '2.00%',
        ARRIVAL_DAY: 'Yes',
        FLAT_AMOUNT: '15.00 USD;10.00 EUR',
        PERCENT_ON_ENHANCEMENTS: '20.00%'
      }];

      // Act
      exportService.searchAndExport({});

      // Assert
      const actualData = spyUtilityService.exportToCSV.calls.mostRecent().args[0];
      expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expectedData));
    });

    it('Should export enterprise templates: Cancellation', () => {
      // Arrange
      contextSettings.configType = CONFIG_TYPE.TEMPLATE;
      contextSettings.policyType = POLICY_TYPE.CANCELLATION;
      const expectedData: IEnterprisePolicyTemplateCancellationCsvModel[] = [
        {
          POLICY_TEMPLATE_NAME: 'Test Canncellation 1 - SAME_DAY',
          POLICY_TEMPLATE_STATUS: 'Active',
          POLICY_TEMPLATE_CODE: '',
          ONLINE_CC_MESSAGE: 'EN_US: "English Message";ES_ES: "SPANISH Message"',
          GDS_MESSAGE: 'GDS Line 1 GDS Line 2',
          CANCELLATION_NOTICE: 'Same Day',
          CANCELLATION_NOTICE_VALUE: '10:00',
          FREE_CANCELLATION: 'No'
        },
        {
          POLICY_TEMPLATE_NAME: 'Test Canncellation 2 - ADVANCE_NOTICE',
          POLICY_TEMPLATE_STATUS: 'Inactive',
          POLICY_TEMPLATE_CODE: '',
          ONLINE_CC_MESSAGE: '',
          GDS_MESSAGE: ' ',
          CANCELLATION_NOTICE: 'Advance Notice',
          CANCELLATION_NOTICE_VALUE: '1 Days+0 Hours',
          FREE_CANCELLATION: 'Yes'
        },
        {
          POLICY_TEMPLATE_NAME: 'Test Canncellation 3 - NON_REFUNDABLE',
          POLICY_TEMPLATE_STATUS: 'Active',
          POLICY_TEMPLATE_CODE: 'TA',
          ONLINE_CC_MESSAGE: 'EN_US: "Just a test message"',
          GDS_MESSAGE: ' ',
          CANCELLATION_NOTICE: 'Non-Refundable',
          CANCELLATION_NOTICE_VALUE: '',
          FREE_CANCELLATION: 'Yes'
        }
      ];

      // Act
      exportService.searchAndExport({});

      // Assert
      const actualData = spyUtilityService.exportToCSV.calls.mostRecent().args[0];
      expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expectedData));
    });

    it('Should export enterprise templates: Guarantee', () => {
      // Arrange
      contextSettings.configType = CONFIG_TYPE.TEMPLATE;
      contextSettings.policyType = POLICY_TYPE.GUARANTEE;
      const expectedData = [
        {
          POLICY_TEMPLATE_NAME: 'Test Template Guarantee 1',
          POLICY_TEMPLATE_STATUS: 'Active',
          POLICY_TEMPLATE_CODE: 'TST 1',
          ONLINE_CC_MESSAGE: '',
          GDS_MESSAGE: ' ',
          ACCEPTED_TENDER: 'Credit Card',
          LATE_ARRIVAL: ''
        },
        {
          POLICY_TEMPLATE_NAME: 'Test Template Guarantee 2',
          POLICY_TEMPLATE_STATUS: 'Active',
          POLICY_TEMPLATE_CODE: 'TST2',
          ONLINE_CC_MESSAGE: 'EN_US: "Testing message"',
          GDS_MESSAGE: 'test gds message ',
          ACCEPTED_TENDER: 'Accept All',
          LATE_ARRIVAL: 'Hold Until 13:00 without payment'
        },
        {
          POLICY_TEMPLATE_NAME: 'Test Template Guarantee 3',
          POLICY_TEMPLATE_STATUS: 'Inactive',
          POLICY_TEMPLATE_CODE: '',
          ONLINE_CC_MESSAGE: 'EN_US: "Guarantee Test"',
          GDS_MESSAGE: ' ',
          ACCEPTED_TENDER: 'IATA',
          LATE_ARRIVAL: ''
        }
      ];

      // Act
      exportService.searchAndExport({});

      // Assert
      const actualData = spyUtilityService.exportToCSV.calls.mostRecent().args[0];
      expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expectedData));
    });

    it('Should export enterprise templates: Deposit', fakeAsync(() => {
      // Arrange
      contextSettings.configType = CONFIG_TYPE.TEMPLATE;
      contextSettings.policyType = POLICY_TYPE.DEPOSIT;
      const expectedData = [
        {
          POLICY_TEMPLATE_NAME: 'Test template Deposit 1 - Credit Card',
          POLICY_TEMPLATE_STATUS: 'Active',
          POLICY_TEMPLATE_CODE: 'CC',
          ONLINE_CC_MESSAGE: 'EN_US: "English Test";ES_ES: "Spainish Test"',
          GDS_MESSAGE: 'gds line 1 gds line 2',
          ACCEPTED_TENDER: 'Credit Card, Alternate Payments',
          DEPOSIT_CONFIGURATION_LABEL: '',
          ENABLED_INSTALLMENTS: 'No'
        },
        {
          POLICY_TEMPLATE_NAME: 'Test template Deposit 2 - IATA',
          POLICY_TEMPLATE_STATUS: 'Inactive',
          POLICY_TEMPLATE_CODE: 'IATA',
          ONLINE_CC_MESSAGE: '',
          GDS_MESSAGE: ' ',
          ACCEPTED_TENDER: 'IATA',
          DEPOSIT_CONFIGURATION_LABEL: '',
          ENABLED_INSTALLMENTS: 'Yes'
        }
      ];

      // Act
      exportService.searchAndExport({});
      tick(); // wait for async function loadDepositRuleListInfo

      // Assert
      const actualData = spyUtilityService.exportToCSV.calls.mostRecent().args[0];
      expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expectedData));
    }));

    it('Should export enterprise policies', () => {
      // Arrange
      contextSettings.configType = CONFIG_TYPE.POLICY;
      const expectedData: IPolicyCsvModel[] = [
        {
          POLICY_NAME: 'Test Enterprise Policy 1',
          POLICY_STATUS: 'Inactive',
          POLICY_DISTRIBUTION: 'Chain',
          POLICY_DISTRIBUTION_DETAILS: '',
          POLICY_TEMPLATE_NAME: 'Test Template',
          POLICY_TYPE: 'Default',
          START_DATE: '',
          END_DATE: '',
          DAY_OF_WEEK: '',
          OVERRIDE_OTHER_POLICIES: 'No'
        },
        {
          POLICY_NAME: 'Test Enterprise Policy 2',
          POLICY_STATUS: 'Active',
          POLICY_DISTRIBUTION: 'Chain Categories',
          POLICY_DISTRIBUTION_DETAILS: 'Test List 1',
          POLICY_TEMPLATE_NAME: 'Test Template',
          POLICY_TYPE: 'Dated',
          START_DATE: '2023-11-02',
          END_DATE: '',
          DAY_OF_WEEK: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
          OVERRIDE_OTHER_POLICIES: 'Yes'
        },
        {
          POLICY_NAME: 'Test Enterprise Policy 3',
          POLICY_STATUS: 'Inactive',
          POLICY_DISTRIBUTION: 'Rate Plans',
          POLICY_DISTRIBUTION_DETAILS: 'Test Meta 2',
          POLICY_TEMPLATE_NAME: 'Test Template',
          POLICY_TYPE: 'Dated',
          START_DATE: '2023-10-01',
          END_DATE: '2023-10-02',
          DAY_OF_WEEK: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
          OVERRIDE_OTHER_POLICIES: 'No'
        },
        {
          POLICY_NAME: 'Test Enterprise Policy 3',
          POLICY_STATUS: 'Inactive',
          POLICY_DISTRIBUTION: 'Rate Plans',
          POLICY_DISTRIBUTION_DETAILS: 'Test Meta 2',
          POLICY_TEMPLATE_NAME: 'Test Template',
          POLICY_TYPE: 'Dated',
          START_DATE: '2023-10-10',
          END_DATE: '2023-10-11',
          DAY_OF_WEEK: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
          OVERRIDE_OTHER_POLICIES: 'No'
        },
        {
          POLICY_NAME: 'Test Enterprise Policy 4',
          POLICY_STATUS: 'Expired',
          POLICY_DISTRIBUTION: 'Rate Categories',
          POLICY_DISTRIBUTION_DETAILS: 'Test Meta 1,Test Meta 2',
          POLICY_TEMPLATE_NAME: 'Test Template',
          POLICY_TYPE: 'Dated',
          START_DATE: '2023-11-02',
          END_DATE: '',
          DAY_OF_WEEK: 'Mon,Tue,Wed,Thu',
          OVERRIDE_OTHER_POLICIES: 'No'
        }
      ];

      // Act
      exportService.searchAndExport({});

      // Assert
      const actualData = spyUtilityService.exportToCSV.calls.mostRecent().args[0];
      expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expectedData));
    });
  });

  describe('Export: Property level', () => {
    beforeEach(() => {
      contextSettings.policyLevel = POLICY_LEVEL.PROPERTY;
    });

    it('Should export property payment deposit configurations', () => {
      // Arrange
      contextSettings.configType = CONFIG_TYPE.DEPOSIT_CONFIGURATION;
      const expectedData: IPropertyDepositConfigurationCsvModel[] = [
        {
          DEPOSIT_CONFIGURATION_NAME: 'DC - Property Owner',
          OWNER_TYPE: 'Property',
          OWNER_CODE: '',
          PERCENT_ON_ENHANCEMENTS: '30.00%',
          PERCENTAGE_AMOUNT: '10.20%',
          FLAT_AMOUNT: '100.05 EUR',
          ARRIVAL_DAY: 'Yes'
        },
        {
          DEPOSIT_CONFIGURATION_NAME: 'DC - Enterprise Owner',
          OWNER_TYPE: 'Enterprise',
          OWNER_CODE: 'AAM',
          PERCENT_ON_ENHANCEMENTS: '11.10%',
          PERCENTAGE_AMOUNT: '',
          FLAT_AMOUNT: '',
          ARRIVAL_DAY: 'Yes'
        }
      ];

      // Act
      exportService.searchAndExport({});

      // Assert
      const actualData = spyUtilityService.exportToCSV.calls.mostRecent().args[0];
      expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expectedData));
    });

    it('Should export property templates: Cancellation', () => {
      // Arrange
      contextSettings.configType = CONFIG_TYPE.TEMPLATE;
      contextSettings.policyType = POLICY_TYPE.CANCELLATION;
      const expectedData: IPropertyPolicyTemplateCancellationCsvModel[] = [
        {
          POLICY_TEMPLATE_NAME: 'template cancellation 1',
          POLICY_TEMPLATE_STATUS: 'Active',
          OWNER_TYPE: 'Property',
          OWNER_CODE: '1001',
          CANCELLATION_NOTICE: 'Non-Refundable',
          CANCELLATION_NOTICE_VALUE: '',
          FREE_CANCELLATION: 'No'
        },
        {
          POLICY_TEMPLATE_NAME: 'template cancellation 2',
          POLICY_TEMPLATE_STATUS: 'Inactive',
          OWNER_TYPE: 'Enterprise',
          OWNER_CODE: 'AAA',
          CANCELLATION_NOTICE: 'Advance Notice',
          CANCELLATION_NOTICE_VALUE: '3 Days+2 Hours',
          FREE_CANCELLATION: 'No'
        },
        {
          POLICY_TEMPLATE_NAME: 'template cancellation 3',
          POLICY_TEMPLATE_STATUS: 'Active',
          OWNER_TYPE: 'Enterprise',
          OWNER_CODE: 'AAA',
          CANCELLATION_NOTICE: 'Same Day',
          CANCELLATION_NOTICE_VALUE: '15:00',
          FREE_CANCELLATION: 'Yes'
        }
      ];

      // Act
      exportService.searchAndExport({});

      // Assert
      const actualData = spyUtilityService.exportToCSV.calls.mostRecent().args[0];
      expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expectedData));

    });

    it('Should export property templates: Guarantee', () => {
      // Arrange
      contextSettings.configType = CONFIG_TYPE.TEMPLATE;
      contextSettings.policyType = POLICY_TYPE.GUARANTEE;
      const expectedData: IPropertyPolicyTemplateGuaranteeCsvModel[] = [
        {
          POLICY_TEMPLATE_NAME: 'template - guarantee 1',
          POLICY_TEMPLATE_STATUS: 'Active',
          OWNER_TYPE: 'Property',
          OWNER_CODE: '1001',
          ACCEPTED_TENDER: 'Corporate ID',
          LATE_ARRIVAL: ''
        },
        {
          POLICY_TEMPLATE_NAME: 'template - guarantee 2',
          POLICY_TEMPLATE_STATUS: 'Active',
          OWNER_TYPE: 'Enterprise',
          OWNER_CODE: 'AAA',
          ACCEPTED_TENDER: 'Accept All',
          LATE_ARRIVAL: 'Hold Until 14:00 without payment'
        },
        {
          POLICY_TEMPLATE_NAME: 'template - guarantee 3',
          POLICY_TEMPLATE_STATUS: 'Inactive',
          OWNER_TYPE: 'Property',
          OWNER_CODE: '1001',
          ACCEPTED_TENDER: 'Credit Card',
          LATE_ARRIVAL: 'Hold Until 14:00 without payment'
        }
      ];

      // Act
      exportService.searchAndExport({});

      // Assert
      const actualData = spyUtilityService.exportToCSV.calls.mostRecent().args[0];
      expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expectedData));

    });

    it('Should export property templates: Deposit', () => {
      // Arrange
      contextSettings.configType = CONFIG_TYPE.TEMPLATE;
      contextSettings.policyType = POLICY_TYPE.DEPOSIT;
      const expectedData: IPropertyPolicyTemplateDepositCsvModel[] = [
        {
          POLICY_TEMPLATE_NAME: 'template deposit 1',
          POLICY_TEMPLATE_STATUS: 'Active',
          OWNER_TYPE: 'Property',
          OWNER_CODE: '1001',
          ACCEPTED_TENDER: 'Credit Card, Alternate Payments',
          DEPOSIT_CONFIGURATION_LABEL: 'DC rule 1',
          ENABLED_INSTALLMENTS: 'Yes'
        },
        {
          POLICY_TEMPLATE_NAME: 'template deposit 2',
          POLICY_TEMPLATE_STATUS: 'Inactive',
          OWNER_TYPE: 'Enterprise',
          OWNER_CODE: 'AAA',
          ACCEPTED_TENDER: 'IATA',
          DEPOSIT_CONFIGURATION_LABEL: 'DC rule 2',
          ENABLED_INSTALLMENTS: 'No'
        }
      ];

      // Act
      exportService.searchAndExport({});

      // Assert
      const actualData = spyUtilityService.exportToCSV.calls.mostRecent().args[0];
      expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expectedData));
    });

    it('Should export property policies', () => {
      // Arrange
      contextSettings.configType = CONFIG_TYPE.POLICY;
      const expectedData: IPolicyCsvModel[] = [
        {
          POLICY_NAME: 'policy 1',
          POLICY_STATUS: 'Inactive',
          POLICY_DISTRIBUTION: 'Property',
          POLICY_DISTRIBUTION_DETAILS: '',
          POLICY_TEMPLATE_NAME: 'policy template 1 (code 1)',
          POLICY_TYPE: 'Default',
          START_DATE: '',
          END_DATE: '',
          DAY_OF_WEEK: '',
          OVERRIDE_OTHER_POLICIES: 'Yes'
        },
        {
          POLICY_NAME: 'policy 2',
          POLICY_STATUS: 'Expired',
          POLICY_DISTRIBUTION: 'Rate Plan',
          POLICY_DISTRIBUTION_DETAILS: 'Test List 1,Test List 2',
          POLICY_TEMPLATE_NAME: 'policy template 2',
          POLICY_TYPE: 'Dated',
          START_DATE: '2023-10-01',
          END_DATE: '2023-10-02',
          DAY_OF_WEEK: 'Mon,Tue,Wed,Thu',
          OVERRIDE_OTHER_POLICIES: 'No'
        },
        {
          POLICY_NAME: 'policy 2',
          POLICY_STATUS: 'Expired',
          POLICY_DISTRIBUTION: 'Rate Plan',
          POLICY_DISTRIBUTION_DETAILS: 'Test List 1,Test List 2',
          POLICY_TEMPLATE_NAME: 'policy template 2',
          POLICY_TYPE: 'Dated',
          START_DATE: '2023-10-03',
          END_DATE: '2023-10-04',
          DAY_OF_WEEK: 'Mon,Tue,Wed,Thu',
          OVERRIDE_OTHER_POLICIES: 'No'
        },
        {
          POLICY_NAME: 'policy 3',
          POLICY_STATUS: 'Inactive',
          POLICY_DISTRIBUTION: 'Rate Category',
          POLICY_DISTRIBUTION_DETAILS: 'Test Meta 1,Test Meta 2',
          POLICY_TEMPLATE_NAME: 'policy template 3',
          POLICY_TYPE: 'Dated',
          START_DATE: '2023-10-26',
          END_DATE: '',
          DAY_OF_WEEK: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
          OVERRIDE_OTHER_POLICIES: 'No'
        }
      ];

      // Act
      exportService.searchAndExport({});

      // Assert
      const actualData = spyUtilityService.exportToCSV.calls.mostRecent().args[0];
      expect(JSON.stringify(actualData)).toEqual(JSON.stringify(expectedData));
    });
  });
});