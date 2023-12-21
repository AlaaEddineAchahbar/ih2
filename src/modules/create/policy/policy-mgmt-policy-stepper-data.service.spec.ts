import { TestBed, async } from '@angular/core/testing';
import { ContextService } from '../../core/context.service';
import { RulesConfigurationService } from '../../core/rules-config.service';
import { PolicyMgmtPolicyStepperDataService } from './policy-mgmt-policy-stepper-data.service';
import { SharedDataService } from '../../core/shared.data.service';
import { RulesMataDataService } from '../../core/rules-meta-data.service';
import { IRulesMetaData, IPolicyMetadata, IRuleCriteriaMember } from '../../core/rules-metadata.model';
import {
  IPolicyResponseModel, IPolicyLevelParams, IPolicyLevelRulesData, IPolicyDetailsRulesData, IPolicyDetailsParams
} from './policy-mgmt-create-policy.model';
import { ENTERPRISE_POLICY_CREATION_LEVEL, PROPERTY_POLICY_CREATION_LEVEL } from '../../core/rules-config.constant';
import {
  OPERATION_TYPES, RULE_STATUS,
  POLICY_METADATA_TYPE, DEFAULT_DATED_POLICY_TYPE, RULE_CRITERIA_MEMBER_NAMES
} from '../../core/rules.constant';
import { CREATE_POLICY_STEPS, POLICY_CONFIG } from './policy-mgmt-create-policy.constant';
import { POLICY_LEVEL, POLICY_FLOW, POLICY_TYPE } from '../../core/constants';
import { PolicyMgmtUtilityService } from '../../core/utility.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TcTranslateService } from 'tc-angular-services';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { PolicyMgmtStepPolicyDetailsService } from './policy-details/policy-mgmt-step-policy-details.service';

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

const rulesMetaDataJson: IRulesMetaData = require('../../../assets-policy-mgmt/data/rulesData/rules-metadata-test-case.json');
const templateDropdownJson: Array<IPolicyMetadata> = require('../../../assets-policy-mgmt/data/formatted-template-dropdown.json');
const ratePlanDropdownJson: Array<IPolicyMetadata> = require('../../../assets-policy-mgmt/data/formatted-rateplan-dropdown.json');
const rateCategoryDropdownJson: Array<IPolicyMetadata> = require('../../../assets-policy-mgmt/data/formatted-ratecategory-dropdown.json');

export class MockPolicyMgmtStepPolicyDetailsService {
  getTemplateListItem() {
    return {
      id: '123',
      name: 'Test template',
      status: 'Active'
    };
  }
}

export class MockSharedDataService {
  rulesMetaData: IRulesMetaData;

  getHotelInfo() {
    return {
      hotelCode: 6938
    };
  }

  setRulesMetaData(data: IRulesMetaData) {
    this.rulesMetaData = data;
  }

  getRulesMetaData() {
    return rulesMetaDataJson;
  }

  getPolicyMetadata(type: string): any {
    switch (type) {
      case POLICY_METADATA_TYPE.rateCategory:
        return rateCategoryDropdownJson;
      case POLICY_METADATA_TYPE.ratePlan:
        return ratePlanDropdownJson;
      case POLICY_METADATA_TYPE.template:
        return templateDropdownJson;
      default:
        return ratePlanDropdownJson;
    }
  }
  getChainInfo() {
    return {
      chainHotels: [{
        hotelCode: 12094
      }],
      chainId: 123
    };
  }
}

