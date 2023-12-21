import { RulesConfigurationService } from './rules-config.service';
import { TestBed, async } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ContextService } from './context.service';
import { SharedDataService } from './shared.data.service';
import { LIST_CONFIG } from '../search/list/policy-mgmt-list.constant';
import { POLICY_LEVEL, CONFIG_TYPE, POLICY_TYPE } from './constants';
import { TEMPLATE_CONFIG, CREATE_TEMPLATE_STEPS } from '../create/template/policy-mgmt-create-template.constant';
import { ILanguageList } from '../create/template/policy-mgmt-create-template.model';
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TcTranslateService } from 'tc-angular-services';
import { FILTER_CONFIG } from '../search/filter/filter.constant';
import { IPolicyMetadata } from './rules-metadata.model';


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
const deposRuleListJson = require('../../assets-policy-mgmt/data/policy-template/getDepositRules/deposit-rules.json');
class MockSharedDataService {
  getHotelInfo() {
    const langList: Array<ILanguageList> = [
      {
        id: 1,
        name: 'English',
        code: 'EN_US',
      },
      {
        id: 2,
        name: 'Français',
        code: 'FR_FR'
      },
      {
        id: 8,
        name: 'Italiano',
        code: 'IT_IT',
      },
      {
        id: 4,
        name: 'Português',
        code: 'PT_PT',
      },
      {
        id: 38,
        name: 'Bulgarian',
        code: 'BG_BG',
      }
    ];
    const hotelInfo = {
      languageList: langList
    };

    return hotelInfo;
  }
  getMetaData() {
    return MetaData;
  }
  getDepositRulesList() {
    return deposRuleListJson;
  }
  getPolicyMetadata(type: string): Array<IPolicyMetadata> {
    const policyMetadata: IPolicyMetadata = {
      id: 'id',
      referenceId: 'referenceId',
      displayName: 'displayName',
      name: 'Name',
      ratePlans: [],
      list: [],
      selected: true,
      visible: true,
      expanded: true,
      status: 'Active'
    };
    return [policyMetadata];
  }
}