const policyResponseModelData: IPolicyResponseModel = {
  groupname: 'Test Policy',
  level: PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN,
  operation: OPERATION_TYPES.create,
  policyTemplateName: 'Policy test template',
  rules: [
    {
      activeStatus: RULE_STATUS.ACTIVE,
      ruleLogic: 'ALL',
      ruleEndDate: '2020-07-16',
      ruleStartDate: '2020-07-14',
      uniqueTypeID: 1,
      ruleName: 'Test Policy',
      rulePriority: 1,
      ruleTypeID: 12345,
      uniqueID: 1111,
      auxId: 1234,
      auxType: '',
      ruleDecisions: [
        {
          ruleDecisionModifiers: [
            {
              ruleDecisionTypeModifierID: 1089,
              modifierValue: 'PROPERTY'
            },
            {
              ruleDecisionTypeModifierID: 1091,
              modifierValue: false
            }
          ],
          ruleDecisionOrder: 1,
          ruleDecisionTypeID: 1024,
          ruleDecisionValue: 1229488
        }
      ],
      ruleCriteriaParameters: [
        {
          operatorID: 1004,
          ruleCriteriaID: 1002,
          ruleCriteriaMemberID: 1002,
          ruleCriteriaParameterValue: '2020-07-14/2020-07-16,2020-07-20/2020-07-25'
        },
        {
          operatorID: 11,
          ruleCriteriaID: 1020,
          ruleCriteriaMemberID: 1020,
          ruleCriteriaParameterValue: '1,2,3'
        }
      ]
    },
    {
      activeStatus: RULE_STATUS.ACTIVE,
      ruleLogic: 'ALL',
      ruleEndDate: '2020-07-16',
      ruleStartDate: '2020-07-14',
      uniqueTypeID: 1,
      ruleName: 'Test Policy',
      rulePriority: 1,
      ruleTypeID: 12345,
      uniqueID: 3333,
      auxId: 1234,
      auxType: '',
      ruleDecisions: [
        {
          ruleDecisionModifiers: [
            {
              ruleDecisionTypeModifierID: 1089,
              modifierValue: 'PROPERTY'
            },
            {
              ruleDecisionTypeModifierID: 1091,
              modifierValue: false
            }
          ],
          ruleDecisionOrder: 1,
          ruleDecisionTypeID: 1024,
          ruleDecisionValue: 1229488
        }
      ],
      ruleCriteriaParameters: [
        {
          operatorID: 1004,
          ruleCriteriaID: 1002,
          ruleCriteriaMemberID: 1002,
          ruleCriteriaParameterValue: '2020-07-14/2020-07-16,2020-07-20/2020-07-25'
        },
        {
          operatorID: 11,
          ruleCriteriaID: 1020,
          ruleCriteriaMemberID: 1020,
          ruleCriteriaParameterValue: '1,2,3'
        }
      ]
    }
  ]
};