describe('Create Rules-Config-Service Initialized', () => {
  let rulesConfigService: RulesConfigurationService;
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
        {
          provide: SharedDataService,
          useClass: MockSharedDataService
        },
        ContextService,
        RulesConfigurationService,
        TcTranslateService,
        TranslateService
      ]
    });
    rulesConfigService = TestBed.get(RulesConfigurationService);
    contextService = TestBed.get(ContextService);
    sharedDataService = TestBed.get(SharedDataService);
    tcTranslateService = TestBed.get(TcTranslateService);
    translateService = TestBed.get(TranslateService);
    tcTranslateService.initTranslation(translateService);

    contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
    contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
    contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
  }));

  it('Should Create Mock Rules-Configuration Service ', () => {
    expect(rulesConfigService).toBeTruthy();
  });

  it('Should Call getTemplateDetailsConfigData method for Cancellation', () => {
    const rulesData = { ...TEMPLATE_CONFIG['property']['cancellation']['template_details'] };
    const result = rulesConfigService.getTemplateDetailsConfigData(POLICY_LEVEL.PROPERTY,
      POLICY_TYPE.CANCELLATION, CREATE_TEMPLATE_STEPS.TEMPLATE_DETAILS);
    expect(result).toEqual(rulesData);
  });

  it('Should Call getTemplateDetailsConfigData method for Guarantee', () => {
    const rulesData = { ...TEMPLATE_CONFIG['property']['guarantee']['template_details'] };
    const result = rulesConfigService.getTemplateDetailsConfigData(POLICY_LEVEL.PROPERTY,
      POLICY_TYPE.GUARANTEE, CREATE_TEMPLATE_STEPS.TEMPLATE_DETAILS);
    expect(result).toEqual(rulesData);
  });

  it('Should Call getTemplateDetailsConfigData method for Deposit', () => {
    const rulesData = { ...TEMPLATE_CONFIG['property']['deposit']['template_details'] };
    const result = rulesConfigService.getTemplateDetailsConfigData(POLICY_LEVEL.PROPERTY,
      POLICY_TYPE.DEPOSIT, CREATE_TEMPLATE_STEPS.TEMPLATE_DETAILS);
    expect(result).toEqual(rulesData);
  });

  it('Should Call getDistributionMsgConfigData method for Cancellation', () => {
    const rulesData = { ...TEMPLATE_CONFIG['property']['cancellation']['distribution_message'] };
    const result = rulesConfigService.getDistributionMsgConfigData(POLICY_LEVEL.PROPERTY,
      POLICY_TYPE.CANCELLATION, CREATE_TEMPLATE_STEPS.DISTRIBUTION_MESSAGE);
    expect(result).toEqual(rulesData);
  });

  it('Should Call getSearchListConfigData method', () => {
    const ruleData = { ...LIST_CONFIG['property']['template']['cancellation'] };
    const configData = rulesConfigService.getSearchListConfigData(POLICY_LEVEL.PROPERTY,
      CONFIG_TYPE.TEMPLATE, POLICY_TYPE.CANCELLATION);
    expect(configData).toEqual(ruleData);
  });

  it('Should return enterprise cancellation policy filter data', () => {
    contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
    contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
    const ruleData = { ...FILTER_CONFIG['enterprise']['policy'] };
    ruleData.fields.policyLevel = {
      PROPERTY: true,
      RATECATEGORY: false,
      RATEPLAN: false
    };
    const filterConfigData = rulesConfigService.getFilterConfigData(POLICY_LEVEL.ENTERPRISE,
      CONFIG_TYPE.POLICY, POLICY_TYPE.CANCELLATION);
    expect(filterConfigData).toEqual(ruleData);
  });

  it('Should return enterprise deposit policy filter data', () => {
    contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
    contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
    const ruleData = { ...FILTER_CONFIG['enterprise']['policy'] };
    ruleData.fields.policyLevel = {
      PROPERTY: true,
      RATECATEGORY: false,
      RATEPLAN: false
    };
    const filterConfigData = rulesConfigService.getFilterConfigData(POLICY_LEVEL.ENTERPRISE,
      CONFIG_TYPE.POLICY, POLICY_TYPE.DEPOSIT);
    expect(filterConfigData).toEqual(ruleData);
  });

  it('Should return enterprise guarantee policy filter data', () => {
    contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
    contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
    const ruleData = { ...FILTER_CONFIG['enterprise']['policy'] };
    ruleData.fields.policyLevel = {
      PROPERTY: true,
      RATECATEGORY: false,
      RATEPLAN: false
    };
    const filterConfigData = rulesConfigService.getFilterConfigData(POLICY_LEVEL.ENTERPRISE,
      CONFIG_TYPE.POLICY, POLICY_TYPE.GUARANTEE);
    expect(filterConfigData).toEqual(ruleData);
  });

  it('should return enterprise policy data on getFilterConfigData', () => {
    contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
    contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
    const expectedConfigData = { ...FILTER_CONFIG['enterprise']['policy'] };
    const configData = rulesConfigService.getFilterConfigData(POLICY_LEVEL.ENTERPRISE, CONFIG_TYPE.POLICY, POLICY_TYPE.CANCELLATION);
    expect(configData).toEqual(expectedConfigData);
  });

  it('Enterprise Templates - Should Call getFilterConfigData method for Cancellation', () => {
    // Arrange
    contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
    contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
    contextService.setPolicyType(POLICY_TYPE.CANCELLATION);

    const rulesData = { ...FILTER_CONFIG['enterprise']['template']['cancellation'] };

    // Act
    const result = rulesConfigService.getFilterConfigData(
      POLICY_LEVEL.ENTERPRISE,
      CONFIG_TYPE.TEMPLATE,
      POLICY_TYPE.CANCELLATION);

    // Assert
    expect(result).toEqual(rulesData);
  });

  it('Enterprise Templates - Should Call getFilterConfigData method for guarantee', () => {
    // Arrange
    contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
    contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
    contextService.setPolicyType(POLICY_TYPE.GUARANTEE);

    const rulesData = { ...FILTER_CONFIG['enterprise']['template']['guarantee'] };

    // Act
    const result = rulesConfigService.getFilterConfigData(
      POLICY_LEVEL.ENTERPRISE,
      CONFIG_TYPE.TEMPLATE,
      POLICY_TYPE.GUARANTEE);

    // Assert
    expect(result).toEqual(rulesData);
  });

  it('Enterprise Templates - Should Call getFilterConfigData method for deposit', () => {
    // Arrange
    contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
    contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
    contextService.setPolicyType(POLICY_TYPE.DEPOSIT);

    const rulesData = { ...FILTER_CONFIG['enterprise']['template']['deposit'] };

    // Act
    const result = rulesConfigService.getFilterConfigData(
      POLICY_LEVEL.ENTERPRISE,
      CONFIG_TYPE.TEMPLATE,
      POLICY_TYPE.DEPOSIT);

    // Assert
    expect(result).toEqual(rulesData);
  });

  it('The filter config of a property policy template deposit should be a property policy template deposit', () => {
    // Arrange
    contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
    contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
    contextService.setPolicyType(POLICY_TYPE.DEPOSIT);

    const rulesData = { ...FILTER_CONFIG['property']['template']['deposit'] };

    // Act
    const result = rulesConfigService.getFilterConfigData(
      POLICY_LEVEL.PROPERTY,
      CONFIG_TYPE.TEMPLATE,
      POLICY_TYPE.DEPOSIT);

    // Assert
    expect(result).toEqual(rulesData);
  });

  it('The filter config of a property deposit configuration should be a property deposit configuration', () => {
    // Arrange
    contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
    contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);

    const rulesData = { ...FILTER_CONFIG['property']['payment-deposit-rule'] };

    // Act
    const result = rulesConfigService.getFilterConfigData(
      POLICY_LEVEL.PROPERTY,
      CONFIG_TYPE.DEPOSIT_CONFIGURATION,
      undefined);

    // Assert
    expect(result).toEqual(rulesData);
  });

  it('The filter config of a property policy should be a property policy', () => {
    // Arrange
    contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
    contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);

    const rulesData = { ...FILTER_CONFIG['property']['policy'] };

    // Act
    const result = rulesConfigService.getFilterConfigData(
      POLICY_LEVEL.PROPERTY,
      CONFIG_TYPE.POLICY,
      undefined);

    // Assert
    expect(result).toEqual(rulesData);
  });

  it('The filter config of an enterprise deposit configuration should be an enterprise deposit configuration', () => {
    // Arrange
    contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
    contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);

    const rulesData = { ...FILTER_CONFIG['enterprise']['payment-deposit-rule'] };

    // Act
    const result = rulesConfigService.getFilterConfigData(
      POLICY_LEVEL.ENTERPRISE,
      CONFIG_TYPE.DEPOSIT_CONFIGURATION,
      undefined);

    // Assert
    expect(result).toEqual(rulesData);
  });

  it('The filter config of an enterprise policy should be an enterprise policy', () => {
    // Arrange
    contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
    contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);

    const rulesData = { ...FILTER_CONFIG['enterprise']['policy'] };

    // Act
    const result = rulesConfigService.getFilterConfigData(
      POLICY_LEVEL.ENTERPRISE,
      CONFIG_TYPE.POLICY,
      undefined);

    // Assert
    expect(result).toEqual(rulesData);
  });


  it('getPolicyLevelConfigData Should return IPolicyLevelRulesData with chain category list when policy level is Enterprise', () => {
    // Arrange
    contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);

    // Act
    const result = rulesConfigService.getPolicyLevelConfigData(POLICY_LEVEL.ENTERPRISE, 'policy_level');

    // Assert
    expect(result.data.chainCategoryList).toEqual(sharedDataService.getPolicyMetadata('ANY'));
  });
});