describe('Policy Stepper Data Service', () => {
  let instance: PolicyMgmtPolicyStepperDataService;

  const spyRulesConfigService = jasmine.createSpyObj('RulesConfigurationService',
    ['getPolicyDetailsConfigData', 'getPolicyLevelConfigData']);

  let sharedDataService: SharedDataService;
  let contextService: ContextService;
  let rulesMetadataService: RulesMataDataService;

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
        PolicyMgmtPolicyStepperDataService,
        ContextService,
        {
          provide: RulesConfigurationService,
          useValue: spyRulesConfigService
        },
        {
          provide: SharedDataService,
          useClass: MockSharedDataService
        },
        {
          provide: PolicyMgmtStepPolicyDetailsService,
          useClass: MockPolicyMgmtStepPolicyDetailsService
        },
        RulesMataDataService,
        PolicyMgmtUtilityService,
        TcTranslateService,
        TranslateService
      ]
    }).compileComponents()
      .then(() => {
        instance = TestBed.get(PolicyMgmtPolicyStepperDataService);
        sharedDataService = TestBed.get(SharedDataService);
        contextService = TestBed.get(ContextService);
        rulesMetadataService = TestBed.inject(RulesMataDataService);
        instance.rulesList = [];
      });
  }));

  it('should initialize Policy stepper data service', () => {
    expect(instance).toBeTruthy();
    expect(instance).toBeDefined();
  });

  it('should create Policy Response Model', () => {
    instance.createPolicyResponseModel();
    expect(instance.policyResponseModel).toBeTruthy();
  });

  it('should set and return Policy response model - getter|setter functions', () => {
    instance.setPolicyResponseModel(policyResponseModelData);
    expect(instance.policyResponseModel).toBeDefined();
    expect(instance.policyResponseModel.groupname).toEqual('Test Policy');
    const requestData = instance.getPolicyResponseModel();
    expect(requestData.groupname).toEqual('Test Policy');
  });


  describe('Step1 - Policy Level Rules data  - getter function', () => {
    let rulesData: IPolicyLevelRulesData;
    let sampleData: IPolicyResponseModel;
    beforeEach(() => {
      sampleData = JSON.parse(JSON.stringify(policyResponseModelData));
      rulesData = { ...POLICY_CONFIG[POLICY_LEVEL.PROPERTY][CREATE_POLICY_STEPS.POLICY_LEVEL] };
      const rateCategories: Array<IPolicyMetadata> = [
        { id: '693801', name: 'RACK' },
        { id: '693802', name: 'PROMOTIONAL' }
      ];
      const ratePlans: Array<IPolicyMetadata> = [
        {
          id: '01',
          name: 'RACK',
          list: [
            { id: '1111', name: 'Test Rate1' },
            { id: '2222', name: 'Test Rate2' }
          ]
        }
      ];
      rulesData.data.ratePlanList = ratePlans;
      rulesData.data.rateCategoryList = rateCategories;
    });

    it('should return PROPERTY Level Policy rules data', () => {
      sampleData.level = PROPERTY_POLICY_CREATION_LEVEL.PROPERTY;
      sampleData.rules[0].uniqueID = 6938;
      instance.setPolicyResponseModel(sampleData);

      spyRulesConfigService.getPolicyLevelConfigData.and.returnValue(rulesData);
      const policyLevelRulesData = instance.getPolicyLevelData();
      expect(policyLevelRulesData.fields.policyLevel).toBe(PROPERTY_POLICY_CREATION_LEVEL.PROPERTY);
    });

    it('should return RATE PLAN Level Policy rules data', () => {
      sampleData.level = PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN;
      sampleData.rules[0].uniqueID = 1111;
      instance.setPolicyResponseModel(sampleData);

      spyRulesConfigService.getPolicyLevelConfigData.and.returnValue(rulesData);
      const policyLevelRulesData = instance.getPolicyLevelData();
      expect(policyLevelRulesData.fields.policyLevel).toBe(PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN);
    });

    it('should return RATE CATEGORY Level Policy rules data', () => {
      sampleData.level = PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY;
      sampleData.rules[0].uniqueID = 693801;
      instance.setPolicyResponseModel(sampleData);

      spyRulesConfigService.getPolicyLevelConfigData.and.returnValue(rulesData);
      const policyLevelRulesData = instance.getPolicyLevelData();
      expect(policyLevelRulesData.fields.policyLevel).toBe(PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY);
    });

    it('should return ENTERPRISE RATE CATEGORY Level Policy rules data', () => {
      sampleData.level = ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY;
      sampleData.emRateCategoryIds = ['693801'];
      instance.setPolicyResponseModel(sampleData);

      spyRulesConfigService.getPolicyLevelConfigData.and.returnValue(rulesData);
      const policyLevelRulesData = instance.getPolicyLevelData();
      expect(policyLevelRulesData.fields.policyLevel).toBe(ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY);
    });

    it('should return RATE CATALOG Level Policy rules data', () => {
      sampleData.level = ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG;
      sampleData.rateCatalogIds = ['693801'];
      instance.setPolicyResponseModel(sampleData);

      spyRulesConfigService.getPolicyLevelConfigData.and.returnValue(rulesData);
      const policyLevelRulesData = instance.getPolicyLevelData();
      expect(policyLevelRulesData.fields.policyLevel).toBe(ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG);
    });

    it('should return ENTERPRISE Level Policy rules data', () => {
      sampleData.level = ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
      sampleData.chainCategoryIds = ['693801'];
      instance.setPolicyResponseModel(sampleData);

      spyRulesConfigService.getPolicyLevelConfigData.and.returnValue(rulesData);
      const policyLevelRulesData = instance.getPolicyLevelData();
      expect(policyLevelRulesData.fields.policyLevel).toBe(ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE);
    });
  });

  describe('Step1 - Policy Level Rules data  - setter function (CREATE FLOW)', () => {
    const rulesData: IPolicyLevelParams = {
      policyLevel: PROPERTY_POLICY_CREATION_LEVEL.PROPERTY,
      ratePlans: [{
        id: '01',
        name: 'RACK',
        list: [
          { id: '1111', name: 'Test Rate1', selected: true },
          { id: '2222', name: 'Test Rate2' }
        ]
      }],
      rateCategories: [
        { id: '693801', name: 'RACK', visible: true },
        { id: '693802', name: 'PROMOTIONAL' }
      ],
      chainCategories: [{
        id: '01',
        name: 'RACK',
        list: [
          { id: '1111', name: 'Test Rate1', selected: true },
          { id: '2222', name: 'Test Rate2' }
        ]
      }]
    };
    beforeEach(() => {
      instance.createPolicyResponseModel();
    });

    it('should set PROPERTY level policyResponse model', () => {
      instance.rulesList = [];
      instance.setPolicyLevelData(rulesData);
      expect(instance.policyResponseModel.level).toEqual(PROPERTY_POLICY_CREATION_LEVEL.PROPERTY);
      const ruleList = [{
        id: 6938
      }];
      expect(instance.rulesList[0].id).toEqual(ruleList[0].id);
    });

    it('should set RATE PLAN level policyResponse model', () => {
      const testRulesData = { ...rulesData };
      testRulesData.policyLevel = PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN;
      instance.rulesList = [];
      instance.setPolicyLevelData(testRulesData);
      expect(instance.policyResponseModel.level).toEqual(PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN);
      const ruleList = [
        { id: 1111 }
      ];
      expect(instance.rulesList[0].id).toEqual(ruleList[0].id);
    });

    it('should set RATE CATEGORY level policyResponse model', () => {
      //Arrange
      const testRulesData = { ...rulesData };
      testRulesData.policyLevel = PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY;
      instance.rulesList = [];

      //Act
      instance.setPolicyLevelData(testRulesData);

      //Assert
      expect(instance.policyResponseModel.level).toEqual(PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY);
      const ruleList = [
        { id: 693801 }
      ];
      expect(instance.rulesList[0].id).toEqual(ruleList[0].id);
    });

    it('should set RATE CATALOG level policyResponse model', () => {
      //Arrange
      const testRulesData = { ...rulesData };
      testRulesData.ratePlans = testRulesData.rateCategories;
      testRulesData.policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG;
      instance.rulesList = [];

      //Act
      instance.setPolicyLevelData(testRulesData);

      //Assert
      expect(instance.policyResponseModel.level).toEqual(ENTERPRISE_POLICY_CREATION_LEVEL.RATE_CATALOG);
      const ruleList = [
        { id: 693801 }
      ];
      expect(instance.rulesList[0].id).toEqual(ruleList[0].id);
    });

    it('should set EM RATE CATEGORY level policyResponse model', () => {
      //Arrange
      const testRulesData = { ...rulesData };
      testRulesData.policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY;
      instance.rulesList = [];

      //Act
      instance.setPolicyLevelData(testRulesData);

      //Assert
      expect(instance.policyResponseModel.level).toEqual(ENTERPRISE_POLICY_CREATION_LEVEL.EM_RATE_CATEGORY);
      const ruleList = [
        { id: 693801 }
      ];
      expect(instance.rulesList[0].id).toEqual(ruleList[0].id);
    });

    it('should set CHAIN CATEGORY level policyResponse model', () => {
      //Arrange
      const testRulesData = { ...rulesData };
      testRulesData.policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
      instance.rulesList = [];

      //Act
      instance.setPolicyLevelData(testRulesData, true);

      //Assert
      expect(instance.policyResponseModel.level).toEqual(ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE);
      const ruleList = [
        { id: 123 }
      ];
      expect(instance.rulesList[0].id).toEqual(ruleList[0].id);
      expect(instance.rulesList.length).toEqual(1);
    });

    it('should set CHAIN level policyResponse model', () => {
      //Arrange
      const testRulesData = { ...rulesData };
      testRulesData.policyLevel = ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
      instance.rulesList = [];

      //Act
      instance.setPolicyLevelData(testRulesData);

      //Assert
      expect(instance.policyResponseModel.level).toEqual(ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE);
      const ruleList = [
        { id: 123 }
      ];
      expect(instance.rulesList[0].id).toEqual(ruleList[0].id);
      expect(instance.rulesList.length).toEqual(1);
      expect(instance.policyResponseModel.chainCategoryIds).toEqual([]);
    });
  });

  describe('Step1 - Policy Level Rules data  - setter function (EDIT FLOW)', () => {
    let editPolicyRsponse: IPolicyResponseModel;
    const rulesData: IPolicyLevelParams = {
      policyLevel: PROPERTY_POLICY_CREATION_LEVEL.PROPERTY,
      ratePlans: [{
        id: '01',
        name: 'RACK',
        list: [
          { id: '1111', name: 'Test Rate1', selected: true },
          { id: '2222', name: 'Test Rate2', selected: true },
          { id: '3333', name: 'Test Rate3' }
        ]
      }],
      rateCategories: [
        { id: '693801', name: 'RACK', visible: true },
        { id: '693802', name: 'PROMOTIONAL', visible: true },
        { id: '693803', name: 'DISCOUNT' }
      ],
      chainCategories: []
    };

    beforeEach(() => {
      editPolicyRsponse = JSON.parse(JSON.stringify(policyResponseModelData));
      spyOnProperty(contextService, 'policyFlow', 'get').and.returnValue(POLICY_FLOW.EDIT);
    });

    it('should set PROPERTY level policyResponse model', () => {
      editPolicyRsponse.level = PROPERTY_POLICY_CREATION_LEVEL.PROPERTY;
      editPolicyRsponse.operation = OPERATION_TYPES.update;
      editPolicyRsponse.rules[0].uniqueID = 6938;
      instance.setPolicyResponseModel(editPolicyRsponse);

      instance.setPolicyLevelData(rulesData);
      expect(instance.policyResponseModel.level).toEqual(PROPERTY_POLICY_CREATION_LEVEL.PROPERTY);
      const ruleList = [{
        id: 6938
      }];
      expect(instance.rulesList[0].id).toEqual(ruleList[0].id);
    });

    it('should set RATE PLAN level policyResponse model', () => {
      editPolicyRsponse.level = PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN;
      editPolicyRsponse.operation = OPERATION_TYPES.update;

      editPolicyRsponse.rules[0].uniqueID = 1111;
      editPolicyRsponse.rules[1].uniqueID = 3333;
      instance.setPolicyResponseModel(editPolicyRsponse);

      contextService.setPolicyFlow(POLICY_FLOW.EDIT);
      const testRulesData = { ...rulesData };
      testRulesData.policyLevel = PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN;
      instance.setPolicyLevelData(testRulesData);
      expect(instance.policyResponseModel.level).toEqual(PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN);
    });

    it('should set RATE CATEGORY level policyResponse model', () => {
      editPolicyRsponse.level = PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY;
      editPolicyRsponse.operation = OPERATION_TYPES.update;
      editPolicyRsponse.rules[0].uniqueID = 693801;
      editPolicyRsponse.rules[1].uniqueID = 693803;
      instance.setPolicyResponseModel(editPolicyRsponse);

      contextService.setPolicyFlow(POLICY_FLOW.EDIT);
      const testRulesData = { ...rulesData };
      testRulesData.policyLevel = PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY;
      instance.setPolicyLevelData(testRulesData);
      expect(instance.policyResponseModel.level).toEqual(PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY);
    });
  });

  describe('Step2 - Policy Details Rules data  - getter function', () => {
    let rulesData: IPolicyDetailsRulesData;
    let sampleData: IPolicyResponseModel;
    beforeEach(() => {
      sampleData = JSON.parse(JSON.stringify(policyResponseModelData));
      rulesData = { ...POLICY_CONFIG[POLICY_LEVEL.PROPERTY][CREATE_POLICY_STEPS.POLICY_DETAILS] };
    });

    it('should return PROPERTY Level Policy rules data', () => {
      sampleData.level = PROPERTY_POLICY_CREATION_LEVEL.PROPERTY;
      instance.setPolicyResponseModel(sampleData);

      spyRulesConfigService.getPolicyDetailsConfigData.and.returnValue(rulesData);
      const policyDetailsRulesData = instance.getPolicyDetailsData();
      expect(policyDetailsRulesData.fields.policyName).toBe('Test Policy');
      expect(policyDetailsRulesData.fields.ruleStartDate).toBeTruthy();
    });

    it('should return RATE PLAN Level Policy rules data', () => {
      sampleData.level = PROPERTY_POLICY_CREATION_LEVEL.RATE_PLAN;
      instance.setPolicyResponseModel(sampleData);

      spyRulesConfigService.getPolicyDetailsConfigData.and.returnValue(rulesData);
      const policyDetailsRulesData = instance.getPolicyDetailsData();
      expect(policyDetailsRulesData.fields.policyName).toBe('Test Policy');
      expect(policyDetailsRulesData.fields.policyType).toBeTruthy();
    });

    it('should return RATE CATEGORY Level Policy rules data', () => {
      sampleData.level = PROPERTY_POLICY_CREATION_LEVEL.RATE_CATEGORY;
      instance.setPolicyResponseModel(sampleData);

      spyRulesConfigService.getPolicyDetailsConfigData.and.returnValue(rulesData);
      const policyDetailsRulesData = instance.getPolicyDetailsData();
      expect(policyDetailsRulesData.fields.policyName).toBe('Test Policy');
    });
  });

  describe('Step2 - Policy details Rules data  - setter function', () => {
    let policyResponse: IPolicyResponseModel;
    const rulesData: IPolicyDetailsParams = {
      policyName: 'Test Policy',
      dateRange: [
        { startDate: '2020-07-14', endDate: '2020-07-16' },
        { startDate: '2020-07-20', endDate: '2020-07-25' }
      ],
      dayOfWeek: {
        MON: true,
        TUE: true,
        WED: false,
        THU: false,
        FRI: false,
        SAT: false,
        SUN: true
      },
      overridePolicies: true,
      policyTemplate: '1229488',
      policyType: DEFAULT_DATED_POLICY_TYPE.dated,
      ruleStartDate: '2020-07-14',
      auxId: 123,
      auxType: ''
    };

    const ruleCriterias: IRuleCriteriaMember[] = [
      {
        ruleCriteriaID: 0,
        ruleCriteriaMemberID: 0,
        operatorTypeID: 0,
        criteriaMemberNames: RULE_CRITERIA_MEMBER_NAMES.hotelIds
      },
      {
        ruleCriteriaID: 0,
        ruleCriteriaMemberID: 0,
        operatorTypeID: 0,
        criteriaMemberNames: RULE_CRITERIA_MEMBER_NAMES.chainCategories
      },
      {
        ruleCriteriaID: 0,
        ruleCriteriaMemberID: 0,
        operatorTypeID: 0,
        criteriaMemberNames: RULE_CRITERIA_MEMBER_NAMES.dateRange
      },
      {
        ruleCriteriaID: 0,
        ruleCriteriaMemberID: 0,
        operatorTypeID: 0,
        criteriaMemberNames: RULE_CRITERIA_MEMBER_NAMES.dayOfWeek
      }
    ];

    beforeEach(() => {
      policyResponse = JSON.parse(JSON.stringify(policyResponseModelData));
      spyOnProperty(contextService, 'policyFlow', 'get').and.returnValue(POLICY_FLOW.EDIT);
      spyOnProperty(contextService, 'policyType', 'get').and.returnValue(POLICY_TYPE.CANCELLATION);
    });

    it('should set PROPERTY level policyResponse model', () => {
      spyOnProperty(contextService, 'policyLevel', 'get').and.returnValue(POLICY_LEVEL.PROPERTY);
      policyResponse.level = PROPERTY_POLICY_CREATION_LEVEL.PROPERTY;
      policyResponse.operation = OPERATION_TYPES.update;
      policyResponse.rules[0].uniqueID = 6938;
      instance.setPolicyResponseModel(policyResponse);

      instance.setPolicyDetailsData(rulesData);
      expect(instance.policyResponseModel.level).toEqual(PROPERTY_POLICY_CREATION_LEVEL.PROPERTY);
    });

    it('should set ruleCriteria parameter for CHAIN in policyResponse model', () => {
      //Arrange
      spyOnProperty(contextService, 'policyLevel', 'get').and.returnValue(POLICY_LEVEL.ENTERPRISE);
      policyResponse.level = ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
      policyResponse.operation = OPERATION_TYPES.create;
      policyResponse.rules[0].uniqueID = 6938;
      instance.setPolicyResponseModel(policyResponse);
      spyOn(rulesMetadataService, 'getRuleCriteriaMemberDataByRuleTypeId').and.returnValues(ruleCriterias);

      //Act
      instance.setPolicyDetailsData(rulesData);

      //Assert
      expect(instance.policyResponseModel.rules[0].ruleCriteriaParameters[0]).toEqual({
        operatorID: undefined,
        ruleCriteriaID: jasmine.any(Number),
        ruleCriteriaMemberID: jasmine.any(Number),
        ruleCriteriaParameterValue: sharedDataService.getChainInfo().chainHotels.map(itm => itm.hotelCode).join(',')
      });
    });

    it('should set ruleCriteria parameter for CHAINCATEGORY in policyResponse model', () => {
      //Arrange
      spyOnProperty(contextService, 'policyLevel', 'get').and.returnValue(POLICY_LEVEL.ENTERPRISE);
      policyResponse.level = ENTERPRISE_POLICY_CREATION_LEVEL.ENTERPRISE;
      policyResponse.operation = OPERATION_TYPES.create;
      policyResponse.rules[0].uniqueID = 6938;
      policyResponse.chainCategoryIds = ['189', '124'];
      instance.setPolicyResponseModel(policyResponse);
      spyOn(rulesMetadataService, 'getRuleCriteriaMemberDataByRuleTypeId').and.returnValues(ruleCriterias);

      //Act
      instance.setPolicyDetailsData(rulesData);

      //Assert
      expect(instance.policyResponseModel.rules[0].ruleCriteriaParameters[0]).toEqual({
        operatorID: undefined,
        ruleCriteriaID: jasmine.any(Number),
        ruleCriteriaMemberID: jasmine.any(Number),
        ruleCriteriaParameterValue: policyResponse.chainCategoryIds.join(',')
      });
    });
  });
});
